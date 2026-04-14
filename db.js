const { Pool } = require('pg');
const crypto = require('crypto');

// Determine connection string: Local fallback vs Railway Env
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  ssl: (connectionString && !connectionString.includes('localhost')) ? { rejectUnauthorized: false } : false
});

if (!connectionString) {
  console.warn('⚠️  DATABASE_URL is not set. Defaulting to localhost:5432 (Development only)');
}

// -- Database Initialization Logic with Retries --
const initDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS pending_users (
            id UUID PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL
          )
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS user_data (
            user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            profile JSONB NOT NULL DEFAULT '{}',
            srs_cards JSONB NOT NULL DEFAULT '{}',
            bookmarks JSONB NOT NULL DEFAULT '[]',
            chat_history JSONB NOT NULL DEFAULT '{}',
            last_synced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query('COMMIT');
        console.log('✅ PostgreSQL Tables Initialized / Verified.');
        return; // Success
      } catch (err) {
        if (client) await client.query('ROLLBACK');
        throw err;
      } finally {
        if (client) client.release();
      }
    } catch (err) {
      console.error(`❌ DB Connection Attempt ${i+1}/${retries} failed:`, err.message);
      if (i === retries - 1) throw err;
      // Wait 3 seconds before next retry
      await new Promise(res => setTimeout(res, 3000));
    }
  }
};

// Start Init
initDB().catch(err => console.error('CRITICAL: DB Initialization Failed', err));

// -- Async ORM Exports --
module.exports = {
  // Connection Pool for custom queries if needed
  pool,

  getUserByUsername: async (username) => {
    const res = await pool.query('SELECT * FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    return res.rows[0];
  },

  getUserByEmail: async (email) => {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  },

  createUser: async (id, email, username, passwordHash, salt) => {
    await pool.query(
      'INSERT INTO users (id, email, username, password_hash, salt) VALUES ($1, $2, $3, $4, $5)',
      [id, email, username, passwordHash, salt]
    );
  },

  // -- Pending Registrations --
  savePendingUser: async (id, email, username, passwordHash, salt, code) => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry
    // Upsert equivalent: Delete old attempts first
    await pool.query('DELETE FROM pending_users WHERE email = $1', [email]);
    await pool.query(
      'INSERT INTO pending_users (id, email, username, password_hash, salt, code, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, email, username, passwordHash, salt, code, expiresAt]
    );
  },

  getPendingUser: async (email) => {
    const res = await pool.query('SELECT * FROM pending_users WHERE email = $1 AND expires_at > NOW()', [email]);
    return res.rows[0];
  },

  deletePendingUser: async (email) => {
    await pool.query('DELETE FROM pending_users WHERE email = $1', [email]);
  },

  // -- Auth Helpers --
  hashPassword: (password, salt) => {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  },
  generateSalt: () => {
    return crypto.randomBytes(16).toString('hex');
  },

  // -- Profile & Sync Data --
  getUserData: async (userId) => {
    const res = await pool.query('SELECT * FROM user_data WHERE user_id = $1', [userId]);
    return res.rows[0];
  },

  createUserData: async (userId, profile, srsCards, bookmarks) => {
    // profile, srsCards, bookmarks are passed as JSON strings from old legacy code, 
    // we should parse them to store as proper JSONB
    const profileObj = typeof profile === 'string' ? JSON.parse(profile) : profile;
    const srsObj = typeof srsCards === 'string' ? JSON.parse(srsCards) : srsCards;
    const bkmkObj = typeof bookmarks === 'string' ? JSON.parse(bookmarks) : bookmarks;

    await pool.query(
      'INSERT INTO user_data (user_id, profile, srs_cards, bookmarks) VALUES ($1, $2, $3, $4)',
      [userId, profileObj, srsObj, bkmkObj]
    );
  },

  updateUserData: async (userId, profile, srsCards, chatHistory, bookmarks) => {
    const res = await pool.query('SELECT user_id FROM user_data WHERE user_id = $1', [userId]);
    if (res.rowCount === 0) {
      // Logic for new user data if not exists (should have been created on signup, but safety first)
      await pool.query('INSERT INTO user_data (user_id) VALUES ($1)', [userId]);
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (profile) { updates.push(`profile = $${idx++}`); values.push(profile); }
    if (srsCards) { updates.push(`srs_cards = $${idx++}`); values.push(srsCards); }
    if (chatHistory) { updates.push(`chat_history = $${idx++}`); values.push(chatHistory); }
    if (bookmarks) { updates.push(`bookmarks = $${idx++}`); values.push(bookmarks); }
    
    values.push(userId);
    const userIdIdx = idx;

    if (updates.length > 0) {
      await pool.query(
        `UPDATE user_data SET ${updates.join(', ')}, last_synced = NOW() WHERE user_id = $${userIdIdx}`,
        values
      );
    }
  },

  getLeaderboard: async (limit = 5) => {
    // In PG, we can query nested JSONB fields!
    const res = await pool.query(`
      SELECT 
        profile->>'name' as name, 
        CAST(COALESCE(profile->>'xp', '0') AS INTEGER) as xp,
        CAST(COALESCE(profile->>'appLevel', '1') AS INTEGER) as app_level
      FROM user_data
      ORDER BY xp DESC
      LIMIT $1
    `, [limit]);
    
    return res.rows.map(r => ({
      name: r.name || 'Learner',
      xp: r.xp,
      appLevel: r.app_level
    }));
  },

  // -- Admin Tools --
  getAllUsers: async () => {
    const res = await pool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.username, 
        u.created_at, 
        ud.last_synced,
        ud.profile->>'appLevel' as app_level,
        ud.profile->>'streak' as streak,
        ud.profile->>'xp' as xp
      FROM users u
      LEFT JOIN user_data ud ON u.id = ud.user_id
      ORDER BY u.created_at DESC
    `);
    return res.rows;
  }
};
