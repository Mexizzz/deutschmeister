/* ai-stories.js — AI Story Generator */
'use strict';

const STORY_TOPICS = ['Daily Life','Adventure','Travel','Animals','Food & Cooking','Friends','Mystery','Sports','Nature','A Day in Berlin'];
let activeStory = null;
let wordTooltipEl = null;

function renderAIStories() {
  const saved = Storage.getSavedStories();

  const html = `
    <div class="section-label mb-1">📖 AI Story Reader</div>
    <p class="text-secondary text-sm mb-3">Generate personalized German stories at your level. Tap any word for its translation!</p>

    <div class="glass-card mb-3">
      <div class="section-label mb-2">Generate New Story</div>
      <div class="input-group mb-2">
        <label class="input-label">Topic</label>
        <select class="modern-select" id="story-topic">
          ${STORY_TOPICS.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-purple btn-block" id="gen-story-btn" onclick="generateStory()">
        <i class="fa-solid fa-robot"></i> Generate Story
      </button>
    </div>

    <div id="story-container"></div>

    ${saved.length > 0 ? `
      <div class="mt-3">
        <div class="section-label mb-2">📚 Saved Stories (${saved.length})</div>
        ${saved.slice(0,3).map(s => `
          <div class="glass-card mb-2" style="cursor:pointer" onclick="displayStory(${JSON.stringify(s).replace(/"/g,'&quot;')})">
            <div class="fw-700">${s.title}</div>
            <div class="text-xs text-muted mt-1">Saved ${new Date(s.savedAt).toLocaleDateString()}</div>
          </div>`).join('')}
      </div>` : ''}
  `;

  renderScreen(html);
  // Setup tooltip element
  wordTooltipEl = document.createElement('div');
  wordTooltipEl.className = 'word-tooltip';
  wordTooltipEl.style.opacity = '0';
  document.body.appendChild(wordTooltipEl);
}

window.generateStory = async function() {
  const topicEl = document.getElementById('story-topic');
  const topic   = topicEl?.value || 'Daily Life';
  const btn     = document.getElementById('gen-story-btn');

  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...'; }

  const container = document.getElementById('story-container');
  if (container) container.innerHTML = `
    <div class="glass-card">
      ${['80%','60%','90%','50%','70%'].map(w => `<div class="skeleton mt-2" style="height:.9rem;width:${w}"></div>`).join('')}
    </div>`;

  try {
    const story = await AI.generateStory(topic);
    activeStory = { ...story, savedAt: Date.now() };
    displayStory(activeStory);
    Gamification.awardXP(30);
    Gamification.logMistake('story_read');
    Storage.saveStory(activeStory);
    Toast.success('📖 Story generated! +30 XP', 3000);
  } catch (err) {
    if (container) container.innerHTML = `<div class="error-card"><div class="error-card-label">Error</div><div class="error-card-explanation">${err.message}</div></div>`;
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-robot"></i> Generate Story'; }
  }
};

function displayStory(story) {
  const container = document.getElementById('story-container') || document.getElementById('app-root');

  // Make each word tappable
  const clickableStory = (story.story || '').replace(/(\S+)/g, (word) => {
    const clean = word.replace(/[.,!?;:"""''()]/g, '');
    return `<span class="story-word" data-word="${clean}" onclick="showWordTranslation(event,'${clean.replace(/'/g,"\\'")}')">${word}</span> `;
  });

  const vocabHtml = (story.vocabulary || []).map(v => `
    <div class="vocab-item">
      <div>
        <span class="vocab-de">${v.de}</span>
        <span class="vocab-gender ${v.gender||''}">${v.gender ? {m:'m',f:'f',n:'n'}[v.gender]||'' : ''}</span>
      </div>
      <span class="vocab-en">${v.en}</span>
    </div>`).join('');

  const questionsHtml = (story.questions || []).map((q, qi) => `
    <div class="glass-card mb-2">
      <div class="fw-700 mb-2">${qi+1}. ${q.question}</div>
      <div style="display:flex;flex-direction:column;gap:.5rem">
        ${(q.options || []).map((opt, oi) => `
          <button class="mcq-option" id="sq-${qi}-${oi}" 
                  onclick="checkStoryQuestion(${qi},${oi},${q.answer})">
            ${opt}
          </button>`).join('')}
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="glass-card mb-3">
      <div class="flex-between mb-2">
        <div class="fw-800" style="font-size:1.2rem">${story.title}</div>
        <button class="btn btn-secondary btn-sm" data-speak="${(story.story||'').replace(/"/g,'&quot;').slice(0,200)}" title="Read aloud">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>
      <div class="story-text">${clickableStory}</div>
    </div>

    ${(story.vocabulary||[]).length > 0 ? `
      <div class="glass-card mb-3">
        <div class="section-label mb-2">📚 Vocabulary</div>
        <div class="vocab-list">${vocabHtml}</div>
      </div>` : ''}

    ${(story.questions||[]).length > 0 ? `
      <div>
        <div class="section-label mb-2">❓ Comprehension Quiz</div>
        ${questionsHtml}
        <button class="btn btn-primary btn-block mt-2" onclick="checkAllStoryQuestions()">
          Submit Answers
        </button>
      </div>` : ''}
  `;

  setTimeout(() => Speech.attachSpeakerButtons(container), 100);
}

window.showWordTranslation = function(event, word) {
  if (!wordTooltipEl) return;
  // Try to find in vocabulary
  const match = VOCABULARY.find(v => {
    const clean = v.de.toLowerCase().replace(/^(der|die|das) /,'');
    return clean === word.toLowerCase() || v.de.toLowerCase() === word.toLowerCase();
  });

  wordTooltipEl.textContent = match ? `${match.de} → ${match.en}` : `"${word}" (tap AI Tutor to look up)`;
  wordTooltipEl.style.opacity = '1';
  wordTooltipEl.style.left = `${Math.min(event.pageX, window.innerWidth - 200)}px`;
  wordTooltipEl.style.top  = `${event.pageY - 45}px`;
  setTimeout(() => { wordTooltipEl.style.opacity = '0'; }, 2500);
};

window.checkStoryQuestion = function(qi, selectedOi, correctOi) {
  const isCorrect = selectedOi === correctOi;
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`sq-${qi}-${i}`);
    if (!btn) continue;
    btn.disabled = true;
    if (i === correctOi) btn.classList.add('correct');
    else if (i === selectedOi && !isCorrect) btn.classList.add('wrong');
  }
  if (isCorrect) Gamification.awardXP(15);
};

window.checkAllStoryQuestions = function() {
  Toast.info('Check each question above! 👆', 2000);
};
