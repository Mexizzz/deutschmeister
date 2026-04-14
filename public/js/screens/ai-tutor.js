/* ai-tutor.js — AI Tutor Q&A + Pronunciation Coach (v2) */
'use strict';

// ── Pronunciation targets with phonetic guides ────────────────────────────────
const PRONUNCIATION_TARGETS = [
  { de:'Hallo!',             en:'Hello!',                     phonetic:'HAH-loh'                        },
  { de:'Guten Morgen!',      en:'Good morning!',              phonetic:'GOO-ten MOR-gen'                 },
  { de:'Guten Abend!',       en:'Good evening!',              phonetic:'GOO-ten AH-bent'                 },
  { de:'Wie heißen Sie?',    en:'What is your name? (formal)',phonetic:'Vee HY-sen Zee'                  },
  { de:'Ich heiße...',       en:'My name is...',              phonetic:'Ikh HY-suh'                      },
  { de:'Wie geht es Ihnen?', en:'How are you? (formal)',      phonetic:'Vee gayt es EE-nen'              },
  { de:'Danke schön!',       en:'Thank you very much!',       phonetic:'DAHN-kuh shern'                  },
  { de:'Bitte sehr!',        en:'You\'re very welcome!',      phonetic:'BIT-tuh zayr'                    },
  { de:'Entschuldigung!',    en:'Excuse me / Sorry!',         phonetic:'Ent-SHOOL-dee-goong'             },
  { de:'Ich spreche Deutsch.',en:'I speak German.',           phonetic:'Ikh SHPREH-khuh Doytch'          },
  { de:'Wo ist die Toilette?',en:'Where is the bathroom?',   phonetic:'Voh ist dee toh-LET-tuh'         },
  { de:'Das Wetter ist schön.',en:'The weather is nice.',     phonetic:'Das VET-ter ist shern'           },
  { de:'Ich möchte Kaffee.',  en:'I would like coffee.',      phonetic:'Ikh MERKH-tuh KAH-fay'           },
  { de:'Auf Wiedersehen!',    en:'Goodbye! (formal)',         phonetic:'Owf VEE-der-zayn'                },
  { de:'Tschüss!',            en:'Bye! (informal)',           phonetic:'Chüss (like "choose" + ü)'       },
];

let pronounceState = { target: null };

// ── Levenshtein similarity (0–100%) ──────────────────────────────────────────
function stringSimilarity(a, b) {
  const s1 = a.toLowerCase().replace(/[.,!?]/g, '').trim();
  const s2 = b.toLowerCase().replace(/[.,!?]/g, '').trim();
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;

  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = s1[i-1] === s2[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
    }
  }

  const maxLen = Math.max(m, n);
  return Math.round((1 - dp[m][n] / maxLen) * 100);
}

// ── Word-level diff ───────────────────────────────────────────────────────────
function buildWordDiff(spoken, target) {
  const norm = s => s.toLowerCase().replace(/[.,!?]/g, '').trim();
  const targetWords = target.split(/\s+/);
  const spokenWords = spoken.split(/\s+/);

  return targetWords.map(tw => {
    const hit = spokenWords.find(sw => norm(sw) === norm(tw));
    if (hit) return `<span style="color:var(--success);font-weight:700">${tw}</span>`;
    // Close match?
    const close = spokenWords.find(sw => stringSimilarity(norm(sw), norm(tw)) >= 70);
    if (close) return `<span style="color:var(--warning);font-weight:700;border-bottom:2px solid var(--warning)" title="You said: ${close}">${tw}</span>`;
    return `<span style="color:var(--danger);font-weight:700;text-decoration:underline dotted" title="Missed">${tw}</span>`;
  }).join(' ');
}

