/* storage.js — localStorage abstraction */
'use strict';

const Storage = (() => {
  const PREFIX = 'dm_';

  function key(k) { return PREFIX + k; }

  function get(k, defaultVal = null) {
    try {
      const raw = localStorage.getItem(key(k));
      return raw === null ? defaultVal : JSON.parse(raw);
    } catch { return defaultVal; }
  }

  function set(k, val) {
    try { localStorage.setItem(key(k), JSON.stringify(val)); return true; }
    catch { return false; }
  }

  function remove(k) { localStorage.removeItem(key(k)); }

  function clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  }

  // ── Authentication & Sync Logic ───────────────
  let syncTimeout = null;

  function getAuthToken() { return localStorage.getItem('dm_auth_token'); }
  function setAuthToken(token, userMeta) { 
    localStorage.setItem('dm_auth_token', token); 
    localStorage.setItem('dm_user_meta', JSON.stringify(userMeta));
  }
  function isAuthenticated() { return !!getAuthToken(); }

  async function forceSyncDown() {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/user/sync', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) throw new Error('Sync failed');
      const json = await res.json();
      if (json.success && json.data) {
        // Only override if the backend actually has data, else keep local fallback
        if (Object.keys(json.data.profile).length > 0) set('profile', json.data.profile);
        if (Object.keys(json.data.srsCards).length > 0) set('srs_cards', json.data.srsCards);
        if (Object.keys(json.data.chatHistory).length > 0) Object.entries(json.data.chatHistory).forEach(([k,v]) => set(k, v));
        if (json.data.bookmarks && json.data.bookmarks.length > 0) set('bookmarks', json.data.bookmarks);
      }
    } catch(err) { console.error('Force Sync Down Error:', err); }
  }

  function queueSyncUp() {
    if (!isAuthenticated()) return;
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(executeSyncUp, 3000); // debounce 3 seconds
  }

  async function executeSyncUp() {
    const token = getAuthToken();
    if (!token) return;

    // Build chat history bundle
    const chatHistory = {};
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX+'chat_')).forEach(k => {
      chatHistory[k] = JSON.parse(localStorage.getItem(k));
    });

    const payload = {
      profile: get('profile', DEFAULTS.profile),
      srsCards: get('srs_cards', {}),
      chatHistory: chatHistory,
      bookmarks: get('bookmarks', [])
    };

    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
      });
      console.log('☁️ Progress synced to cloud safely.');
    } catch(err) {
      console.error('Cloud sync failed silently, will retry later.', err);
    }
  }

  // ── Modified Set (Overrides original) ──────────────
  function set(k, val) {
    try { 
      localStorage.setItem(key(k), JSON.stringify(val)); 
      queueSyncUp(); // ⬅️ Trigger sync on every save
      return true; 
    }
    catch { return false; }
  }
  const DEFAULTS = {
    profile: {
      name: 'Learner',
      level: 'A1',
      xp: 0,
      totalXp: 0,
      appLevel: 1,         // gamification level (1-30)
      hearts: 5,
      maxHearts: 5,
      lastHeartRegen: Date.now(),
      streak: 0,
      lastStudyDate: null,
      streakFreeze: 1,
      dailyXp: 0,
      dailyGoal: 20,
      lastDailyReset: null,
      completedLessons: [],
      unlockedAchievements: [],
      mistakeLog: {},      // { topicKey: errorCount }
      speechSpeed: 0.72,
      aiResponseLang: 'hints', // 'german' | 'hints' | 'english'
      soundEnabled: true,
      dailyChallengeDate: null,
      dailyChallengeCompleted: false,
      // Goal system
      goalLevel: null,          // 'A1' | 'A2' | 'B1'
      onboardingDone: false,
      certifications: {},        // { 'A1': { score:92, date:... }, ... }
      levelTestScores: {},       // { 'A1': [85, 72, 91] } history
      theme: 'midnight',         // 'midnight' | 'sunset' | 'ocean' | 'forest' | 'cyber'
    }
  };

  function getProfile() {
    const raw = get('profile', null);
    if (!raw) return { ...DEFAULTS.profile };
    
    // Merge defaults so we never crash on missing arrays/properties
    return { ...DEFAULTS.profile, ...raw };
  }
  function setProfile(p) { return set('profile', p); }

  function updateProfile(updates) {
    const p = getProfile();
    const updated = { ...p, ...updates };
    setProfile(updated);
    return updated;
  }

  // SRS card store
  function getSRSCards()       { return get('srs_cards', {}); }
  function setSRSCards(cards)  { return set('srs_cards', cards); }

  // Chat history per scenario
  function getChatHistory(scenario) { return get(`chat_${scenario}`, []); }
  function setChatHistory(scenario, msgs) { return set(`chat_${scenario}`, msgs); }

  // Saved stories
  function getSavedStories() { return get('saved_stories', []); }
  function saveStory(story)  {
    const stories = getSavedStories();
    stories.unshift({ ...story, savedAt: Date.now() });
    if (stories.length > 20) stories.pop();
    set('saved_stories', stories);
  }

  // Export all data
  function exportData() {
    const data = {};
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch {} });
    return data;
  }

  return { get, set, remove, clear, getProfile, setProfile, updateProfile, getSRSCards, setSRSCards, getChatHistory, setChatHistory, getSavedStories, saveStory, exportData, DEFAULTS, getAuthToken, setAuthToken, isAuthenticated, forceSyncDown };
})();
