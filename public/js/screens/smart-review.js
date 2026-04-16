/* smart-review.js — Smart Review Session (picks what you most need to practice) */
'use strict';

let reviewState = null;

// ── Pick the smartest words to review ────────────────────────────────────────
function getSmartReviewWords(count = 8) {
  const cards     = Storage.getSRSCards();
  const mistakeLog = Storage.getProfile().mistakeLog || {};
  const bookmarks = Storage.get('bookmarks', []);
  const now       = Date.now();

  // Score each word in the deck
  const scored = Object.values(cards).map(card => {
    const word = VOCABULARY.find(w => w.id === card.wordId);
    if (!word) return null;

    let score = 0;

    // 1. Overdue cards = highest priority
    const overdueDays = Math.max(0, (now - card.nextReview) / (1000 * 60 * 60 * 24));
    score += overdueDays * 10;

    // 2. Words in mistake log
    const mistakeCount = mistakeLog[word.category] || 0;
    score += mistakeCount * 5;

    // 3. Bookmarked words (user flagged as hard)
    if (bookmarks.includes(word.id)) score += 20;

    // 4. Low ease factor = historically hard for user
    score += (2.5 - (card.easeFactor || 2.5)) * 8;

    // 5. Recently reviewed wrong
    if (card.lastResult === 0) score += 15;

    return { word, card, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score);

  // Also add bookmarked words not yet in SRS deck
  const deckIds  = Object.keys(cards);
  const extras   = bookmarks
    .filter(id => !deckIds.includes(id))
    .map(id => VOCABULARY.find(w => w.id === id))
    .filter(Boolean)
    .map(word => ({ word, card: null, score: 25 }));

  return [...scored, ...extras].slice(0, count).map(s => s.word);
}

// ── Render the smart review menu ──────────────────────────────────────────────
function renderSmartReview() {
  const words = getSmartReviewWords(8);

  if (!words.length) {
    renderScreen(`
      <div class="results-screen">
        <div class="results-emoji">🎉</div>
        <div class="results-title gradient-text-gold">Nothing to Review!</div>
        <div class="text-secondary mt-2">Complete some lessons first to build your vocabulary deck.</div>
        <button class="btn btn-primary btn-block mt-3" onclick="App.navigate('/learn')">Go to Lessons →</button>
      </div>`);
    return;
  }

  const html = `
    <div class="section-label mb-1">🧠 Smart Review</div>
    <p class="text-secondary text-sm mb-3">
      AI selected <strong>${words.length} words</strong> you're most likely to forget today — based on your SRS schedule, mistakes, and bookmarks.
    </p>

    <div class="glass-card mb-3" style="background:linear-gradient(135deg,rgba(139,92,246,.12),rgba(99,102,241,.08));border-color:rgba(139,92,246,.3)">
      <div class="fw-700 mb-1">📊 Selection criteria:</div>
      <div class="text-sm text-secondary">
        📅 Overdue SRS cards · ❌ Categories with past mistakes · ⭐ Bookmarked words · 📉 Low ease-factor words
      </div>
    </div>

    <!-- Preview the words -->
    <div class="glass-card mb-3">
      <div class="fw-700 mb-2">Today's Review Words:</div>
      <div style="display:flex;flex-wrap:wrap;gap:.4rem">
        ${words.map(w => `
          <span style="padding:.25rem .65rem;background:rgba(255,255,255,.06);border:1px solid var(--panel-border);border-radius:var(--radius-full);font-size:.82rem;font-weight:600">
            ${w.de}
          </span>`).join('')}
      </div>
    </div>

    <button class="btn btn-purple btn-block btn-lg mb-2" onclick="startSmartReview()">
      🧠 Start Review (${words.length} cards)
    </button>
    <button class="btn btn-secondary btn-block" onclick="App.navigate('/dashboard')">← Back</button>
  `;

  renderScreen(html);

  // Store words for the session
  window._smartReviewWords = words;
}

window.startSmartReview = function() {
  const words = window._smartReviewWords || getSmartReviewWords(8);
  if (!words.length) { App.navigate('/dashboard'); return; }

  reviewState = {
    words,
    current: 0,
    correct: 0,
    wrong:   0,
    startTime: Date.now(),
  };

  renderReviewCard();
};

function renderReviewCard() {
  const { words, current, correct, wrong } = reviewState;
  const w = words[current];
  const total = words.length;

  // Random question type each time
  const types = ['meaning', 'german'];
  if (w.gender) types.push('article');
  const type = types[Math.floor(Math.random() * types.length)];

  // Build options
  const others = VOCABULARY.filter(x => x.id !== w.id && x.category === w.category);
  const pool   = others.length >= 3 ? others : VOCABULARY.filter(x => x.id !== w.id);
  const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 3);

  let question = '', options = [];

  if (type === 'meaning') {
    question = `What does <strong>${w.de}</strong> mean?`;
    options  = [{ text: w.en, correct: true }, ...picked.map(p => ({ text: p.en, correct: false }))];
  } else if (type === 'german') {
    question = `How do you say <strong>"${w.en}"</strong> in German?`;
    options  = [{ text: w.de, correct: true }, ...picked.map(p => ({ text: p.de, correct: false }))];
  } else {
    const art = { m:'der', f:'die', n:'das' }[w.gender];
    const base = w.de.replace(/^(der|die|das) /, '');
    question = `What's the article for <strong>${base}</strong>?`;
    options  = ['der','die','das'].map(a => ({ text: a, correct: a === art }));
  }

  options = [...options].sort(() => Math.random() - 0.5);

  const dotsHtml = words.map((_, i) => {
    const cls = i < current ? 'done' : i === current ? 'current' : '';
    return `<div class="lesson-step-dot ${cls}"></div>`;
  }).join('');

  const html = `
    <div class="flex-between mb-2">
      <button class="btn btn-secondary btn-sm" onclick="App.navigate('/dashboard')">✕ Exit</button>
      <div class="text-sm fw-700 text-purple">${current + 1} / ${total}</div>
    </div>
    <div class="lesson-progress mb-3">${dotsHtml}</div>

    <div class="lesson-card mb-3">
      <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">🧠 Smart Review</div>
      <div class="fw-700" style="font-size:1.1rem;line-height:1.5">${question}</div>
      <button class="btn btn-icon btn-secondary mt-2" data-speak="${w.de}">
        <i class="fa-solid fa-volume-high"></i>
      </button>
    </div>

    <div class="mcq-options">
      ${options.map((opt, i) => `
        <button class="mcq-option" id="ropt-${i}" onclick="answerReview(${i}, ${opt.correct})">
          ${opt.text}
        </button>`).join('')}
    </div>
    <div id="review-feedback" class="mt-2"></div>
  `;

  renderScreen(html);
  setTimeout(() => {
    Speech.speak(w.de);
    Speech.attachSpeakerButtons();
  }, 300);
}

window.answerReview = function(index, isCorrect) {
  document.querySelectorAll('.mcq-option').forEach(b => b.disabled = true);
  document.getElementById(`ropt-${index}`)?.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    document.querySelectorAll('.mcq-option').forEach(b => {
      if (b.textContent.trim() && reviewState) {
        // Highlight correct
      }
    });
  }

  const w = reviewState.words[reviewState.current];
  if (isCorrect) {
    reviewState.correct++;
    SRS.recordReview(w.id, 1);
    Gamification.awardXP(8);
  } else {
    reviewState.wrong++;
    SRS.recordReview(w.id, 0);
  }

  const fb = document.getElementById('review-feedback');
  if (fb) {
    fb.innerHTML = `
      <div class="glass-card" style="padding:.65rem 1rem;border-color:${isCorrect?'rgba(16,185,129,.3)':'rgba(239,68,68,.3)'}">
        <span class="${isCorrect?'text-success':'text-danger'} fw-700">${isCorrect ? '✅ Correct!' : `❌ "${w.de}" = "${w.en}"`}</span>
      </div>`;
  }

  setTimeout(() => {
    reviewState.current++;
    if (reviewState.current >= reviewState.words.length) {
      showReviewResults();
    } else {
      renderReviewCard();
    }
  }, 1000);
};