// ── Render the Pronunciation Coach ────────────────────────────────────────────
function renderAISpeak() {
  const target = PRONUNCIATION_TARGETS[Math.floor(Math.random() * PRONUNCIATION_TARGETS.length)];
  pronounceState = { target };

  const supported = Speech.isRecognitionSupported();

  const html = `
    <div class="section-label mb-1">🎤 Pronunciation Coach</div>
    <p class="text-secondary text-sm mb-3">Listen to the example, then record yourself. We compare your speech word-by-word.</p>

    <!-- Technical note for transparency -->
    <div class="glass-card mb-3" style="background:rgba(139,92,246,.07);border-color:rgba(139,92,246,.25)">
      <div class="text-xs fw-700 text-purple mb-1">ℹ️ How scoring works</div>
      <div class="text-xs text-secondary">
        Your voice is transcribed by your browser's German speech engine, then we compare it word-by-word to the target.
        <strong>🟢 Green</strong> = recognized correctly · <strong>🟡 Yellow</strong> = close match · <strong>🔴 Red</strong> = missed/different.
        For best results use <strong>Chrome or Edge</strong>.
      </div>
    </div>

    <!-- Target phrase card -->
    <div class="glass-card mb-3" style="text-align:center">
      <div class="text-xs text-muted mb-2" style="text-transform:uppercase;letter-spacing:.1em">Say This in German:</div>
      <div id="target-phrase" style="font-size:1.6rem;font-weight:900;color:var(--text-primary);line-height:1.2">${target.de}</div>
      <div class="text-secondary mt-1 mb-1">${target.en}</div>

      <!-- Phonetic guide -->
      <div style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);border-radius:var(--radius-md);padding:.5rem .75rem;margin:.75rem 0;display:inline-block">
        <div class="text-xs text-muted mb-1">📢 Pronunciation Guide:</div>
        <div class="fw-700 text-gold" style="font-size:1rem;letter-spacing:.04em">${target.phonetic}</div>
      </div>

      <div class="flex-center gap-2 mt-2">
        <button class="btn btn-secondary" data-speak="${target.de}">
          <i class="fa-solid fa-volume-high"></i> Hear Slowly
        </button>
        <button class="btn btn-secondary" onclick="Speech.speakWordByWord('${target.de.replace(/'/g,"\\'")}')">
          🐢 Word by Word
        </button>
      </div>
    </div>

    <!-- Recording card -->
    ${supported ? `
      <div class="glass-card mb-3" style="text-align:center" id="record-card">
        <div id="record-status" class="text-muted text-sm mb-3">Press the button and speak clearly in German.</div>

        <!-- Live transcript display -->
        <div id="live-transcript" class="hide" style="min-height:32px;background:rgba(0,0,0,.2);border-radius:var(--radius-md);padding:.5rem .75rem;margin-bottom:.75rem;font-size:.9rem;font-style:italic;color:var(--text-secondary)">
          ...
        </div>

        <div id="waveform-container" class="flex-center mb-3 hide">${createWaveform()}</div>

        <button class="btn btn-primary btn-lg" id="record-btn" onclick="startPronunciation()">
          <i class="fa-solid fa-microphone"></i> Start Recording
        </button>

        <div class="text-xs text-muted mt-2">🎙️ Speak German only · Make sure your microphone is on</div>
      </div>` : `
      <div class="glass-card mb-3">
        <div class="text-warning fw-700">⚠️ Speech recognition not supported</div>
        <div class="text-sm text-secondary mt-1">Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for pronunciation practice.</div>
      </div>`}

    <!-- Results appear here -->
    <div id="pronunciation-result"></div>

    <!-- Controls -->
    <div class="flex gap-2 mt-3">
      <button class="btn btn-secondary" style="flex:1" onclick="renderAISpeak()">🔀 New Phrase</button>
      <button class="btn btn-secondary" style="flex:1" onclick="App.navigate('/ai')">← AI Hub</button>
    </div>
  `;

  renderScreen(html);
  setTimeout(() => Speech.attachSpeakerButtons(), 100);
}

window.startPronunciation = function() {
  const btn        = document.getElementById('record-btn');
  const status     = document.getElementById('record-status');
  const wave       = document.getElementById('waveform-container');
  const liveDiv    = document.getElementById('live-transcript');
  const resultEl   = document.getElementById('pronunciation-result');

  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-stop fa-beat"></i> Listening...'; btn.classList.add('mic-recording'); }
  if (status) status.textContent = '🎙️ Speak now — say the sentence above!';
  if (wave) wave.classList.remove('hide');
  if (liveDiv) { liveDiv.classList.remove('hide'); liveDiv.textContent = '...'; }
  if (resultEl) resultEl.innerHTML = '';

  Speech.startListening(
    // Final result
    async (transcript) => {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Record Again'; btn.classList.remove('mic-recording'); }
      if (wave) wave.classList.add('hide');
      if (liveDiv) { liveDiv.textContent = `"${transcript}"`; }
      if (status) status.innerHTML = `✅ Recognized: <strong>"${transcript}"</strong>`;

      await evaluatePronunciation(transcript, pronounceState.target.de);
    },
    // Error
    (err) => {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Start Recording'; btn.classList.remove('mic-recording'); }
      if (wave) wave.classList.add('hide');
      if (liveDiv) liveDiv.classList.add('hide');
      if (status) status.textContent = '❌ ' + err;
      Toast.error(err, 4000);
    },
    // Interim (live feedback)
    (interim) => {
      if (liveDiv) { liveDiv.classList.remove('hide'); liveDiv.textContent = `"${interim}..."`; }
    }
  );
};

