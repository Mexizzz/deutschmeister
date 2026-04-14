/* app.js — Hash-based SPA Router + App Init */
'use strict';

const App = (() => {

  // ── Route table ─────────────────────────────────────────────────────────────
  const ROUTES = {
    '/':                    () => renderDashboard(),
    '/auth':                () => renderAuthScreen(),
    '/onboarding':          () => renderOnboarding(),
    '/learn':               () => renderLearnMenu(),
    '/lesson/:id':          (p) => startLesson(p.id),
    '/review':              () => renderSmartReview(),
    '/vocab':               () => renderVocabBrowser(),
    '/practice':            () => renderPractice(),
    '/homework':            () => renderHomework(),
    '/practice/flashcards': () => renderFlashcards(),
    '/practice/quiz':       () => renderQuiz(),
    '/practice/challenge':  () => renderDailyChallenge(),
    '/ai':                  () => renderAIHub(),
    '/ai/chat':             () => renderAIChat(),
    '/ai/write':            () => renderAIWriting(),
    '/ai/stories':          () => renderAIStories(),
    '/ai/tutor':            () => renderAITutor(),
    '/ai/speak':            () => renderAISpeak(),
    '/level-test/:level':   (p) => renderLevelTest(p.level),
    '/progress':            () => renderProgress(),
    '/settings':            () => renderSettings(),
  };

  // ── Tab map for bottom nav highlight ────────────────────────────────────────
  const TAB_MAP = {
    '/':        'home',
    '/learn':   'learn',
    '/lesson':  'learn',
    '/practice':'practice',
    '/ai':      'ai',
    '/progress':'progress',
    '/settings':'settings',
  };

  function getActiveTab(path) {
    for (const [prefix, tab] of Object.entries(TAB_MAP)) {
      if (path === prefix || path.startsWith(prefix + '/')) return tab;
    }
    return 'home';
  }

  function navigate(path) {
    window.location.hash = '#' + path;
  }

  function matchRoute(path) {
    if (ROUTES[path]) return { handler: ROUTES[path], params: {} };
    for (const [pattern, handler] of Object.entries(ROUTES)) {
      if (!pattern.includes(':')) continue;
      const pp   = pattern.split('/');
      const pathP= path.split('/');
      if (pp.length !== pathP.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < pp.length; i++) {
        if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(pathP[i]);
        else if (pp[i] !== pathP[i]) { ok = false; break; }
      }
      if (ok) return { handler, params };
    }
    return null;
  }

  function handleRoute() {
    const hash  = window.location.hash || '#/';
    const path  = hash.replace(/^#/, '') || '/';
    
    // Auth guard
    if (!Storage.isAuthenticated() && path !== '/auth') {
      navigate('/auth');
      return;
    }

    const p = Storage.getProfile();
    UI.applyTheme(p.theme);

    // Redirect to onboarding if first launch (after login)
    if (Storage.isAuthenticated() && !p.onboardingDone && path !== '/onboarding' && path !== '/auth') {
      navigate('/onboarding');
      return;
    }

    // Highlight nav (bottom + sidebar)
    const activeTab = getActiveTab(path);
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === activeTab);
    });
    document.querySelectorAll('.sidebar-link').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === activeTab);
    });

    // Update sidebar user card
    updateSidebarUser();

    const match = matchRoute(path);
    if (match) {
      try {
        match.handler(match.params);
      } catch (err) {
        console.error('Route error:', err);
        renderScreen(`<div class="results-screen">
          <div class="results-emoji">😕</div>
          <div class="results-title">Oops!</div>
          <div class="text-secondary mt-2">${err.message}</div>
          <button class="btn btn-primary mt-3" onclick="App.navigate('/')">Home</button>
        </div>`);
      }
    } else {
      navigate('/');
    }
  }

  // ── Learn Menu ───────────────────────────────────────────────────────────────
  function renderLearnMenu() {
    const p         = Storage.getProfile();
    const completed = p.completedLessons || [];
    const goalLevel = p.goalLevel || 'A1';
    const certs     = p.certifications || {};

    // Lesson groups per level
    const LEVEL_LESSONS = {
      A1: [
        { id:'lesson_greetings', icon:'👋', title:'Greetings & Basics' },
        { id:'lesson_numbers',   icon:'🔢', title:'Numbers 1–30' },
        { id:'lesson_colors',    icon:'🎨', title:'Colors' },
        { id:'lesson_family',    icon:'👨‍👩‍👧', title:'Family Members' },
        { id:'lesson_food',      icon:'🍎', title:'Food & Drink' },
        { id:'lesson_animals',   icon:'🐾', title:'Animals' },
      ],
      A2: [
        { id:'lesson_body',      icon:'💪', title:'Body Parts' },
        { id:'lesson_clothing',  icon:'👕', title:'Clothing' },
        { id:'lesson_home',      icon:'🏠', title:'Around the House' },
        { id:'lesson_travel',    icon:'✈️', title:'Travel & Directions' },
        { id:'lesson_time',      icon:'📅', title:'Time & Calendar' },
        { id:'lesson_verbs',     icon:'⚡', title:'Common Verbs' },
      ],
    };

    // Build lesson path HTML for each level
    const levelOrder = ['A1', 'A2'];
    let levelsHtml = '';

    levelOrder.forEach(lv => {
      const lessons     = LEVEL_LESSONS[lv] || [];
      const allDone     = lessons.every(l => completed.includes(l.id));
      const certDone    = certs[lv];
      const prevDone    = lv === 'A1' ? true : lessons.filter(l => LEVEL_LESSONS.A1.some(a => a.id === l.id) || completed.includes(l.id)).length > 0;

      // Count how many lessons in this level are done
      const doneCount = lessons.filter(l => completed.includes(l.id)).length;
      const levelLocked = lv === 'A2' && !certs['A1'];  // A2 unlocked after A1 cert

      levelsHtml += `
        <div class="glass-card mb-3">
          <div class="flex-between mb-2">
            <div>
              <div class="fw-700">${lv === 'A1' ? '🌱' : '📗'} ${lv} Level</div>
              <div class="text-xs text-muted">${doneCount}/${lessons.length} lessons complete</div>
            </div>
            ${certDone
              ? `<div class="text-success fw-700 text-sm">✅ Certified ${certDone.score}%</div>`
              : levelLocked
                ? `<div class="text-xs text-muted">🔒 Pass A1 first</div>`
                : allDone
                  ? `<button class="btn btn-primary btn-sm" onclick="App.navigate('/level-test/${lv}')">🎓 Take Test</button>`
                  : `<div class="text-xs text-muted">${lessons.length - doneCount} left</div>`
            }
          </div>

          <!-- XP progress bar for this level -->
          <div class="xp-bar-wrap mb-2">
            <div class="xp-bar-fill" style="width:${Math.round((doneCount/lessons.length)*100)}%;background:${lv==='A1'?'var(--grad-gold)':'var(--grad-blue)'}"></div>
          </div>

          ${levelLocked ? '<div class="text-secondary text-sm text-center">Complete & pass the A1 Certification Test to unlock A2.</div>' : `
          <div class="lesson-path">
            ${lessons.map((l, idx) => {
              const done     = completed.includes(l.id);
              // A lesson is available if the previous one is done OR it's the first one
              const prevLessonDone = idx === 0 || completed.includes(lessons[idx - 1].id);
              const locked = !done && !prevLessonDone;
              return `
                <div class="path-lesson ${done ? 'completed' : locked ? 'locked' : 'current'}"
                     ${!locked ? `onclick="App.navigate('/lesson/${l.id}')"` : ''}>
                  <div class="path-icon">${done ? '✅' : locked ? '🔒' : l.icon}</div>
                  <div class="path-info">
                    <div class="path-title">${l.title}</div>
                    <div class="path-sub text-xs">${done ? 'Completed' : locked ? 'Complete previous first' : 'Start lesson →'}</div>
                  </div>
                </div>`;
            }).join('')}
          </div>

          ${allDone && !certDone ? `
            <button class="btn btn-primary btn-block mt-2" onclick="App.navigate('/level-test/${lv}')">
              🎓 Take ${lv} Certification Test
            </button>` : ''}
          `}
        </div>`;
    });

    const html = `
      <div class="flex-between mb-2">
        <div class="section-label mb-0">📚 Learning Path</div>
        <button class="btn btn-secondary btn-sm" onclick="changeGoal()">
          🎯 Goal: ${goalLevel}
        </button>
      </div>
      <div class="text-secondary text-sm mb-3">Complete all lessons in a level, then pass the certification test to advance.</div>

      ${levelsHtml}

      <div class="glass-card mb-3">
        <div class="fw-700 mb-2">📖 Grammar & Phrases</div>
        <button class="btn btn-secondary btn-block mb-2" onclick="renderGrammarBrowser()">📐 Browse Grammar Tables</button>
        <button class="btn btn-secondary btn-block" onclick="renderPhraseBrowser()">💬 Common Phrases by Situation</button>
      </div>
    `;
    renderScreen(html);
  }

  // Change goal shortcut
  window.changeGoal = function() {
    Modal.show({
      title: '🎯 Change Your Goal',
      body: `<p class="text-secondary">Choose a new target level:</p>
        <div style="display:flex;flex-direction:column;gap:.5rem;margin-top:.75rem">
          ${['A1','A2','B1'].map(lv => `
            <button class="btn btn-secondary" onclick="Modal.hide();Storage.updateProfile({goalLevel:'${lv}'});App.navigate('/learn');Toast.success('Goal updated to ${lv}!')">
              ${lv === 'A1' ? '🌱' : lv === 'A2' ? '📗' : '🚀'} ${lv}
            </button>`).join('')}
        </div>`,
      buttons: [{ label: 'Cancel', style: 'secondary', onClick: () => {} }],
    });
  };

  // ── AI Hub ────────────────────────────────────────────────────────────────
  function renderAIHub() {
    const aiFeatures = [
      { route:'/ai/chat',    icon:'💬', title:'Conversation Partner', sub:'Practice real German dialogue',  color:'var(--grad-purple)' },
      { route:'/ai/write',   icon:'✏️', title:'Grammar Corrector',    sub:'Fix your German text with AI',   color:'var(--grad-blue)' },
      { route:'/ai/stories', icon:'📖', title:'Story Generator',      sub:'Read AI German stories',         color:'var(--grad-gold)' },
      { route:'/ai/tutor',   icon:'🧑‍🏫', title:'AI Tutor',          sub:'Ask any grammar question',      color:'var(--grad-green)' },
      { route:'/ai/speak',   icon:'🎤', title:'Pronunciation Coach',  sub:'Speak & get AI feedback',        color:'var(--grad-red)' },
    ];

    const html = `
      <div class="section-label mb-1">🤖 AI Features</div>
      <p class="text-secondary text-sm mb-3">Powered by Groq (llama-3.3-70b) — ultra-fast AI for real learning.</p>
      <div style="display:flex;flex-direction:column;gap:.75rem">
        ${aiFeatures.map((f, i) => `
          <div class="glass-card animate-fade-in stagger-${i+1}" style="cursor:pointer;display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem"
               onclick="App.navigate('${f.route}')">
            <div style="width:52px;height:52px;border-radius:var(--radius-md);background:${f.color};display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0">
              ${f.icon}
            </div>
            <div style="flex:1">
              <div class="fw-700 mb-1">${f.title}</div>
              <div class="text-sm text-secondary">${f.sub}</div>
            </div>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>`).join('')}
      </div>
    `;
    renderScreen(html);
  }

  // ── Grammar Browser ──────────────────────────────────────────────────────
  window.renderGrammarBrowser = function() {
    const a = GRAMMAR.articles;
    const tableHtml = (t) => `<table>${t.map((row, i) =>
      `<tr>${row.map(cell => `<${i===0?'th':'td'}>${cell}</${i===0?'th':'td'}>`).join('')}</tr>`
    ).join('')}</table>`;

    const html = `
      <button class="btn btn-secondary btn-sm mb-3" onclick="App.navigate('/learn')">← Back</button>
      <div class="section-label mb-2">📐 German Grammar</div>

      <div class="glass-card mb-3">
        <div class="fw-700 mb-1">${a.title}</div>
        <div class="text-sm text-secondary mb-2">${a.explanation}</div>
        <div class="fw-700 text-sm mb-1">${a.definite.label}</div>
        ${tableHtml(a.definite.table)}
        <div class="fw-700 text-sm mt-2 mb-1">${a.indefinite.label}</div>
        ${tableHtml(a.indefinite.table)}
      </div>

      ${Object.values(GRAMMAR.conjugation).map(c => `
        <div class="glass-card mb-3">
          <div class="fw-700 mb-1">${c.title}</div>
          ${c.explanation ? `<div class="text-sm text-secondary mb-2">${c.explanation}</div>` : ''}
          ${tableHtml(c.table)}
        </div>`).join('')}

      <div class="glass-card mb-3">
        <div class="fw-700 mb-2">${GRAMMAR.wordOrder.title}</div>
        ${GRAMMAR.wordOrder.rules.map(r => `
          <div class="mb-2">
            <div class="fw-700 text-sm text-gold">${r.label}</div>
            <div class="text-sm">"${r.example_de}" → "${r.example_en}"</div>
            <div class="text-xs text-muted mt-1">💡 ${r.tip}</div>
          </div>`).join('')}
      </div>
    `;
    renderScreen(html);
  };

  // ── Phrase Browser ───────────────────────────────────────────────────────
  window.renderPhraseBrowser = function() {
    const html = `
      <button class="btn btn-secondary btn-sm mb-3" onclick="App.navigate('/learn')">← Back</button>
      <div class="section-label mb-2">💬 Common German Phrases</div>
      ${PHRASE_CATEGORIES.map(cat => {
        const phrases = getPhrasesByCategory(cat.id);
        return `
          <div class="glass-card mb-3">
            <div class="fw-700 mb-2">${cat.icon} ${cat.name}</div>
            ${phrases.map(ph => `
              <div class="vocab-item" style="flex-direction:column;align-items:flex-start;gap:.2rem;padding:.75rem .75rem">
                <div class="flex-between" style="width:100%">
                  <div class="fw-700">${ph.de}</div>
                  <button class="btn btn-icon btn-secondary btn-sm" data-speak="${ph.de}" style="padding:.2rem .4rem;font-size:.75rem">
                    <i class="fa-solid fa-volume-high"></i>
                  </button>
                </div>
                <div class="text-sm text-secondary">${ph.en}</div>
              </div>`).join('')}
          </div>`;
      }).join('')}
    `;
    renderScreen(html);
    setTimeout(() => Speech.attachSpeakerButtons(), 200);
  };

  // ── Offline Resilience ───────────────────────────────────────────────────
  function setupOfflineMonitoring() {
    window.addEventListener('offline', () => {
      Toast.warning('📡 You are offline. Progress will be saved locally.', 5000);
    });
    window.addEventListener('online', () => {
      Toast.success('📶 Back online! Syncing progress...', 3000);
      if (Storage.getAuthToken()) {
        Storage.syncWithServer().catch(console.error);
      }
    });
  }

  // ── Sidebar User Card ─────────────────────────────────────────────────────
  function updateSidebarUser() {
    const p = Storage.getProfile();
    const nameEl  = document.getElementById('sidebar-username');
    const levelEl = document.getElementById('sidebar-level');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl)  nameEl.textContent = p.name || 'Learner';
    if (levelEl) levelEl.textContent = `Level ${p.appLevel || 1} · ${levelName(p.appLevel || 1)}`;
    if (avatarEl) {
      const initials = (p.name || 'L').charAt(0).toUpperCase();
      avatarEl.textContent = initials;
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  function init() {
    const p = Storage.getProfile();
    if (!p.name) Storage.setProfile(Storage.DEFAULTS.profile);
    UI.applyTheme(p.theme);
    Gamification.regenHearts();
    Gamification.updateHeaderStats();
    setupOfflineMonitoring();
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  return { navigate, init };
})();

// ── Boot ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
