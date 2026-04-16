/* level-test.js — Certification test for A1 / A2 / B1 */
'use strict';

// ── Level definitions ─────────────────────────────────────────────────────────
const LEVEL_DEFINITIONS = {
  A1: {
    label: 'A1 — Beginner',
    emoji: '🌱',
    requiredLessons: ['lesson_greetings','lesson_numbers','lesson_colors','lesson_family','lesson_food','lesson_animals'],
    categories: ['greetings','numbers','colors','family','food','animals'],
    passMark: 80,
    xpReward: 500,
  },
  A2: {
    label: 'A2 — Elementary',
    emoji: '📗',
    requiredLessons: ['lesson_greetings','lesson_numbers','lesson_colors','lesson_family','lesson_food','lesson_animals',
                      'lesson_body','lesson_clothing','lesson_home','lesson_travel','lesson_time','lesson_verbs'],
    categories: ['greetings','numbers','colors','family','food','animals','body','clothing','home','travel','time','verbs'],
    passMark: 80,
    xpReward: 1000,
  },
  B1: {
    label: 'B1 — Intermediate',
    emoji: '🚀',
    requiredLessons: ['lesson_greetings','lesson_numbers','lesson_colors','lesson_family','lesson_food','lesson_animals',
                      'lesson_body','lesson_clothing','lesson_home','lesson_travel','lesson_time','lesson_verbs'],
    categories: ['greetings','numbers','colors','family','food','animals','body','clothing','home','travel','time','verbs'],
    passMark: 85,
    xpReward: 2000,
  },
};

let testState = null;

// ── Entry point ───────────────────────────────────────────────────────────────
function renderLevelTest(levelKey) {
  const def = LEVEL_DEFINITIONS[levelKey];
  if (!def) { App.navigate('/learn'); return; }

  const p = Storage.getProfile();

  // Check prerequisites
  const completed    = p.completedLessons || [];
  const missing     = def.requiredLessons.filter(id => !completed.includes(id));
  const alreadyCert  = p.certifications && p.certifications[levelKey];

  if (missing.length > 0) {
    renderTestLocked(def, missing);
    return;
  }

  if (alreadyCert) {
    renderAlreadyCertified(levelKey, def, p.certifications[levelKey]);
    return;
  }

  // Build the test
  startLevelTest(levelKey, def);
}

function renderTestLocked(def, missingIds) {
  const names = {
    lesson_greetings:'Greetings',lesson_numbers:'Numbers',lesson_colors:'Colors',
    lesson_family:'Family',lesson_food:'Food',lesson_animals:'Animals',
    lesson_body:'Body Parts',lesson_clothing:'Clothing',lesson_home:'Home',
    lesson_travel:'Travel',lesson_time:'Time',lesson_verbs:'Common Verbs',
  };

  const html = `
    <div class="results-screen">
      <div class="results-emoji">🔒</div>
      <div class="results-title">Test Locked</div>
      <div class="text-secondary mt-2">Complete all required lessons to unlock the ${def.label} certification test.</div>

      <div class="glass-card mt-3" style="text-align:left">
        <div class="fw-700 mb-2">📚 Still needed:</div>
        ${missingIds.map(id => `
          <div class="flex-between mb-1">
            <span class="text-secondary text-sm">📖 ${names[id] || id}</span>
            <button class="btn btn-primary btn-sm" onclick="App.navigate('/lesson/${id}')">Start →</button>
          </div>`).join('')}
      </div>

      <button class="btn btn-secondary btn-block mt-3" onclick="App.navigate('/learn')">← Back to Lessons</button>
    </div>`;
  renderScreen(html);
}

function renderAlreadyCertified(levelKey, def, cert) {
  const html = `
    <div class="results-screen">
      <div class="results-emoji">🏆</div>
      <div class="results-title gradient-text-gold">${def.label} Certified!</div>
      <div class="text-secondary mt-1">You already passed this test on ${new Date(cert.date).toLocaleDateString()}</div>

      <div class="glass-card mt-3 mb-3">
        <div class="result-stat-value" style="font-size:3rem;color:var(--accent-gold)">${cert.score}%</div>
        <div class="result-stat-label">Your best score</div>
      </div>

      <button class="btn btn-primary btn-block mb-2" onclick="retakeLevelTest('${levelKey}')">Retake Test (for fun)</button>
      <button class="btn btn-secondary btn-block" onclick="App.navigate('/progress')">View Certificate →</button>
    </div>`;
  renderScreen(html);
}

window.retakeLevelTest = function(levelKey) {
  const def = LEVEL_DEFINITIONS[levelKey];
  startLevelTest(levelKey, def);
};

