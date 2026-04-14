const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbFile = path.join(dataDir, 'deutschmeister.json');

// Init empty DB if missing
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ users: [], userData: [] }, null, 2));
}

function readDB() {
  return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf8');
}

// Minimal ORM for our exact usecases
module.exports = {
  getUserByUsername: (username) => {
    return readDB().users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },
  getUserByEmail: (email) => {
    return readDB().users.find(u => u.email === email);
  },
  createUser: (id, email, username, passwordHash, salt) => {
    const db = readDB();
    db.users.push({ id, email, username, passwordHash, salt, createdAt: new Date().toISOString() });
    writeDB(db);
  },
  
  // -- Auth Encryption Helpers --
  hashPassword: (password, salt) => {
    return crypto.scryptSync(password, salt, 64).toString('hex');
  },
  generateSalt: () => {
    return crypto.randomBytes(16).toString('hex');
  },

  getUserData: (userId) => {
    return readDB().userData.find(u => u.userId === userId);
  },
  createUserData: (userId, profile, srsCards, bookmarks) => {
    const db = readDB();
    db.userData.push({ userId, profile, srsCards, bookmarks, chatHistory: '{}', lastSynced: new Date().toISOString() });
    writeDB(db);
  },
  updateUserData: (userId, profile, srsCards, chatHistory, bookmarks) => {
    const db = readDB();
    let ud = db.userData.find(u => u.userId === userId);
    if (!ud) {
      ud = { userId };
      db.userData.push(ud);
    }
    if (profile) ud.profile = profile;
    if (srsCards) ud.srsCards = srsCards;
    if (chatHistory) ud.chatHistory = chatHistory;
    if (bookmarks) ud.bookmarks = bookmarks;
    ud.lastSynced = new Date().toISOString();
    writeDB(db);
  },
  
  getLeaderboard: (limit = 5) => {
    const db = readDB();
    const board = db.userData.map(ud => {
      try {
        const p = typeof ud.profile === 'string' ? JSON.parse(ud.profile) : ud.profile;
        if (!p) return null;
        // Use user ID if no name
        const n = p.name || 'Learner';
        return { name: n, xp: p.xp || p.totalXp || 0, appLevel: p.appLevel || 1 };
      } catch { return null; }
    }).filter(Boolean);
    return board.sort((a, b) => b.xp - a.xp).slice(0, limit);
  }
};