async function evaluatePronunciation(spoken, target) {
  const resultEl = document.getElementById('pronunciation-result');
  if (resultEl) resultEl.innerHTML = `
    <div class="glass-card">
      <div class="skeleton" style="height:1rem;margin-bottom:.5rem"></div>
      <div class="skeleton" style="height:1rem;margin-bottom:.5rem;width:80%"></div>
      <div class="skeleton" style="height:1rem;width:60%"></div>
    </div>`;

  // 1. Compute local similarity score immediately (no AI latency)
  const localScore = stringSimilarity(spoken, target);

  // 2. Build word diff
  const diffHtml = buildWordDiff(spoken, target);

  // 3. Ask Groq for detailed coaching (non-blocking)
  let aiResult = null;
  try {
    aiResult = await AI.evaluatePronunciation(spoken, target);
  } catch (e) {
    aiResult = {
      score: localScore,
      feedback: localScore >= 80 ? 'Great job! Your pronunciation was recognized correctly.' : 'Some words were not recognized. Try speaking more slowly.',
      issues: [],
      encouragement: 'Keep practicing! Consistency is key.',
    };
  }

  // Blend: use local score if AI was way off, else average
  const finalScore = Math.round((localScore * 0.6) + ((aiResult.score ?? localScore) * 0.4));
  const issues     = aiResult.issues || [];

  const scoreColor = finalScore >= 80 ? 'var(--success)' : finalScore >= 60 ? 'var(--warning)' : 'var(--danger)';
  const scoreEmoji = finalScore >= 90 ? '🌟' : finalScore >= 75 ? '👍' : finalScore >= 55 ? '💪' : '🔄';

  if (resultEl) resultEl.innerHTML = `
    <div class="glass-card mb-3">

      <!-- Score -->
      <div class="flex-between mb-3">
        <div>
          <div style="font-size:2.5rem;font-weight:900;color:${scoreColor};line-height:1">${finalScore}%</div>
          <div class="text-xs text-muted mt-1">Pronunciation Score</div>
        </div>
        <div style="font-size:3rem">${scoreEmoji}</div>
      </div>

      <!-- What was recognized vs target diff -->
      <div class="text-xs text-muted mb-1" style="text-transform:uppercase;letter-spacing:.08em">Word-by-Word Comparison:</div>
      <div class="glass-card mb-2" style="padding:.75rem;font-size:1.1rem;background:rgba(0,0,0,.2)">
        <div class="text-xs text-muted mb-1">🎯 Target:</div>
        <div style="font-size:1rem;font-weight:700">${diffHtml}</div>
        <div class="text-xs text-muted mt-2 mb-1">🎤 You said:</div>
        <div style="font-size:.9rem;color:var(--text-secondary);font-style:italic">"${spoken}"</div>
      </div>

      <!-- Legend -->
      <div class="flex gap-2 mb-3" style="font-size:.75rem">
        <span>🟢 Correct</span>
        <span>🟡 Close match</span>
        <span>🔴 Missing/different</span>
      </div>

      <!-- AI Feedback -->
      <div class="fw-700 mb-2">${aiResult.feedback || 'Good effort!'}</div>

      ${issues.length > 0 ? `
        <div class="section-label mb-2">💡 Pronunciation Tips</div>
        ${issues.map(issue => `
          <div class="error-card mb-2" style="background:rgba(245,158,11,.07);border-color:rgba(245,158,11,.25)">
            <div class="error-card-label" style="color:var(--accent-gold)">🔊 "${issue.word}"</div>
            <div class="error-card-explanation">${issue.tip}</div>
          </div>`).join('')}` : finalScore >= 80 ? `
        <div class="text-success text-sm fw-700 mb-2">✅ All words recognized correctly!</div>` : ''}

      <!-- Phonetic reminder -->
      <div class="glass-card mt-2" style="background:rgba(139,92,246,.07);border-color:rgba(139,92,246,.25);text-align:center">
        <div class="text-xs text-muted mb-1">📢 Remember the pronunciation:</div>
        <div class="fw-700 text-purple" style="font-size:1rem">${pronounceState.target.phonetic}</div>
      </div>

      <div class="text-center mt-3 text-secondary text-sm">${aiResult.encouragement || 'Keep practicing!'}</div>
    </div>

    <!-- Try again -->
    <button class="btn btn-primary btn-block" onclick="startPronunciation()">
      <i class="fa-solid fa-rotate-right"></i> Try Again
    </button>`;

  const xp = Math.round(finalScore / 10);
  Gamification.awardXP(xp);
  Toast.info(`🎤 +${xp} XP — Score: ${finalScore}%`, 3000);
}