// ── Build and run the test ─────────────────────────────────────────────────────
function startLevelTest(levelKey, def) {
  // Pull 20 vocab words from all level categories
  const poolWords = VOCABULARY.filter(w => def.categories.includes(w.category));
  const shuffled  = [...poolWords].sort(() => Math.random() - 0.5);
  const picked    = shuffled.slice(0, Math.min(20, shuffled.length));

  // Mix 3 question types
  const questions = picked.map((w, i) => {
    const type = ['meaning', 'german', 'article'][i % 3];
    return buildTestQuestion(w, type, poolWords);
  }).filter(Boolean);

  testState = {
    levelKey,
    def,
    questions,
    current: 0,
    score:   0,
    answers: [],
    startTime: Date.now(),
  };

  renderTestQuestion();
}

function buildTestQuestion(w, type, pool) {
  const otherWords = pool.filter(x => x.id !== w.id);

  if (type === 'meaning') {
    const distractors = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [{ text: w.en, correct: true }, ...distractors.map(d => ({ text: d.en, correct: false }))];
    return {
      type,
      prompt: `What does <strong>${w.de}</strong> mean?`,
      germanWord: w.de,
      options: options.sort(() => Math.random() - 0.5),
      explanation: `<strong>${w.de}</strong> means <strong>${w.en}</strong>`,
    };
  }

  if (type === 'german') {
    const distractors = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [{ text: w.de, correct: true }, ...distractors.map(d => ({ text: d.de, correct: false }))];
    return {
      type,
      prompt: `Which German word means <strong>"${w.en}"</strong>?`,
      germanWord: w.de,
      options: options.sort(() => Math.random() - 0.5),
      explanation: `The German word for "${w.en}" is <strong>${w.de}</strong>`,
    };
  }

  if (type === 'article' && w.gender) {
    const articles = ['der', 'die', 'das'];
    const correctArticle = { m:'der', f:'die', n:'das' }[w.gender];
    if (!correctArticle) return null;
    const base = w.de.replace(/^(der|die|das) /, '');
    const options = articles.map(art => ({ text: art, correct: art === correctArticle }));
    return {
      type,
      prompt: `What is the correct article for <strong>${base}</strong>?`,
      germanWord: w.de,
      options,
      explanation: `It's <strong>${correctArticle} ${base}</strong> (${w.gender === 'm' ? 'masculine' : w.gender === 'f' ? 'feminine' : 'neuter'})`,
    };
  }

  return null;
}

// ── Render one question ───────────────────────────────────────────────────────
function renderTestQuestion() {
  const { questions, current, score, def, levelKey } = testState;
  const q     = questions[current];
  const total = questions.length;
  const pct   = Math.round((current / total) * 100);

  const dotsHtml = questions.map((_, i) => {
    const st = testState.answers[i];
    const cls = st === undefined ? (i === current ? 'current' : '') : (st ? 'done' : 'test-wrong');
    return `<div class="lesson-step-dot ${cls}"></div>`;
  }).join('');

  const optHtml = q.options.map((opt, i) => `
    <button class="mcq-option" id="topt-${i}" onclick="answerTestQ(${i}, ${opt.correct})">
      ${opt.text}
    </button>`).join('');

  const html = `
    <div style="margin-bottom:-.25rem">
      <div class="flex-between mb-2">
        <button class="btn btn-secondary btn-sm" onclick="confirmExitTest()">✕ Exit</button>
        <div class="text-sm fw-700 text-gold">${current + 1} / ${total}</div>
      </div>

      <!-- Level label -->
      <div class="text-center mb-2">
        <span class="text-xs text-muted" style="text-transform:uppercase;letter-spacing:.1em">
          ${def.emoji} ${def.label} Certification Test
        </span>
        <div class="xp-bar-wrap mt-1">
          <div class="xp-bar-fill" style="width:${pct}%;background:var(--grad-purple)"></div>
        </div>
      </div>

      <div class="lesson-progress">${dotsHtml}</div>
    </div>

    <div class="lesson-card mt-2">
      <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">
        Question ${current + 1}
      </div>
      <div class="fw-700" style="font-size:1.1rem;line-height:1.5">${q.prompt}</div>
      <button class="btn btn-icon btn-secondary mt-2" data-speak="${q.germanWord}">
        <i class="fa-solid fa-volume-high"></i>
      </button>
    </div>

    <div class="mcq-options mt-2">${optHtml}</div>
    <div id="test-feedback" class="mt-2"></div>
  `;

  renderScreen(html);
  setTimeout(() => Speech.attachSpeakerButtons(), 100);
}

window.answerTestQ = function(index, isCorrect) {
  // Disable all options
  document.querySelectorAll('.mcq-option').forEach(b => b.disabled = true);
  document.getElementById(`topt-${index}`)?.classList.add(isCorrect ? 'correct' : 'wrong');

  // Show correct if wrong
  if (!isCorrect) {
    document.querySelectorAll('.mcq-option').forEach((b, i) => {
      if (testState.questions[testState.current].options[i]?.correct) {
        b.classList.add('correct');
      }
    });
  }

  testState.answers[testState.current] = isCorrect;
  if (isCorrect) testState.score++;

  // Show explanation
  const fb = document.getElementById('test-feedback');
  if (fb) {
    fb.innerHTML = `
      <div class="glass-card" style="padding:.75rem 1rem;border-color:${isCorrect ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}">
        <div class="${isCorrect ? 'text-success' : 'text-danger'} text-sm fw-700">
          ${isCorrect ? '✅ Correct!' : '❌ Wrong!'}
        </div>
        <div class="text-sm text-secondary mt-1">${testState.questions[testState.current].explanation}</div>
      </div>`;
  }

  setTimeout(() => {
    testState.current++;
    if (testState.current >= testState.questions.length) {
      showTestResults();
    } else {
      renderTestQuestion();
    }
  }, 1400);
};

