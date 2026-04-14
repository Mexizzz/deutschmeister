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

  // Default state
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
    }
  };

  function getProfile() { return get('profile', DEFAULTS.profile); }
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

  return { get, set, remove, clear, getProfile, setProfile, updateProfile, getSRSCards, setSRSCards, getChatHistory, setChatHistory, getSavedStories, saveStory, exportData, DEFAULTS };
})();