function showReviewResults() {
  const { correct, wrong, words, startTime } = reviewState;
  const total = correct + wrong;
  const pct   = total ? Math.round((correct / total) * 100) : 100;
  const timeSec = Math.round((Date.now() - startTime) / 1000);

  if (pct >= 80) { setTimeout(confettiBurst, 300); }

  const html = `
    <div class="results-screen">
      <div class="results-emoji">${pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'}</div>
      <div class="results-title gradient-text-gold">Review Complete!</div>

      <div class="results-stats mt-3">
        <div class="result-stat-box">
          <div class="result-stat-value text-success">${correct}</div>
          <div class="result-stat-label">Correct</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-value" style="color:var(--accent-gold)">${pct}%</div>
          <div class="result-stat-label">Score</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-value" style="color:var(--accent-purple)">${timeSec}s</div>
          <div class="result-stat-label">Time</div>
        </div>
      </div>

      <div class="glass-card mt-3 mb-3">
        <div class="text-sm text-muted">SRS cards updated based on your answers 📇</div>
      </div>

      <button class="btn btn-primary btn-block btn-lg mb-2" onclick="renderSmartReview()">
        <i class="fa-solid fa-rotate-right"></i> Another Review
      </button>
      <button class="btn btn-secondary btn-block" onclick="App.navigate('/dashboard')">Home</button>
    </div>`;

  renderScreen(html);
}
