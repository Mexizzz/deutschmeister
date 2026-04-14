/* flashcards.js — SRS Flashcard Review */
'use strict';

let fcState = null;

function renderFlashcards() {
  const dueCards = SRS.getDueCards(20);

  if (dueCards.length === 0) {
    renderScreen(`
      <div class="results-screen">
        <div class="results-emoji">🎉</div>
        <div class="results-title gradient-text-gold">All Caught Up!</div>
        <div class="text-secondary mt-2">No flashcards due right now.<br>Come back later for your next review.</div>
        <div class="glass-card mt-3">
          <div class="flex-between">
            <span class="text-muted">Total cards</span>
            <span class="fw-700">${SRS.getTotalCount()}</span>
          </div>
          <div class="flex-between mt-2">
            <span class="text-muted">Mastered</span>
            <span class="fw-700 text-success">${SRS.getMasteredCount()}</span>
          </div>
        </div>
        <button class="btn btn-primary btn-block btn-lg mt-3" onclick="App.navigate('/')">
          <i class="fa-solid fa-house"></i> Home
        </button>
        <button class="btn btn-secondary btn-block mt-2" onclick="SRS.resetAllDue(); renderFlashcards()">
          Practice All Cards
        </button>
      </div>`);
    return;
  }

  fcState = {
    cards: dueCards,
    current: 0,
    reviewed: 0,
    session: { again:0, good:0, easy:0 },
  };

  renderCurrentCard();
}

function renderCurrentCard() {
  const { cards, current, session } = fcState;

  if (current >= cards.length) {
    showFlashcardResults();
    return;
  }

  const card = cards[current];
  const word = getWordById(card.wordId);
  if (!word) { fcState.current++; renderCurrentCard(); return; }

  const total    = cards.length;
  const progress = Math.round((current / total) * 100);

  const html = `
    <div class="flex-between mb-3">
      <button class="btn btn-secondary btn-sm" onclick="App.navigate('/practice')">✕ Exit</button>
      <span class="text-sm text-muted">${current + 1} / ${total}</span>
    </div>

    <div class="xp-bar-wrap mb-3">
      <div class="xp-bar-fill" style="width:${progress}%"></div>
    </div>

    <!-- Flashcard -->
    <div class="flashcard-scene" onclick="flipCard()">
      <div class="flashcard" id="fc-card">
        <div class="flashcard-front">
          <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">German</div>
          <div class="card-word">${word.de}</div>
          ${word.gender ? `<div class="card-hint">${{m:'masculine',f:'feminine',n:'neuter'}[word.gender]}</div>` : ''}
          <button class="btn btn-icon btn-secondary mt-3" data-speak="${word.de}" onclick="event.stopPropagation()">
            <i class="fa-solid fa-volume-high"></i>
          </button>
          <div class="card-hint mt-3" style="font-style:italic">Tap to reveal →</div>
        </div>
        <div class="flashcard-back">
          <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">English</div>
          <div class="card-translation">${word.en}</div>
          ${word.plural ? `<div class="card-hint">Plural: ${word.plural}</div>` : ''}
          <div class="card-example">"${word.example_de}"</div>
        </div>
      </div>
    </div>

    <!-- Rating buttons (hidden until flipped) -->
    <div id="rating-buttons" class="hide mt-3">
      <div class="section-label text-center mb-2">How well did you know it?</div>
      <div class="flex-between gap-2">
        <button class="btn btn-danger" style="flex:1" onclick="rateCard(0)">
          😕 Again
        </button>
        <button class="btn btn-secondary" style="flex:1" onclick="rateCard(1)">
          👍 Good
        </button>
        <button class="btn btn-success" style="flex:1" onclick="rateCard(2)">
          ⭐ Easy
        </button>
      </div>
    </div>
  `;

  renderScreen(html);
  setTimeout(() => Speech.attachSpeakerButtons(), 100);
}

window.flipCard = function() {
  const card = document.getElementById('fc-card');
  const btns = document.getElementById('rating-buttons');
  if (!card) return;
  card.classList.toggle('flipped');
  if (card.classList.contains('flipped') && btns) {
    btns.classList.remove('hide');
    // Speak translation
    const word = getWordById(fcState.cards[fcState.current].wordId);
    if (word) Speech.speak(word.de);
  }
};

window.rateCard = function(quality) {
  const card = fcState.cards[fcState.current];
  SRS.recordReview(card.wordId, quality);

  if (quality === 0) fcState.session.again++;
  else if (quality === 1) fcState.session.good++;
  else fcState.session.easy++;

  fcState.current++;
  fcState.reviewed++;

  // Award XP
  Gamification.awardXP(quality === 2 ? 15 : quality === 1 ? 10 : 5);

  renderCurrentCard();
};

function showFlashcardResults() {
  const { session, reviewed } = fcState;
  const html = `
    <div class="results-screen">
      <div class="results-emoji">🧠</div>
      <div class="results-title gradient-text-purple">Review Complete!</div>
      <div class="text-secondary mt-1">You reviewed ${reviewed} cards</div>

      <div class="results-stats mt-3">
        <div class="result-stat-box">
          <div class="result-stat-value text-success">${session.easy}</div>
          <div class="result-stat-label">Easy ⭐</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-value" style="color:var(--accent-blue)">${session.good}</div>
          <div class="result-stat-label">Good 👍</div>
        </div>
        <div class="result-stat-box">
          <div class="result-stat-value" style="color:var(--danger)">${session.again}</div>
          <div class="result-stat-label">Again 😕</div>
        </div>
      </div>

      <div class="glass-card mt-3">
        <div class="flex-between">
          <span class="text-muted">Words mastered</span>
          <span class="fw-700 text-success">${SRS.getMasteredCount()}</span>
        </div>
        <div class="flex-between mt-2">
          <span class="text-muted">Due tomorrow</span>
          <span class="fw-700">~${session.good + session.easy}</span>
        </div>
      </div>

      <button class="btn btn-primary btn-block btn-lg mt-3" onclick="App.navigate('/')">
        <i class="fa-solid fa-house"></i> Home
      </button>
    </div>`;
  renderScreen(html);
}
