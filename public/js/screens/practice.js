/* practice.js — Practice mode selector + daily challenge */
'use strict';

function renderPractice() {
  const dueCount = SRS.getDueCount();

  const modes = [
    { id:'flashcards', icon:'fa-solid fa-clone',       title:'Flashcard Review', sub:`${dueCount} card${dueCount!==1?'s':''} due`, route:'/practice/flashcards', color:'var(--grad-purple)', badge: dueCount },
    { id:'quiz',       icon:'fa-solid fa-brain',        title:'Quick Quiz',       sub:'10 random questions',  route:'/practice/quiz',       color:'var(--grad-blue)' },
    { id:'build',      icon:'fa-solid fa-pen',          title:'Sentence Builder', sub:'Arrange German words', route:'/practice/build',      color:'var(--grad-gold)' },
    { id:'listen',     icon:'fa-solid fa-headphones',   title:'Listening',        sub:'Hear it, pick it',     route:'/practice/listen',     color:'var(--grad-green)' },
    { id:'challenge',  icon:'fa-solid fa-trophy',       title:'Daily Challenge',  sub:'+100 XP reward',       route:'/practice/challenge',  color:'var(--grad-red)' },
    { id:'pronounce',  icon:'fa-solid fa-microphone',   title:'Pronunciation',    sub:'Speak & get scored',   route:'/ai/speak',            color:'var(--grad-purple)' },
  ];

  const html = `
    <div class="section-label mb-3">🎯 Practice Modes</div>
    <div style="display:grid;gap:.75rem">
      ${modes.map(m => `
        <div class="glass-card" style="cursor:pointer;display:flex;align-items:center;gap:1rem;padding:1rem 1.25rem"
             onclick="App.navigate('${m.route}')">
          <div style="width:48px;height:48px;border-radius:var(--radius-md);background:${m.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <i class="${m.icon}" style="color:#fff;font-size:1.25rem"></i>
          </div>
          <div style="flex:1">
            <div class="fw-700">${m.title}</div>
            <div class="text-sm text-muted mt-1">${m.sub}</div>
          </div>
          ${m.badge ? `<span style="background:var(--danger);color:#fff;border-radius:var(--radius-full);padding:.15rem .55rem;font-size:.75rem;font-weight:700">${m.badge}</span>` : '<i class="fa-solid fa-chevron-right text-muted"></i>'}
        </div>`).join('')}
    </div>

    <div class="glass-card mt-3">
      <div class="section-label mb-2">📊 Your Stats</div>
      <div class="stats-grid-2">
        <div class="stat-big-box"><div class="stat-big-value">${SRS.getTotalCount()}</div><div class="stat-big-label">Total Words</div></div>
        <div class="stat-big-box"><div class="stat-big-value text-success">${SRS.getMasteredCount()}</div><div class="stat-big-label">Mastered</div></div>
      </div>
    </div>
  `;

  renderScreen(html);
}

// ── Quick Quiz ───────────────────────────────────────────────────────────────
let quizState = null;

function renderQuiz() {
  const allWords = VOCABULARY.filter(w => SRS.getTotalCount() > 0
    ? Object.keys(Storage.getSRSCards()).includes(w.id)
    : true);

  const pool = allWords.sort(() => Math.random() - 0.5).slice(0, 10);

  quizState = {
    questions: pool.map(w => ({ word: w, type: Math.random() > 0.5 ? 'de_to_en' : 'en_to_de' })),
    current: 0, correct: 0, wrong: 0, xp: 0,
  };

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const { questions, current } = quizState;
  if (current >= questions.length) { showQuizResults(); return; }

  const q     = questions[current];
  const total = questions.length;
  const pct   = Math.round((current / total) * 100);
  const w     = q.word;

  const distractors = getRandomWords([w.id], 3);
  const isDeToEn    = q.type === 'de_to_en';
  const question    = isDeToEn ? w.de : w.en;
  const correctOpt  = isDeToEn ? w.en : w.de;
  const wrongOpts   = distractors.map(d => isDeToEn ? d.en : d.de);
  const options     = [correctOpt, ...wrongOpts].sort(() => Math.random() - 0.5);

  const html = `
    <div class="flex-between mb-2">
      <button class="btn btn-secondary btn-sm" onclick="App.navigate('/practice')">✕</button>
      <span class="text-sm text-muted">${current+1}/${total} · ${quizState.correct} ✅ ${quizState.wrong} ❌</span>
    </div>
    <div class="xp-bar-wrap mb-3"><div class="xp-bar-fill" style="width:${pct}%"></div></div>

    <div class="lesson-card mb-3">
      <div class="text-xs text-muted mb-2">${isDeToEn ? 'What does this mean?' : 'How do you say in German?'}</div>
      <div class="lesson-german-word" style="font-size:${isDeToEn?'2rem':'1.5rem'}">${question}</div>
      ${isDeToEn ? `<button class="btn btn-icon btn-secondary mt-2" data-speak="${w.de}"><i class="fa-solid fa-volume-high"></i></button>` : ''}
    </div>

    <div class="mcq-options">
      ${options.map((opt, i) => `
        <button class="mcq-option" onclick="checkQuizAnswer('${opt.replace(/'/g,"\\'")}', '${correctOpt.replace(/'/g,"\\'")}', this)">
          ${opt}
        </button>`).join('')}
    </div>
  `;

  renderScreen(html);
  setTimeout(() => Speech.attachSpeakerButtons(), 100);
}

