/* lesson.js — Lesson Engine with 5 step types */
'use strict';

let lessonState = null;

// All lesson configs (mirrors dashboard LESSONS)
const LESSON_CONFIGS = {
  lesson_greetings: { title:'Greetings & Basics', icon:'👋', category:'greetings' },
  lesson_numbers:   { title:'Numbers 1-30',        icon:'🔢', category:'numbers' },
  lesson_colors:    { title:'Colors',              icon:'🎨', category:'colors' },
  lesson_family:    { title:'Family Members',      icon:'👨‍👩‍👧', category:'family' },
  lesson_food:      { title:'Food & Drink',         icon:'🍎', category:'food' },
  lesson_animals:   { title:'Animals',             icon:'🐾', category:'animals' },
  lesson_body:      { title:'Body Parts',          icon:'💪', category:'body' },
  lesson_clothing:  { title:'Clothing',            icon:'👕', category:'clothing' },
  lesson_home:      { title:'Around the House',   icon:'🏠', category:'home' },
  lesson_travel:    { title:'Travel & Directions', icon:'✈️', category:'travel' },
  lesson_time:      { title:'Time & Calendar',    icon:'📅', category:'time' },
  lesson_verbs:     { title:'Common Verbs',        icon:'⚡', category:'verbs' },
};

function startLesson(lessonId) {
  const config = LESSON_CONFIGS[lessonId];
  if (!config) { App.navigate('/'); return; }

  const words = getWordsByCategory(config.category);
  if (!words.length) { Toast.error('No words found for this lesson.'); return; }

  // ── Step order guarantee ──────────────────────────────────────────────────
  // 1. TEACH every word first (up to 8 words)
  // 2. PRACTICE only words that have already been taught
  // This ensures the learner never sees an unfamiliar word in a quiz.
  const steps     = [];
  const cap        = Math.min(12, words.length);
  const session    = words.slice(0, cap);
  const teachCap   = Math.min(8, session.length);
  const teachWords = session.slice(0, teachCap);

  // Phase 1: all teach steps
  teachWords.forEach(w => steps.push({ type: 'teach', word: w }));

  // Phase 2: practice steps – only for already-taught words
  session.forEach((w, i) => {
    const alreadyTaught = teachWords.some(t => t.id === w.id);
    if (!alreadyTaught) return;
    const practiceType = ['mcq', 'type', 'listen', 'mcq', 'type'][i % 5];
    steps.push({ type: practiceType, word: w });
  });

  // Phase 3: one sentence-arrange step at the end
  if (teachWords.length >= 3) {
    const pick = teachWords[Math.floor(Math.random() * teachWords.length)];
    steps.push({ type: 'arrange', word: pick });
  }

  lessonState = {
    lessonId,
    config,
    words,
    steps,
    currentStep:  0,
    hearts:       Storage.getProfile().hearts,
    correct:      0,
    wrong:        0,
    xpEarned:     0,
    startTime:    Date.now(),
    taughtWordIds: [],   // populated as each teach step is shown
  };

  SRS.addWords(words.map(w => w.id));
  renderCurrentStep();
}

