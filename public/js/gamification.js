/* gamification.js — XP, levels, streaks, hearts, achievements */
'use strict';

const Gamification = (() => {

  // ── XP thresholds per level ─────────────────────────────────────────────
  function xpForLevel(lvl) { return lvl * lvl * 60; }

  // ── Award XP ────────────────────────────────────────────────────────────
  function awardXP(amount, label = '') {
    const p = Storage.getProfile();
    p.xp       += amount;
    p.totalXp  += amount;
    p.dailyXp  += amount;

    // Level up?
    const neededXp = xpForLevel(p.appLevel + 1);
    if (p.xp >= neededXp) {
      p.xp -= neededXp;
      p.appLevel++;
      setTimeout(() => {
        confettiBurst();
        Toast.success(`🎉 Level Up! You're now level ${p.appLevel} — ${levelName(p.appLevel)}!`, 4000);
      }, 300);
      checkAchievements(p);
    }

    Storage.setProfile(p);
    showXPPopup(amount);
    updateHeaderStats();
    return p;
  }

  // ── Lose Heart ───────────────────────────────────────────────────────────
  function loseHeart() {
    const p = Storage.getProfile();
    if (p.hearts <= 0) return p;
    p.hearts = Math.max(0, p.hearts - 1);
    p.lastHeartRegen = Date.now();
    Storage.setProfile(p);
    updateHeaderStats();
    return p;
  }

  // ── Regen Hearts (call on app start) ────────────────────────────────────
  function regenHearts() {
    const p = Storage.getProfile();
    if (p.hearts >= p.maxHearts) return p;
    const REGEN_MS = 60 * 60 * 1000; // 1 hour per heart
    const elapsed  = Date.now() - (p.lastHeartRegen || Date.now());
    const regen    = Math.floor(elapsed / REGEN_MS);
    if (regen > 0) {
      p.hearts = Math.min(p.maxHearts, p.hearts + regen);
      p.lastHeartRegen = Date.now();
      Storage.setProfile(p);
    }
    return p;
  }

  // ── Update Streak ────────────────────────────────────────────────────────
  function updateStreak() {
    const p = Storage.getProfile();
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (p.lastStudyDate === today) return p; // already studied today

    if (p.lastStudyDate === yesterday) {
      p.streak++;
    } else if (p.lastStudyDate && p.lastStudyDate !== today) {
      // missed a day — check freeze
      if (p.streakFreeze > 0) {
        p.streakFreeze--;
        Toast.info('❄️ Streak Freeze used! Your streak is safe.', 3500);
      } else {
        p.streak = 1;
      }
    } else {
      p.streak = Math.max(1, p.streak);
    }

    p.lastStudyDate = today;

    // Reset daily XP if new day
    const lastReset = p.lastDailyReset;
    if (lastReset !== today) {
      p.dailyXp = 0;
      p.lastDailyReset = today;
    }

    checkAchievements(p);
    Storage.setProfile(p);
    updateHeaderStats();
    return p;
  }

  // ── Mark Lesson Complete ─────────────────────────────────────────────────
  function completeLesson(lessonId, stats) {
    const p = Storage.getProfile();
    if (!p.completedLessons.includes(lessonId)) {
      p.completedLessons.push(lessonId);
    }
    Storage.setProfile(p);

    let bonus = 50;
    if (stats.accuracy >= 100) {
      bonus += 25;
      Toast.success('✨ Perfect lesson! +25 XP bonus!', 3000);
    }
    awardXP(bonus, 'Lesson Complete');
    updateStreak();
    checkAchievements(p);
  }

  // ── Log Mistake ──────────────────────────────────────────────────────────
  function logMistake(topic) {
    const p = Storage.getProfile();
    p.mistakeLog[topic] = (p.mistakeLog[topic] || 0) + 1;
    Storage.setProfile(p);
  }

  function getWeakAreas() {
    const p = Storage.getProfile();
    return Object.entries(p.mistakeLog)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic]) => topic)
      .join(', ') || 'articles, cases, verb conjugation';
  }

  // ── Achievements ─────────────────────────────────────────────────────────
  const ACHIEVEMENTS = [
    { id: 'first_lesson',    name: 'First Steps',    icon: '👶', desc: 'Complete your first lesson', check: p => p.completedLessons.length >= 1 },
    { id: 'five_lessons',    name: 'Dedicated',      icon: '📚', desc: 'Complete 5 lessons',         check: p => p.completedLessons.length >= 5 },
    { id: 'ten_lessons',     name: 'Scholar',        icon: '🎓', desc: 'Complete 10 lessons',        check: p => p.completedLessons.length >= 10 },
    { id: 'streak_3',        name: '3-Day Streak',   icon: '🔥', desc: '3 days in a row',            check: p => p.streak >= 3 },
    { id: 'streak_7',        name: 'Week Warrior',   icon: '💪', desc: '7 days in a row',            check: p => p.streak >= 7 },
    { id: 'streak_30',       name: 'Unstoppable',    icon: '⚡', desc: '30 days in a row',           check: p => p.streak >= 30 },
    { id: 'level_5',         name: 'Rising Star',    icon: '⭐', desc: 'Reach level 5',              check: p => p.appLevel >= 5 },
    { id: 'level_10',        name: 'Pro Learner',    icon: '🌟', desc: 'Reach level 10',             check: p => p.appLevel >= 10 },
    { id: 'level_20',        name: 'Language Master',icon: '👑', desc: 'Reach level 20',             check: p => p.appLevel >= 20 },
    { id: 'xp_500',          name: 'XP Hunter',      icon: '💎', desc: 'Earn 500 total XP',          check: p => p.totalXp >= 500 },
    { id: 'xp_2000',         name: 'XP Legend',      icon: '🏆', desc: 'Earn 2000 total XP',         check: p => p.totalXp >= 2000 },
    { id: 'ai_chat',         name: 'Conversationalist',icon:'💬',desc: 'Use AI Chat',               check: p => (p.mistakeLog['ai_chat_used'] || 0) >= 1 },
    { id: 'story_reader',    name: 'Story Reader',   icon: '📖', desc: 'Read an AI story',           check: p => (p.mistakeLog['story_read'] || 0) >= 1 },
    { id: 'perfect',         name: 'Perfectionist',  icon: '💯', desc: 'Get a perfect lesson score', check: p => (p.mistakeLog['perfect_lesson'] || 0) >= 1 },
    { id: 'daily_goal',      name: 'Goal Crusher',   icon: '🎯', desc: 'Hit your daily XP goal',     check: p => p.dailyXp >= p.dailyGoal },
  ];

  function checkAchievements(p) {
    p.unlockedAchievements = p.unlockedAchievements || [];
    ACHIEVEMENTS.forEach(a => {
      if (!p.unlockedAchievements.includes(a.id) && a.check(p)) {
        p.unlockedAchievements.push(a.id);
        setTimeout(() => Toast.info(`🏅 Achievement unlocked: ${a.icon} ${a.name}!`, 4000), 800);
      }
    });
    Storage.setProfile(p);
  }

  function getAllAchievements() {
    const p = Storage.getProfile();
    return ACHIEVEMENTS.map(a => ({
      ...a,
      unlocked: (p.unlockedAchievements || []).includes(a.id),
    }));
  }

  // ── Update Header Stats UI ───────────────────────────────────────────────
  function updateHeaderStats() {
    const el = document.getElementById('header-stats');
    if (!el) return;
    const p = Storage.getProfile();
    const hearts = Array.from({ length: p.maxHearts }, (_, i) =>
      `<span class="heart ${i < p.hearts ? '' : 'empty'}">❤️</span>`
    ).join('');

    el.innerHTML = `
      <div class="stat-chip streak"><span class="streak-fire">🔥</span>${p.streak}</div>
      <div class="stat-chip hearts">${hearts}</div>
      <div class="stat-chip xp">⭐ Lvl ${p.appLevel}</div>
    `;
  }

  // ── XP progress % for current level ─────────────────────────────────────
  function xpProgress() {
    const p = Storage.getProfile();
    const needed = xpForLevel(p.appLevel + 1);
    return Math.min(100, Math.round((p.xp / needed) * 100));
  }

  return {
    awardXP, loseHeart, regenHearts, updateStreak, completeLesson,
    logMistake, getWeakAreas, checkAchievements, getAllAchievements,
    updateHeaderStats, xpProgress, xpForLevel, ACHIEVEMENTS,
  };
})();
