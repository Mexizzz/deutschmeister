/* progress.js — Stats & Progress Screen */
'use strict';

function renderProgress() {
  const p    = Storage.getProfile();
  const all  = Gamification.getAllAchievements();
  const unlocked = all.filter(a => a.unlocked);
  const locked   = all.filter(a => !a.unlocked);

  const LESSONS_TOTAL = 12;
  const completedCount = (p.completedLessons || []).length;

  // Level progress
  const xpNeeded = Gamification.xpForLevel(p.appLevel + 1);
  const xpPct    = Gamification.xpProgress();

  // Leaderboard (mock rivals for motivation)
  const RIVALS = [
    { name:'Klaus M.',   xp: Math.max(0, p.totalXp + 340), flag:'🇩🇪', level: p.appLevel + 2 },
    { name:'Sophie L.',  xp: Math.max(0, p.totalXp + 120), flag:'🇫🇷', level: p.appLevel + 1 },
    { name:'You',        xp: p.totalXp, flag:'⭐', level: p.appLevel, isMe: true },
    { name:'Amir K.',    xp: Math.max(0, p.totalXp - 80),  flag:'🇸🇦', level: Math.max(1, p.appLevel - 1) },
    { name:'Yuki T.',    xp: Math.max(0, p.totalXp - 210), flag:'🇯🇵', level: Math.max(1, p.appLevel - 2) },
  ].sort((a, b) => b.xp - a.xp);

  const leaderboardHtml = RIVALS.map((r, i) => `
    <div class="flex-between" style="padding:.65rem .75rem;border-radius:var(--radius-md);
         background:${r.isMe ? 'rgba(245,158,11,.1)' : 'rgba(255,255,255,.03)'};
         border:1px solid ${r.isMe ? 'rgba(245,158,11,.3)' : 'var(--panel-border)'};
         margin-bottom:.4rem">
      <div class="flex gap-2" style="align-items:center">
        <span style="font-size:.75rem;font-weight:900;color:${i<3?'var(--accent-gold)':'var(--text-muted)'};width:18px">${i+1}</span>
        <span>${r.flag}</span>
        <span class="fw-700 ${r.isMe ? 'text-gold' : ''}">${r.name}</span>
      </div>
      <div class="text-right">
        <div class="text-sm fw-700">${r.xp.toLocaleString()} XP</div>
        <div class="text-xs text-muted">Lvl ${r.level}</div>
      </div>
    </div>`).join('');

  // Achievements
  const achievHtml = [...unlocked, ...locked].map(a => `
    <div class="achievement-badge ${a.unlocked ? 'unlocked' : 'locked'}" 
         title="${a.desc}" style="width:70px">
      <div class="badge-icon">${a.icon}</div>
      <div class="badge-name">${a.name}</div>
    </div>`).join('');

  // Weak areas
  const weakAreas = Gamification.getWeakAreas();
  const mistakeLog = p.mistakeLog || {};
  const topMistakes = Object.entries(mistakeLog)
    .filter(([k]) => !['ai_chat_used','story_read','perfect_lesson'].includes(k))
    .sort((a,b) => b[1]-a[1]).slice(0,3);

  const html = `
    <div class="flex-between mb-2">
      <div class="section-label mb-0">👤 My Profile</div>
      <button class="btn btn-icon btn-secondary" onclick="App.navigate('/settings')" title="Settings">
        <i class="fa-solid fa-gear"></i>
      </button>
    </div>

    <!-- Level Card -->
    <div class="glass-card mb-3">
      <div class="flex-between mb-2">
        <div>
          <div class="text-xs text-muted">LEVEL ${p.appLevel}</div>
          <div class="fw-900 gradient-text-gold" style="font-size:1.6rem">${levelName(p.appLevel)}</div>
        </div>
        <div class="text-center">
          <div style="font-size:2rem">🏅</div>
          <div class="text-xs text-muted">${p.appLevel < 30 ? `Next: ${levelName(p.appLevel+1)}` : 'MAX'}</div>
        </div>
      </div>
      <div class="flex-between text-xs text-muted mb-1">
        <span>${p.xp} XP</span>
        <span>${xpNeeded} XP to next level</span>
      </div>
      <div class="xp-bar-wrap">
        <div class="xp-bar-fill" style="width:${xpPct}%"></div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid-2 mb-3">
      <div class="stat-big-box">
        <div class="stat-big-value">${p.totalXp.toLocaleString()}</div>
        <div class="stat-big-label">Total XP</div>
      </div>
      <div class="stat-big-box">
        <div class="stat-big-value" style="color:#fb923c">${p.streak}</div>
        <div class="stat-big-label">🔥 Day Streak</div>
      </div>
      <div class="stat-big-box">
        <div class="stat-big-value text-success">${SRS.getMasteredCount()}</div>
        <div class="stat-big-label">Words Mastered</div>
      </div>
      <div class="stat-big-box">
        <div class="stat-big-value" style="color:var(--accent-purple)">${completedCount}/${LESSONS_TOTAL}</div>
        <div class="stat-big-label">Lessons Done</div>
      </div>
    </div>

    <!-- Daily Goal -->
    <div class="glass-card mb-3">
      <div class="flex-between mb-2">
        <div class="fw-700">📅 Daily Goal</div>
        <div class="text-sm fw-700 text-gold">${p.dailyXp} / ${p.dailyGoal} XP</div>
      </div>
      <div class="xp-bar-wrap">
        <div class="xp-bar-fill" style="width:${Math.min(100,Math.round((p.dailyXp/p.dailyGoal)*100))}%"></div>
      </div>
      ${p.dailyXp >= p.dailyGoal ? '<div class="text-success text-sm mt-2">✅ Daily goal reached!</div>' : ''}
    </div>

    <!-- SRS Stats -->
    <div class="glass-card mb-3">
      <div class="fw-700 mb-2">📇 Flashcard Deck</div>
      <div class="flex-between">
        <span class="text-muted">Total Words</span><span class="fw-700">${SRS.getTotalCount()}</span>
      </div>
      <div class="flex-between mt-1">
        <span class="text-muted">Due for Review</span>
        <span class="fw-700 ${SRS.getDueCount()>0?'text-gold':''}">${SRS.getDueCount()}</span>
      </div>
      <div class="flex-between mt-1">
        <span class="text-muted">Mastered (21+ day interval)</span>
        <span class="fw-700 text-success">${SRS.getMasteredCount()}</span>
      </div>
      ${SRS.getDueCount() > 0 ? `<button class="btn btn-purple btn-sm btn-block mt-2" onclick="App.navigate('/practice/flashcards')">Review ${SRS.getDueCount()} Due Cards →</button>` : ''}
    </div>

    <!-- Weak Areas -->
    ${topMistakes.length > 0 ? `
      <div class="glass-card mb-3">
        <div class="fw-700 mb-2">🎯 Focus Areas (most mistakes)</div>
        ${topMistakes.map(([topic,count]) => `
          <div class="flex-between mt-1">
            <span class="text-secondary">${topic}</span>
            <span class="text-sm fw-700 text-danger">${count} mistake${count!==1?'s':''}</span>
          </div>`).join('')}
        <button class="btn btn-secondary btn-sm btn-block mt-2" onclick="App.navigate('/ai/write')">
          Practice with AI Writing ✏️
        </button>
      </div>` : ''}

    <!-- Leaderboard -->
    <div class="glass-card mb-3">
      <div class="fw-700 mb-2">🏆 Leaderboard</div>
      ${leaderboardHtml}
      <div class="text-xs text-muted mt-1 text-center">Earn more XP to climb the ranks!</div>
    </div>

    <!-- Achievements -->
    <div class="glass-card mb-3">
      <div class="flex-between mb-2">
        <div class="fw-700">🏅 Achievements</div>
        <div class="text-sm text-gold">${unlocked.length}/${all.length}</div>
      </div>
      <div class="achievements-row" style="flex-wrap:wrap;gap:.5rem">${achievHtml}</div>
    </div>

    <!-- Export -->
    <button class="btn btn-secondary btn-block mb-3" onclick="exportProgress()">
      <i class="fa-solid fa-download"></i> Export Progress Data
    </button>
  `;

  renderScreen(html);
}

window.exportProgress = function() {
  const data = Storage.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `deutschmeister-progress-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  Toast.success('Progress exported!', 2500);
};