function renderCurrentStep() {
  const { steps, currentStep, hearts, config } = lessonState;
  const step  = steps[currentStep];
  const total = steps.length;

  // Mark the word as saw when we reach its teach card
  if (step.type === 'teach') {
    if (!lessonState.taughtWordIds.includes(step.word.id)) {
      lessonState.taughtWordIds.push(step.word.id);
    }
  }

  const heartsHtml = Array.from({ length: 5 }, (_, i) =>
    `<span class="heart ${i < hearts ? '' : 'empty'}">❤️</span>`
  ).join('');

  const dotsHtml = steps.map((_, i) => {
    const cls = i < currentStep ? 'done' : i === currentStep ? 'current' : '';
    return `<div class="lesson-step-dot ${cls}"></div>`;
  }).join('');

  let stepHtml = '';
  if      (step.type === 'teach')   stepHtml = buildTeachStep(step);
  else if (step.type === 'mcq')     stepHtml = buildMCQStep(step);
  else if (step.type === 'type')    stepHtml = buildTypeStep(step);
  else if (step.type === 'listen')  stepHtml = buildListenStep(step);
  else if (step.type === 'arrange') stepHtml = buildArrangeStep(step);
  else stepHtml = buildMCQStep(step);

  const html = `
    <div style="margin-bottom:-.5rem">
      <div class="flex-between mb-2">
        <button class="btn btn-secondary btn-sm" onclick="App.navigate('/')">✕ Exit</button>
        <div class="hearts-row">${heartsHtml}</div>
      </div>
      <div class="lesson-progress">${dotsHtml}</div>
    </div>

    <div style="text-align:center;margin-bottom:.75rem">
      <span class="text-xs text-muted">${config.icon} ${config.title} · Step ${currentStep+1}/${total}</span>
    </div>

    <div id="step-container">
      ${stepHtml}
    </div>
  `;

  renderScreen(html);

  if (step.type === 'teach' || step.type === 'listen') {
    setTimeout(() => Speech.speak(step.word.de), 600);
  }

  setTimeout(() => Speech.attachSpeakerButtons(), 100);
}

// ── Step Builders ─────────────────────────────────────────────────────────────

// Returns distractor words ONLY from words already taught in this lesson.
// Falls back to same-category, then any word, so the UI never breaks.
function getSeenDistractors(excludeId, count = 3) {
  const taughtIds = (lessonState && lessonState.taughtWordIds) || [];

  // Pool 1: already-taught words in this session (not the current word)
  let pool = VOCABULARY.filter(w => w.id !== excludeId && taughtIds.includes(w.id));

  // Pool 2: same category fallback
  if (pool.length < count) {
    const cat = lessonState ? lessonState.config.category : '';
    const extra = VOCABULARY.filter(w =>
      w.id !== excludeId &&
      !pool.some(p => p.id === w.id) &&
      w.category === cat
    );
    pool = [...pool, ...extra];
  }

  // Pool 3: anything (final fallback)
  if (pool.length < count) {
    const extra = VOCABULARY.filter(w =>
      w.id !== excludeId && !pool.some(p => p.id === w.id)
    );
    pool = [...pool, ...extra];
  }

  return shuffle(pool).slice(0, count);
}

function buildTeachStep(step) {
  const w = step.word;
  const articleHtml = w.gender ? `<div class="lesson-article">${genderToArticle(w.gender)}</div>` : '';
  return `
    <div class="lesson-card">
      <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">New Word</div>
      ${articleHtml}
      <div class="lesson-german-word">${w.de.replace(/^(der|die|das) /,'')}</div>
      <div class="lesson-english">${w.en}</div>
      ${w.plural ? `<div class="text-xs text-muted mt-1">Plural: ${w.plural}</div>` : ''}
      <div class="lesson-example mt-3">"${w.example_de}"<br><span class="text-muted">"${w.example_en}"</span></div>

      <div class="flex-center gap-2 mt-3">
        <button class="btn btn-secondary" data-speak="${w.de}" title="Hear it">
          <i class="fa-solid fa-volume-high"></i> Hear
        </button>
        ${Speech.isRecognitionSupported() ? `
        <button class="btn btn-secondary" id="quick-speak-btn" onclick="quickSpeakWord('${w.de.replace(/'/g,"\\'")}')"
                title="Say it aloud for instant feedback">
          <i class="fa-solid fa-microphone"></i> Say it
        </button>` : ''}
      </div>
      <div id="quick-speak-result" class="mt-2"></div>
    </div>
    <button class="btn btn-primary btn-block btn-lg mt-3" onclick="advanceStep()">
      Got it! <i class="fa-solid fa-arrow-right"></i>
    </button>`;
}