window.checkQuizAnswer = function(selected, correct, btn) {
  document.querySelectorAll('.mcq-option').forEach(b => b.disabled = true);
  const isCorrect = selected === correct;
  btn.classList.add(isCorrect ? 'correct' : 'wrong');

  if (!isCorrect) {
    document.querySelectorAll('.mcq-option').forEach(b => {
      if (b.textContent.trim() === correct) b.classList.add('correct');
    });
    quizState.wrong++;
  } else {
    quizState.correct++;
    const xp = 10;
    quizState.xp += xp;
    Gamification.awardXP(xp);
  }

  quizState.current++;
  setTimeout(renderQuizQuestion, 1100);
};

function showQuizResults() {
  const { correct, wrong, xp } = quizState;
  const total    = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct/total)*100) : 0;

  renderScreen(`
    <div class="results-screen">
      <div class="results-emoji">${accuracy>=80?'🏆':accuracy>=60?'👍':'💪'}</div>
      <div class="results-title gradient-text-blue">Quiz Done!</div>
      <div class="results-stats mt-3">
        <div class="result-stat-box"><div class="result-stat-value text-success">${correct}</div><div class="result-stat-label">Correct</div></div>
        <div class="result-stat-box"><div class="result-stat-value text-gold">${accuracy}%</div><div class="result-stat-label">Accuracy</div></div>
        <div class="result-stat-box"><div class="result-stat-value" style="color:var(--accent-purple)">+${xp}</div><div class="result-stat-label">XP</div></div>
      </div>
      <button class="btn btn-primary btn-block btn-lg mt-3" onclick="renderQuiz()">Play Again</button>
      <button class="btn btn-secondary btn-block mt-2" onclick="App.navigate('/')">Home</button>
    </div>`);
}

// ── Daily Challenge ──────────────────────────────────────────────────────────
function renderDailyChallenge() {
  const p = Storage.getProfile();
  const today = new Date().toDateString();
  if (p.dailyChallengeDate === today && p.dailyChallengeCompleted) {
    renderScreen(`
      <div class="results-screen">
        <div class="results-emoji">🏆</div>
        <div class="results-title text-gold">Challenge Complete!</div>
        <div class="text-secondary mt-2">Come back tomorrow for a new challenge.</div>
        <button class="btn btn-primary btn-block btn-lg mt-3" onclick="App.navigate('/')">Home</button>
      </div>`);
    return;
  }

  // Daily challenge = timed quiz of 10 questions
  quizState = {
    questions: VOCABULARY.sort(() => Math.random() - 0.5).slice(0, 10)
      .map(w => ({ word:w, type: Math.random()>.5?'de_to_en':'en_to_de' })),
    current: 0, correct: 0, wrong: 0, xp: 0,
    isChallenge: true,
    startTime: Date.now(),
  };

  renderScreen(`
    <div class="results-screen">
      <div class="results-emoji">🏆</div>
      <div class="results-title gradient-text-gold">Daily Challenge</div>
      <div class="text-secondary mt-2">Answer 10 questions as fast as you can!</div>
      <div class="glass-card mt-3">
        <div class="text-center"><div style="font-size:2rem font-weight:900;color:var(--accent-gold)">+100 XP</div><div class="text-muted text-sm">on completion</div></div>
      </div>
      <button class="btn btn-primary btn-block btn-lg mt-3" onclick="renderQuizQuestion()">
        🚀 Start Challenge
      </button>
      <button class="btn btn-secondary btn-block mt-2" onclick="App.navigate('/')">Cancel</button>
    </div>`);
}

// Override showQuizResults for challenge
const _origShowQuizResults = showQuizResults;
