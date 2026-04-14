const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbFile = path.join(dataDir, 'deutschmeister.json');

// Init empty DB if missing
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify({ users: [], otps: [], userData: [] }, null, 2));
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
  createUser: (id, email, username) => {
    const db = readDB();
    db.users.push({ id, email, username, createdAt: new Date().toISOString() });
    writeDB(db);
  },
  
  getOtp: (email) => {
    return readDB().otps.find(o => o.email === email);
  },
  saveOtp: (email, code, expiresAt) => {
    const db = readDB();
    const existing = db.otps.find(o => o.email === email);
    if (existing) {
      existing.code = code;
      existing.expiresAt = expiresAt;
    } else {
      db.otps.push({ email, code, expiresAt });
    }
    writeDB(db);
  },
  deleteOtp: (email) => {
    const db = readDB();
    db.otps = db.otps.filter(o => o.email !== email);
    writeDB(db);
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
  }
};