// Quick Speak: mic on teach card — instant feedback, no AI call
window.quickSpeakWord = function(targetWord) {
  const btn    = document.getElementById('quick-speak-btn');
  const result = document.getElementById('quick-speak-result');

  if (!btn || !result) return;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-stop fa-beat"></i> Listening...';
  btn.classList.add('mic-recording');
  result.innerHTML = '';

  Speech.startListening(
    (transcript) => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Say it';
      btn.classList.remove('mic-recording');

      // Simple: check if the recognized text matches the target word (ignoring article)
      const norm   = s => s.toLowerCase().replace(/^(der|die|das) /,'').replace(/[.,!?]/g,'').trim();
      const base   = norm(targetWord);
      const said   = norm(transcript);
      const sim    = Math.round((1 - Math.abs(base.length - said.length) / Math.max(base.length, said.length)) * 100);
      const pass   = said === base || said.includes(base) || base.includes(said);

      result.innerHTML = `
        <div style="padding:.5rem .75rem;border-radius:var(--radius-md);
             background:${pass ? 'rgba(16,185,129,.12)' : 'rgba(245,158,11,.12)'};
             border:1px solid ${pass ? 'rgba(16,185,129,.3)' : 'rgba(245,158,11,.3)'}">
          <span class="fw-700 ${pass ? 'text-success' : 'text-warning'} text-sm">
            ${pass ? '✅ Perfect!' : '🟡 Heard: "' + transcript + '"'}
          </span>
          ${!pass ? `<div class="text-xs text-muted mt-1">Expected: "${targetWord}"</div>` : ''}
        </div>`;

      if (pass) Gamification.awardXP(3);
    },
    (err) => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Say it';
      btn.classList.remove('mic-recording');
      result.innerHTML = `<div class="text-xs text-danger">${err}</div>`;
    }
  );
};

function buildMCQStep(step) {
  const w      = step.word;
  // ✅ Distractors ONLY come from words already taught in this lesson
  const wrong3 = getSeenDistractors(w.id, 3);
  const options = shuffle([
    { word: w, correct: true },
    ...wrong3.map(rw => ({ word: rw, correct: false }))
  ]);

  const optHtml = options.map((opt, i) => `
    <button class="mcq-option" id="mcq-opt-${i}" onclick="checkMCQ(${i}, ${opt.correct})">
      ${opt.word.en}
    </button>`).join('');

  return `
    <div class="lesson-card">
      <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">What does this mean?</div>
      <div class="lesson-german-word">${w.de}</div>
      <button class="btn btn-icon btn-secondary mt-2" data-speak="${w.de}">
        <i class="fa-solid fa-volume-high"></i>
      </button>
    </div>
    <div class="mcq-options">${optHtml}</div>`;
}

function buildTypeStep(step) {
  const w = step.word;
  return `
    <div class="lesson-card">
      <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">Type in German</div>
      <div class="lesson-english" style="font-size:1.4rem;font-weight:700;color:var(--text-primary)">${w.en}</div>
    </div>
    <div class="input-group mt-3">
      <input type="text" id="type-answer" class="modern-input" 
             placeholder="Type the German word..." 
             style="font-size:1.1rem;text-align:center"
             onkeydown="if(event.key==='Enter')checkType()">
    </div>
    <div class="flex-between mt-2">
      <button class="btn btn-secondary btn-sm" data-speak="${w.de}">
        <i class="fa-solid fa-volume-high"></i> Hear word
      </button>
      <button class="btn btn-primary mt-0" onclick="checkType()">
        Check <i class="fa-solid fa-arrow-right"></i>
      </button>
    </div>
    <div id="type-feedback" class="mt-2"></div>`;
}

function buildListenStep(step) {
  const w = step.word;
  // ✅ Distractors ONLY from already-taught lesson words
  const wrong3 = getSeenDistractors(w.id, 3);
  const options = shuffle([
    { word: w, correct: true },
    ...wrong3.map(rw => ({ word: rw, correct: false }))
  ]);

  const optHtml = options.map((opt, i) => `
    <button class="mcq-option" id="listen-opt-${i}" onclick="checkMCQ(${i}, ${opt.correct})">
      ${opt.word.de}
    </button>`).join('');

  return `
    <div class="lesson-card" style="text-align:center">
      <div class="text-xs text-muted mb-3" style="text-transform:uppercase;letter-spacing:.1em">Listen and choose</div>
      <button class="btn btn-primary btn-lg" onclick="Speech.speak('${w.de.replace(/'/g,"\\'")}', {force:true})">
        <i class="fa-solid fa-volume-high"></i> Play Audio
      </button>
    </div>
    <div class="mcq-options">${optHtml}</div>`;
}