window.confirmExitTest = function() {
  Modal.confirm(
    '⚠️ Exit Test?',
    'Your progress will be lost. Are you sure?',
    () => App.navigate('/learn')
  );
};

// ── Results ────────────────────────────────────────────────────────────────────
function showTestResults() {
  const { levelKey, def, questions, score, startTime } = testState;
  const total    = questions.length;
  const pct      = Math.round((score / total) * 100);
  const passed   = pct >= def.passMark;
  const timeSec  = Math.round((Date.now() - startTime) / 1000);
  const p        = Storage.getProfile();

  // Save result
  const certs    = p.certifications || {};
  const history  = (p.levelTestScores || {})[levelKey] || [];
  history.push(pct);

  if (passed) {
    const existing = certs[levelKey];
    if (!existing || pct > existing.score) {
      certs[levelKey] = { score: pct, date: Date.now(), timeSeconds: timeSec };
    }
    Gamification.awardXP(def.xpReward);
    setTimeout(confettiBurst, 500);
  }

  Storage.updateProfile({
    certifications: certs,
    levelTestScores: { ...((p.levelTestScores) || {}), [levelKey]: history },
  });

  const emoji = passed ? '🏆' : pct >= 60 ? '💪' : '😓';
  const msg   = passed
    ? `You've earned your ${def.label} certificate!`
    : `You need ${def.passMark}% to pass. You scored ${pct}%. Try again after reviewing!`;

  const html = `
    <div class="results-screen">
      <div class="results-emoji" style="font-size:5rem">${emoji}</div>
      <div class="results-title ${passed ? 'gradient-text-gold' : ''}" style="${!passed ? 'color:var(--text-primary)' : ''}">
        ${passed ? `${def.label} Certified! 🎓` : 'Not Quite Yet…'}
      </div>
      <div class="text-secondary mt-1">${msg}</div>

      <!-- Score ring + stats -->
      <div style="margin:1.5rem auto;width:fit-content">
        ${createScoreRing(pct, 120)}
      </div>

      <div class="results-stats">
        <div class="result-stat-box">
          <div class="result-stat-value text-success">${score}</div>
          <div class="result-stat-label">Correct</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-value ${passed ? 'text-gold' : 'text-danger'}">${pct}%</div>
          <div class="result-stat-label">Score</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-value" style="color:var(--accent-purple)">
            ${Math.floor(timeSec/60)}:${String(timeSec%60).padStart(2,'0')}
          </div>
          <div class="result-stat-label">Time</div>
        </div>
      </div>

      ${passed ? `
        <!-- Certificate card -->
        <div class="glass-card mt-3 mb-3" style="background:linear-gradient(135deg,rgba(245,158,11,.12),rgba(249,115,22,.08));border-color:rgba(245,158,11,.4);text-align:center">
          <div style="font-size:2rem">🏅</div>
          <div class="fw-900 text-gold mt-1" style="font-size:1.2rem">Certificate of Achievement</div>
          <div class="text-secondary text-sm mt-1">${p.name || 'Learner'} · ${def.label}</div>
          <div class="text-xs text-muted mt-1">${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
          <div class="fw-700 text-gold mt-2">Score: ${pct}%  ·  +${def.xpReward} XP</div>
        </div>` : `
        <!-- Tips to improve -->
        <div class="glass-card mt-3 mb-3" style="text-align:left">
          <div class="fw-700 mb-1">💡 How to improve:</div>
          <div class="text-sm text-secondary">• Revisit the lessons for any weak categories</div>
          <div class="text-sm text-secondary mt-1">• Use the Flashcard review to master vocabulary</div>
          <div class="text-sm text-secondary mt-1">• Ask the AI Tutor about grammar questions</div>
        </div>`}

      <button class="btn btn-primary btn-block btn-lg" onclick="App.navigate('/dashboard')">
        <i class="fa-solid fa-house"></i> Back to Home
      </button>
      ${passed ? `
        <button class="btn btn-secondary btn-block mt-2" onclick="App.navigate('/progress')">
          View My Certificate 🏅
        </button>` : `
        <button class="btn btn-primary btn-block mt-2" onclick="retakeLevelTest('${levelKey}')">
          <i class="fa-solid fa-rotate-right"></i> Retry Test
        </button>`}
    </div>`;

  renderScreen(html);
}