// ── AI Tutor Q&A ──────────────────────────────────────────────────────────────
const TUTOR_CHIPS = [
  'When do I use der/die/das?',
  'Explain German cases simply',
  'How does verb conjugation work?',
  'Difference between sein and haben',
  'German word order rules',
  'How to use Akkusativ',
  'What are Trennbare Verben?',
  'How to form German plurals',
  'When to use kein vs nicht',
];

let tutorHistory = [];

function renderAITutor() {
  tutorHistory = [];

  const html = `
    <div class="section-label mb-1">🧑‍🏫 AI German Tutor</div>
    <p class="text-secondary text-sm mb-3">Ask any question about German grammar, vocabulary, or culture. Get clear, example-rich answers.</p>

    <div class="chips-row" id="chip-row">
      ${TUTOR_CHIPS.map(c => `<div class="chip" onclick="askTutorQuestion('${c.replace(/'/g,"\\'")}')">${c}</div>`).join('')}
    </div>

    <div id="tutor-messages" style="display:flex;flex-direction:column;gap:1rem;margin-bottom:1rem"></div>

    <div class="chat-input-bar" style="position:sticky;bottom:var(--nav-height);margin:0 -1.25rem;padding:.75rem 1.25rem">
      <input type="text" id="tutor-input" class="chat-input" 
             placeholder="Ask about German grammar..."
             onkeydown="if(event.key==='Enter'){event.preventDefault();askTutorFromInput()}">
      <button class="btn btn-purple btn-icon" onclick="askTutorFromInput()">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  `;

  renderScreen(html);
}

window.askTutorFromInput = function() {
  const input = document.getElementById('tutor-input');
  const q = input?.value.trim();
  if (!q) return;
  if (input) input.value = '';
  askTutorQuestion(q);
};

async function askTutorQuestion(question) {
  const msgs = document.getElementById('tutor-messages');
  if (!msgs) return;

  const chipRow = document.getElementById('chip-row');
  if (chipRow) chipRow.classList.add('hide');

  const userBubble = document.createElement('div');
  userBubble.className = 'bubble bubble-user';
  userBubble.textContent = question;
  msgs.appendChild(userBubble);

  const skeleton = document.createElement('div');
  skeleton.className = 'glass-card';
  skeleton.innerHTML = `
    <div class="skeleton" style="height:.9rem;margin-bottom:.5rem"></div>
    <div class="skeleton" style="height:.9rem;margin-bottom:.5rem;width:80%"></div>
    <div class="skeleton" style="height:.9rem;width:60%"></div>`;
  msgs.appendChild(skeleton);
  msgs.scrollTop = msgs.scrollHeight;

  Gamification.awardXP(5);

  try {
    const result = await AI.askTutor(question);
    skeleton.remove();

    const aiCard = document.createElement('div');
    aiCard.className = 'glass-card';
    aiCard.innerHTML = `
      <div class="flex-between mb-2">
        <span style="font-size:.75rem;font-weight:700;color:var(--accent-purple)">🧑‍🏫 Tutor Answer</span>
      </div>
      ${renderMarkdown(result.answer || 'No answer received.')}`;
    msgs.appendChild(aiCard);
    msgs.scrollTop = msgs.scrollHeight;
  } catch (err) {
    skeleton.innerHTML = `<div class="error-card"><div class="error-card-label">Error</div><div class="error-card-explanation">${err.message}</div></div>`;
  }
}