function buildArrangeStep(step) {
  const w = step.word;
  const sentence = w.example_de;
  const words    = sentence.replace(/[.,!?]/g, '').split(' ');
  const shuffled = shuffle([...words]);

  window._arrangeAnswer   = words;
  window._arrangeSelected = [];

  const tilesHtml = shuffled.map((word, i) =>
    `<div class="word-tile" id="tile-${i}" onclick="selectTile(${i}, '${word.replace(/'/g,"\\'")}')">
      ${word}
    </div>`
  ).join('');

  return `
    <div class="lesson-card">
      <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">Arrange the sentence</div>
      <div class="lesson-english">${w.example_en}</div>
    </div>
    <div class="answer-zone" id="arrange-zone">
      <span class="text-muted text-sm" id="arrange-placeholder">Tap words to build the sentence...</span>
    </div>
    <div class="word-tiles">${tilesHtml}</div>
    <div class="flex-between mt-2">
      <button class="btn btn-secondary btn-sm" onclick="clearArrange()">↩ Reset</button>
      <button class="btn btn-primary" onclick="checkArrange()">Check ✓</button>
    </div>`;
}

// ── Interaction Handlers ──────────────────────────────────────────────────────

window.checkMCQ = function(index, isCorrect) {
  const allBtns = document.querySelectorAll('.mcq-option, [id^="listen-opt-"]');
  allBtns.forEach(b => b.disabled = true);

  const btn = document.getElementById(`mcq-opt-${index}`) || document.getElementById(`listen-opt-${index}`);
  if (btn) btn.classList.add(isCorrect ? 'correct' : 'wrong');

  if (isCorrect) {
    handleCorrect();
  } else {
    handleWrong();
  }

  setTimeout(advanceStep, 1200);
};

window.checkType = function() {
  const input    = document.getElementById('type-answer');
  const feedback = document.getElementById('type-feedback');
  const answer   = input.value.trim();
  const w        = lessonState.steps[lessonState.currentStep].word;

  const normalize = s => s.toLowerCase()
    .replace(/ü/g,'ue').replace(/ö/g,'oe').replace(/ä/g,'ae').replace(/ß/g,'ss');

  const targets  = [w.de, w.de.replace(/^(der|die|das) /,'')].map(normalize);
  const userNorm = normalize(answer);
  const isCorrect = targets.some(t => t === userNorm);

  if (isCorrect) {
    input.style.borderColor = 'var(--success)';
    feedback.innerHTML = `<div class="text-success text-sm">✅ Correct! "${w.de}"</div>`;
    handleCorrect();
    setTimeout(advanceStep, 1000);
  } else {
    input.style.borderColor = 'var(--danger)';
    feedback.innerHTML = `<div class="text-danger text-sm">❌ Answer: "${w.de}"</div>`;
    handleWrong();
    setTimeout(advanceStep, 1500);
  }
};

window.selectTile = function(idx, word) {
  const tile = document.getElementById(`tile-${idx}`);
  if (tile.classList.contains('placed')) return;
  tile.classList.add('placed');

  window._arrangeSelected.push({ idx, word });
  const zone = document.getElementById('arrange-zone');
  const ph   = document.getElementById('arrange-placeholder');
  if (ph) ph.style.display = 'none';

  const chip = document.createElement('div');
  chip.className    = 'word-tile';
  chip.style.cursor = 'default';
  chip.textContent  = word;
  zone.appendChild(chip);
};

window.clearArrange = function() {
  window._arrangeSelected = [];
  document.querySelectorAll('.word-tile').forEach(t => t.classList.remove('placed','correct','wrong'));
  const zone = document.getElementById('arrange-zone');
  zone.innerHTML = '<span class="text-muted text-sm" id="arrange-placeholder">Tap words to build the sentence...</span>';
};

