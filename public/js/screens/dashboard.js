/* dashboard.js — Home screen with Word of the Day + Smart Review */
'use strict';

// ── Word of the Day (deterministic: changes daily, same word all day) ─────────
function getWordOfTheDay() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return VOCABULARY[dayIndex % VOCABULARY.length];
}

function renderDashboard() {
  const p = Gamification.regenHearts();
  Gamification.updateStreak();

  const xpPct     = Gamification.xpProgress();
  const xpNeeded  = Gamification.xpForLevel(p.appLevel + 1);
  const dueCount  = SRS.getDueCount();
  const wotd      = getWordOfTheDay();
  const bookmarks = Storage.get('bookmarks', []);

  // Hearts HTML
  const heartsHtml = Array.from({ length: p.maxHearts }, (_, i) =>
    `<span class="heart ${i < p.hearts ? '' : 'empty'}">❤️</span>`
  ).join('');

  // ── Smart Review badge count ──────────────────────────────────────────────
  const smartCount = Math.min(8, dueCount + bookmarks.length);

  // ── Daily Challenge ───────────────────────────────────────────────────────
  const today = new Date().toDateString();
  const challengeDone = p.dailyChallengeDate === today && p.dailyChallengeCompleted;

  // ── Goal / Level progress ─────────────────────────────────────────────────
  const goalLevel = p.goalLevel || 'A1';
  const LEVEL_LESSON_IDS = {
    A1: ['lesson_greetings','lesson_numbers','lesson_colors','lesson_family','lesson_food','lesson_animals'],
    A2: ['lesson_greetings','lesson_numbers','lesson_colors','lesson_family','lesson_food','lesson_animals',
         'lesson_body','lesson_clothing','lesson_home','lesson_travel','lesson_time','lesson_verbs'],
  };
  const goalLessons = LEVEL_LESSON_IDS[goalLevel] || LEVEL_LESSON_IDS.A1;
  const completed   = p.completedLessons || [];
  const goalDone    = goalLessons.filter(id => completed.includes(id)).length;
  const goalPct     = Math.round((goalDone / goalLessons.length) * 100);
  const certified   = p.certifications && p.certifications[goalLevel];
  const allGoalDone = goalDone >= goalLessons.length;

  // ── Word of the Day card ──────────────────────────────────────────────────
  const genderLabel = wotd.gender ? { m:'der', f:'die', n:'das' }[wotd.gender] : '';
  const isBookmarked = bookmarks.includes(wotd.id);

  const wotdHtml = `
    <div class="glass-card mb-3 animate-fade-in stagger-1">
      <div class="flex-between mb-1">
        <div class="text-xs fw-700 text-gold" style="text-transform:uppercase;letter-spacing:.1em">📅 Word of the Day</div>
        <button class="btn btn-icon btn-sm ${isBookmarked ? 'btn-primary' : 'btn-secondary'}" 
                style="padding:.2rem .45rem;font-size:.8rem"
                onclick="toggleDashBookmark('${wotd.id}', this)">
          ${isBookmarked ? '⭐' : '☆'}
        </button>
      </div>
      <div class="flex-between">
        <div>
          ${genderLabel ? `<span class="vocab-gender ${wotd.gender}" style="font-size:.75rem">${genderLabel}</span> ` : ''}
          <span style="font-size:1.6rem;font-weight:900;color:var(--text-primary)">${wotd.de}</span>
          <div class="text-secondary mt-1">${wotd.en}</div>
          <div class="text-xs text-muted mt-1" style="font-style:italic">"${wotd.example_de}"</div>
        </div>
        <button class="btn btn-icon btn-secondary" data-speak="${wotd.de}" style="align-self:flex-start">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>
    </div>`;

  // ── Goal progress banner ──────────────────────────────────────────────────
  const goalHtml = `
    <div class="glass-card mb-3 animate-fade-in stagger-2" style="${certified ? 'border-color:rgba(16,185,129,.4)' : ''}">
      <div class="flex-between mb-1">
        <div class="fw-700 text-sm">🎯 Goal: ${goalLevel === 'A1' ? '🌱' : goalLevel === 'A2' ? '📗' : '🚀'} ${goalLevel} Level</div>
        ${certified
          ? '<span class="text-success fw-700 text-sm">✅ Certified!</span>'
          : allGoalDone
            ? `<button class="btn btn-primary btn-sm" onclick="App.navigate('/level-test/${goalLevel}')">🎓 Take Test</button>`
            : `<span class="text-xs text-muted">${goalDone}/${goalLessons.length} lessons</span>`}
      </div>
      <div class="xp-bar-wrap">
        <div class="xp-bar-fill" style="width:${goalPct}%;background:${goalLevel==='A1'?'var(--grad-gold)':'var(--grad-blue)'}"></div>
      </div>
      ${!certified && !allGoalDone ? `<div class="text-xs text-muted mt-1">${goalPct}% towards ${goalLevel} certification</div>` : ''}
    </div>`;

  // ── AI Daily Homework ─────────────────────────────────────────────────────
  const homeworkDone = p.homeworkDate === today && p.homeworkCompleted;

  const homeworkHtml = `
    <div class="glass-card mb-3 animate-fade-in stagger-3" style="cursor:pointer;transition:all var(--transition)"
         onclick="App.navigate('/homework')">
      <div class="flex-between">
        <div>
          <div class="fw-700 ${homeworkDone ? 'text-success' : 'text-purple'} mb-1">🤖 AI Daily Homework</div>
          <div class="text-secondary text-sm">Personalized story & roleplay</div>
        </div>
        <div style="font-size:2rem">${homeworkDone ? '✅' : '📝'}</div>
      </div>
      ${!homeworkDone ? `
        <div class="flex-between mt-3">
          <div class="text-xs fw-700" style="color:var(--accent-gold)">+100 XP</div>
          <div class="text-xs fw-700" style="color:var(--accent-purple)">START <i class="fa-solid fa-arrow-right"></i></div>
        </div>
      ` : `
        <div class="text-xs text-success mt-2">Completed for today! Awesome job.</div>
      `}
    </div>`;

  // ── Daily Challenge ───────────────────────────────────────────────────────
  const challengeHtml = `
    <div class="challenge-card ${challengeDone ? 'completed' : ''}" 
         onclick="${challengeDone ? '' : "App.navigate('/practice/challenge')"}">
      <div class="challenge-info">
        <h4>🏆 Daily Challenge</h4>
        <p>${challengeDone ? '✅ Completed for today!' : 'Answer 10 questions correctly'}</p>
      </div>
      <div class="challenge-xp">
        <div class="challenge-xp-value">+100</div>
        <div class="challenge-xp-label">XP</div>
      </div>
    </div>`;

  // ── Smart Review + Quick Actions ──────────────────────────────────────────
  const quickActions = [
    { icon:'🧠', label:'Smart Review', sub:`${smartCount} due`, route:'/review', highlight: dueCount > 0 },
    { icon:'📇', label:'Flashcards',   sub:`${dueCount} due`,   route:'/practice/flashcards', highlight: dueCount > 0 },
    { icon:'❓', label:'Quiz',         sub:'Test yourself',     route:'/practice/quiz', highlight: false },
    { icon:'📖', label:'Vocabulary',   sub:`${VOCABULARY.length} words`, route:'/vocab', highlight: false },
  ];

  const quickHtml = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.65rem" class="mb-3">
      ${quickActions.map(a => `
        <div class="glass-card" style="cursor:pointer;padding:.85rem"
             onclick="App.navigate('${a.route}')">
          <div style="font-size:1.6rem">${a.icon}</div>
          <div class="fw-700 mt-1" style="font-size:.9rem">${a.label}</div>
          <div class="text-xs ${a.highlight ? 'text-gold' : 'text-muted'}">${a.sub}</div>
        </div>`).join('')}
    </div>`;

  // ── AI Zone ───────────────────────────────────────────────────────────────
  const aiCards = [
    { route:'/ai/chat',    icon:'💬', title:'Chat',         sub:'Conversation', color:'var(--grad-purple)' },
    { route:'/ai/write',   icon:'✏️', title:'Grammar Fix',  sub:'Correct text', color:'var(--grad-blue)' },
    { route:'/ai/stories', icon:'📖', title:'Stories',      sub:'AI stories',   color:'var(--grad-gold)' },
    { route:'/ai/tutor',   icon:'🧑‍🏫', title:'Tutor',     sub:'Ask anything', color:'var(--grad-green)' },
  ];

  const aiHtml = `<div class="ai-features-grid">
    ${aiCards.map(c => `
      <div class="ai-feature-card" onclick="App.navigate('${c.route}')">
        <div class="ai-feature-icon" style="background:${c.color}">${c.icon}</div>
        <div class="ai-feature-title">${c.title}</div>
        <div class="ai-feature-sub">${c.sub}</div>
      </div>`).join('')}
  </div>`;

  // ── Learning path (next 4 lessons only to keep dashboard clean) ───────────
  const LESSONS = [
    { id:'lesson_greetings', title:'Greetings & Basics',   icon:'👋', words: 15 },
    { id:'lesson_numbers',   title:'Numbers 1-30',         icon:'🔢', words: 13 },
    { id:'lesson_colors',    title:'Colors',               icon:'🎨', words: 11 },
    { id:'lesson_family',    title:'Family Members',       icon:'👨‍👩‍👧', words: 11 },
    { id:'lesson_food',      title:'Food & Drink',         icon:'🍎', words: 18 },
    { id:'lesson_animals',   title:'Animals',              icon:'🐾', words: 10 },
    { id:'lesson_body',      title:'Body Parts',           icon:'💪', words: 10 },
    { id:'lesson_clothing',  title:'Clothing',             icon:'👕', words: 7  },
    { id:'lesson_home',      title:'Around the House',     icon:'🏠', words: 10 },
    { id:'lesson_travel',    title:'Travel & Directions',  icon:'✈️', words: 12 },
    { id:'lesson_time',      title:'Time & Calendar',      icon:'📅', words: 15 },
    { id:'lesson_verbs',     title:'Common Verbs',         icon:'⚡', words: 23 },
  ];

  let currentFound = false;
  const visibleLessons = [];
  for (const lesson of LESSONS) {
    if (completed.includes(lesson.id)) { visibleLessons.push({ ...lesson, state: 'completed' }); continue; }
    if (!currentFound) { visibleLessons.push({ ...lesson, state: 'current' }); currentFound = true; }
    else if (visibleLessons.filter(l => l.state !== 'completed').length < 2) {
      visibleLessons.push({ ...lesson, state: 'locked' });
    }
  }

  const pathHtml = visibleLessons.slice(-6).map(lesson => `
    <div class="path-lesson ${lesson.state}" 
         ${lesson.state !== 'locked' ? `onclick="App.navigate('/lesson/${lesson.id}')"` : ''}>
      <div class="path-icon">${lesson.state === 'completed' ? '✅' : lesson.state === 'current' ? lesson.icon : '🔒'}</div>
      <div class="path-info">
        <div class="path-title">${lesson.icon} ${lesson.title}</div>
        <div class="path-sub">${lesson.words} words · ${lesson.state === 'completed' ? 'Done' : lesson.state === 'current' ? 'Continue →' : 'Locked'}</div>
      </div>
    </div>`).join('');

  // ── Main HTML ─────────────────────────────────────────────────────────────
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const html = `
    <!-- Hero Banner -->
    <div class="hero-banner">
      <div class="hero-greeting">Welcome back, ${p.name || 'Learner'} 👋</div>
      <div class="hero-date">${dateStr}</div>
      <div class="hero-stats">
        <div>
          <div class="hero-stat-value">🔥 ${p.streak}</div>
          <div class="hero-stat-label">day streak</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,.2);margin:0 .5rem"></div>
        <div>
          <div class="hero-stat-value">${p.xp}</div>
          <div class="hero-stat-label">total XP</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,.2);margin:0 .5rem"></div>
        <div>
          <div class="hero-stat-value">${heartsHtml}</div>
          <div class="hero-stat-label">hearts</div>
        </div>
      </div>
    </div>

    <div class="xp-bar-wrap mb-3">
      <div class="xp-bar-fill" style="width:${xpPct}%"></div>
    </div>

    <!-- Word of the Day -->
    ${wotdHtml}

    <!-- Goal Progress -->
    ${goalHtml}

    <!-- AI Daily Homework -->
    ${homeworkHtml}

    <!-- Daily Challenge -->
    ${challengeHtml}

    <!-- Quick Actions (2x2 grid) -->
    <div class="section-label mt-3">⚡ Quick Actions</div>
    ${quickHtml}

    <!-- AI Zone -->
    <div class="mt-1 mb-3">
      <div class="section-label">🤖 AI Zone</div>
      ${aiHtml}
    </div>

    <!-- Learning Path (compact) -->
    <div class="mt-1 mb-3">
      <div class="section-label flex-between">
        <span>📚 Learning Path</span>
        <span class="text-xs text-gold pointer" onclick="App.navigate('/learn')">See all →</span>
      </div>
      <div class="lesson-path">${pathHtml}</div>
    </div>

    <!-- Global Leaderboard (Future Friends System) -->
    <div class="mt-1 mb-3">
      <div class="section-label">🏆 Global Leaderboard</div>
      <div class="glass-card" id="dash-leaderboard" style="padding:.75rem">
        <div class="text-center text-muted text-sm py-2"><i class="fa-solid fa-circle-notch fa-spin"></i> Fetching rankings...</div>
      </div>
    </div>
  `;

  renderScreen(html);
  Gamification.updateHeaderStats();
  setTimeout(() => Speech.attachSpeakerButtons(), 100);

  // Fetch and render Leaderboard
  fetch('/api/leaderboard?limit=5', {
    headers: { 'Authorization': 'Bearer ' + Storage.getAuthToken() }
  })
  .then(r => r.json())
  .then(j => {
    if (j.success && j.data && j.data.length > 0) {
      document.getElementById('dash-leaderboard').innerHTML = j.data.map((u, i) => `
        <div style="display:flex;align-items:center;padding:.5rem 0;border-bottom:${i < j.data.length-1 ? '1px solid var(--panel-border)' : 'none'}">
          <div style="width:24px;font-weight:800;color:${i===0?'var(--accent-gold)':i===1?'#cbd5e1':i===2?'#b45309':'var(--text-muted)'}">${i+1}</div>
          <div style="flex:1;font-size:.9rem;font-weight:600">${u.name} <span class="text-xs text-muted fw-400 ml-1">Lvl ${u.appLevel}</span></div>
          <div style="font-weight:800;color:var(--accent-gold);font-size:.85rem">${u.xp} XP</div>
        </div>
      `).join('');
    } else {
      document.getElementById('dash-leaderboard').innerHTML = '<div class="text-muted text-xs text-center">No players ranked yet. Be the first!</div>';
    }
  }).catch(() => {
    document.getElementById('dash-leaderboard').innerHTML = '<div class="text-muted text-xs text-center">Leaderboard offline</div>';
  });
}

// Dashboard bookmark toggle (without re-render)
window.toggleDashBookmark = function(wordId, btn) {
  const bookmarks = Storage.get('bookmarks', []);
  const idx = bookmarks.indexOf(wordId);
  if (idx === -1) {
    bookmarks.push(wordId);
    btn.innerHTML = '⭐';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
    Toast.success('Word of the Day saved! ⭐', 1800);
  } else {
    bookmarks.splice(idx, 1);
    btn.innerHTML = '☆';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    Toast.info('Removed from bookmarks', 1500);
  }
  Storage.set('bookmarks', bookmarks);
};
