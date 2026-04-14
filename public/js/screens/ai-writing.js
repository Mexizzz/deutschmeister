/* ai-writing.js — AI Grammar Corrector */
'use strict';

const WRITING_PROMPTS = [
  'Describe what you did today',
  'Introduce yourself in German',
  'Write about your family',
  'Describe your favorite food',
  'Talk about your hobbies',
  'Describe your city',
  'Write about a trip you took',
  'Talk about your daily routine',
];

function renderAIWriting() {
  const prompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];

  const html = `
    <div class="section-label mb-1">✏️ Writing Practice</div>
    <p class="text-secondary text-sm mb-3">Write German text and get instant AI grammar corrections with explanations.</p>

    <div class="glass-card mb-3">
      <div class="text-xs text-muted mb-1">📝 Writing Prompt</div>
      <div class="fw-700" id="writing-prompt">${prompt}</div>
      <button class="btn btn-secondary btn-sm mt-2" onclick="newWritingPrompt()">New Prompt 🔀</button>
    </div>

    <div class="input-group mb-3">
      <label class="input-label">Your German Text</label>
      <textarea id="writing-input" class="modern-textarea" rows="6" 
                placeholder="Schreib hier auf Deutsch... (Write here in German...)"></textarea>
    </div>

    <button class="btn btn-purple btn-block btn-lg" id="correct-btn" onclick="checkGrammar()">
      <i class="fa-solid fa-robot"></i> Check with AI
    </button>

    <div id="correction-result" class="mt-3"></div>
  `;

  renderScreen(html);
}

window.newWritingPrompt = function() {
  const el = document.getElementById('writing-prompt');
  if (el) el.textContent = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
};

window.checkGrammar = async function() {
  const input = document.getElementById('writing-input');
  const text  = input?.value.trim();
  if (!text) { Toast.warning('Please write something first!'); return; }

  const btn = document.getElementById('correct-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...'; }

  const resultEl = document.getElementById('correction-result');
  if (resultEl) resultEl.innerHTML = `
    <div class="glass-card">
      <div class="skeleton" style="height:1rem;margin-bottom:.5rem"></div>
      <div class="skeleton" style="height:1rem;margin-bottom:.5rem;width:75%"></div>
      <div class="skeleton" style="height:4rem;margin-top:1rem"></div>
    </div>`;

  try {
    const result = await AI.correctGrammar(text);
    renderCorrectionResult(text, result);
    Gamification.awardXP(result.errors?.length === 0 ? 25 : 15);
    if (result.errors?.length === 0) Toast.success('🎉 Perfect German! +25 XP bonus!', 3500);
  } catch (err) {
    if (resultEl) resultEl.innerHTML = `<div class="error-card"><div class="error-card-label">Error</div><div class="error-card-explanation">${err.message}</div></div>`;
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-robot"></i> Check with AI'; }
  }
};

function renderCorrectionResult(original, result) {
  const resultEl = document.getElementById('correction-result');
  if (!resultEl) return;

  const errors   = result.errors || [];
  const score    = result.score ?? 100;
  const scoreColor = score >= 90 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';

  // Build diff view
  let correctedDisplay = result.corrected || original;
  errors.forEach(e => {
    if (e.original && e.corrected) {
      correctedDisplay = correctedDisplay.replace(
        e.corrected,
        `<span class="diff-correct">${e.corrected}</span>`
      );
    }
  });

  let originalDisplay = original;
  errors.forEach(e => {
    if (e.original) {
      originalDisplay = originalDisplay.replace(
        e.original,
        `<span class="diff-wrong">${e.original}</span>`
      );
    }
  });

  const errorsHtml = errors.length === 0
    ? `<div class="text-success fw-700 mt-2">✅ No errors found! Perfect German!</div>`
    : errors.map(e => `
        <div class="error-card mt-2">
          <div class="error-card-label">❌ ${e.type || 'Error'}</div>
          <div class="fw-700 mt-1">"${e.original}" → "<span class="text-success">${e.corrected}</span>"</div>
          <div class="error-card-explanation">${e.explanation}</div>
        </div>`).join('');

  resultEl.innerHTML = `
    <div class="glass-card">
      <!-- Score -->
      <div class="flex-between mb-3">
        <div class="fw-800" style="font-size:1.1rem">Grammar Score</div>
        <div class="fw-900" style="font-size:1.5rem;color:${scoreColor}">${score}%</div>
      </div>

      <!-- Two-panel diff -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:1rem">
        <div>
          <div class="text-xs text-muted mb-1" style="text-transform:uppercase;letter-spacing:.08em">Your Text</div>
          <div class="modern-input" style="min-height:80px;font-size:.88rem;line-height:1.6">${originalDisplay}</div>
        </div>
        <div>
          <div class="text-xs text-muted mb-1" style="text-transform:uppercase;letter-spacing:.08em">Corrected</div>
          <div class="modern-input" style="min-height:80px;font-size:.88rem;line-height:1.6;background:rgba(16,185,129,.05);border-color:rgba(16,185,129,.25)">${correctedDisplay}</div>
        </div>
      </div>

      <!-- Errors -->
      <div class="fw-700 mb-1">${errors.length === 0 ? '✨ Perfect!' : `📋 ${errors.length} Error${errors.length !== 1 ? 's' : ''} Found`}</div>
      ${errorsHtml}

      <!-- TTS of corrected text -->
      <div class="mt-3 flex-between">
        <button class="btn btn-secondary btn-sm" data-speak="${(result.corrected || original).replace(/"/g,'&quot;')}">
          <i class="fa-solid fa-volume-high"></i> Hear Correction
        </button>
        <button class="btn btn-purple btn-sm" onclick="document.getElementById('writing-input').value='';document.getElementById('correction-result').innerHTML=''">
          ✏️ Write Again
        </button>
      </div>
    </div>
  `;

  setTimeout(() => Speech.attachSpeakerButtons(resultEl), 100);
}