window.checkArrange = function() {
  const selected  = window._arrangeSelected.map(s => s.word);
  const correct   = window._arrangeAnswer;
  const isCorrect = selected.join(' ') === correct.join(' ');

  if (isCorrect) {
    handleCorrect();
  } else {
    handleWrong();
    const zone = document.getElementById('arrange-zone');
    zone.innerHTML += `<div class="text-muted text-sm mt-1">Correct: "${correct.join(' ')}"</div>`;
  }
  setTimeout(advanceStep, 1500);
};

function handleCorrect() {
  lessonState.correct++;
  const xp = 10;
  lessonState.xpEarned += xp;
  Gamification.awardXP(xp);
}

function handleWrong() {
  lessonState.wrong++;
  const p = Gamification.loseHeart();
  lessonState.hearts = p.hearts;

  if (p.hearts <= 0) {
    setTimeout(showNoHeartsScreen, 600);
    return;
  }

  const heartsRow = document.querySelector('.hearts-row');
  if (heartsRow) {
    heartsRow.style.animation = 'heartLost .4s ease-out';
    setTimeout(() => heartsRow.style.animation = '', 500);
  }

  const w = lessonState.steps[lessonState.currentStep].word;
  Gamification.logMistake(w.category);
}

window.advanceStep = function() {
  lessonState.currentStep++;
  if (lessonState.currentStep >= lessonState.steps.length) {
    showLessonResults();
  } else {
    renderCurrentStep();
  }
};

// ── Results / No Hearts ───────────────────────────────────────────────────────

function showLessonResults() {
  const { correct, wrong, xpEarned, lessonId, config, words, startTime } = lessonState;
  const total    = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;
  const emoji    = accuracy >= 90 ? '🎉' : accuracy >= 60 ? '👍' : '💪';

  Gamification.completeLesson(lessonId, { accuracy });
  SRS.addWords(words.map(w => w.id));

  if (accuracy === 100) {
    Gamification.logMistake('perfect_lesson');
    setTimeout(confettiBurst, 300);
  }

  const html = `
    <div class="results-screen">
      <div class="results-emoji">${emoji}</div>
      <div class="results-title gradient-text-gold">Lesson Complete!</div>
      <div class="text-secondary mt-1">${config.icon} ${config.title}</div>

      <div class="results-stats mt-3">
        <div class="result-stat-box">
          <div class="result-stat-value text-success">${correct}</div>
          <div class="result-stat-label">Correct</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-value" style="color:var(--accent-gold)">${accuracy}%</div>
          <div class="result-stat-label">Accuracy</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-value" style="color:var(--accent-purple)">+${xpEarned+50}</div>
          <div class="result-stat-label">XP Earned</div>
        </div>
      </div>

      <div class="glass-card mt-3 mb-3" style="text-align:left">
        <div class="text-sm text-muted mb-1">Words added to review deck:</div>
        <div class="text-sm fw-700 text-gold">${words.length} words · Review in Flashcards 📇</div>
      </div>

      <button class="btn btn-primary btn-block btn-lg" onclick="App.navigate('/')">
        <i class="fa-solid fa-house"></i> Back to Home
      </button>
      <button class="btn btn-secondary btn-block mt-2" onclick="startLesson('${lessonId}')">
        <i class="fa-solid fa-rotate-right"></i> Retry Lesson
      </button>
    </div>`;

  renderScreen(html);
}

function showNoHeartsScreen() {
  const html = `
    <div class="results-screen">
      <div class="results-emoji">💔</div>
      <div class="results-title" style="color:var(--danger)">Out of Hearts!</div>
      <div class="text-secondary mt-2">Hearts regenerate 1 per hour. Come back later!</div>
      <div class="glass-card mt-3" style="text-align:center">
        <div style="font-size:2rem">❤️</div>
        <div class="text-sm text-muted mt-1">1 heart restores per hour</div>
      </div>
      <button class="btn btn-primary btn-block btn-lg mt-3" onclick="App.navigate('/')">
        <i class="fa-solid fa-house"></i> Back to Home
      </button>
    </div>`;
  renderScreen(html);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function genderToArticle(g) {
  return { m:'der', f:'die', n:'das' }[g] || '';
}
