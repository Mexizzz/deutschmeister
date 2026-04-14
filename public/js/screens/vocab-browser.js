/* vocab-browser.js — Full vocabulary browser with search + bookmarks */
'use strict';

let _vocabFilter = { search: '', category: 'all', bookmarked: false };

function renderVocabBrowser() {
  const cats = ['all', ...new Set(VOCABULARY.map(w => w.category))];

  const html = `
    <div class="flex-between mb-2">
      <div class="section-label mb-0">📖 Vocabulary</div>
      <div class="text-xs text-muted">${VOCABULARY.length} words</div>
    </div>

    <!-- Search bar -->
    <div style="position:relative;margin-bottom:.75rem">
      <input id="vocab-search" class="modern-input" placeholder="Search German or English..." 
             style="padding-left:2.4rem"
             oninput="filterVocab()" value="${_vocabFilter.search}">
      <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:.85rem;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:.9rem"></i>
    </div>

    <!-- Category pills -->
    <div class="chips-row mb-2" id="cat-pills">
      ${cats.map(c => `
        <div class="chip ${_vocabFilter.category===c?'active-chip':''}" onclick="setVocabCat('${c}')">
          ${c === 'all' ? '🌐 All' : c}
        </div>`).join('')}
      <div class="chip ${_vocabFilter.bookmarked?'active-chip':''}" onclick="toggleBookmarkFilter()">
        ⭐ Saved
      </div>
    </div>

    <!-- Word list -->
    <div id="vocab-list"></div>
  `;

  renderScreen(html);
  renderVocabList();
  setTimeout(() => Speech.attachSpeakerButtons(), 200);
}

function renderVocabList() {
  const { search, category, bookmarked } = _vocabFilter;
  const bookmarks = Storage.get('bookmarks', []);
  const norm = s => s.toLowerCase();

  let words = VOCABULARY.filter(w => {
    if (bookmarked && !bookmarks.includes(w.id)) return false;
    if (category !== 'all' && w.category !== category) return false;
    if (search) {
      return norm(w.de).includes(norm(search)) ||
             norm(w.en).includes(norm(search));
    }
    return true;
  });

  const container = document.getElementById('vocab-list');
  if (!container) return;

  if (!words.length) {
    if (search) {
      container.innerHTML = `
        <div class="text-center mt-4 pt-2">
          <div style="font-size:3rem;margin-bottom:1rem">🤖</div>
          <div class="fw-700 mb-1">"${search}" not in local list</div>
          <p class="text-secondary text-sm mb-3">Want to define this word with AI?</p>
          <button class="btn btn-primary" onclick="searchWithAI('${search.replace(/'/g, "\\'")}')" id="ai-search-btn">
            <i class="fa-solid fa-wand-magic-sparkles mr-2"></i> Define with AI
          </button>
        </div>`;
    } else {
      container.innerHTML = `<div class="text-center text-muted mt-3">No words found.</div>`;
    }
    return;
  }

  // Group by category
  const groups = {};
  words.forEach(w => {
    if (!groups[w.category]) groups[w.category] = [];
    groups[w.category].push(w);
  });

  container.innerHTML = Object.entries(groups).map(([cat, catWords]) => `
    <div class="section-label mt-2 mb-1">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
    ${catWords.map(w => {
      const isBookmarked = bookmarks.includes(w.id);
      const srsCards = Storage.getSRSCards();
      const card = srsCards[w.id];
      const mastered = card && card.interval >= 21;
      const genderLabel = w.gender ? `<span class="vocab-gender ${w.gender}">${{m:'der',f:'die',n:'das'}[w.gender]}</span>` : '';

      return `
        <div class="vocab-item" style="flex-direction:column;align-items:stretch;gap:.25rem;padding:.85rem">
          <div class="flex-between">
            <div style="display:flex;align-items:center;gap:.5rem">
              ${genderLabel}
              <span class="vocab-de fw-700">${w.de}</span>
              ${mastered ? '<span class="text-xs text-success fw-700">✅ Mastered</span>' : ''}
            </div>
            <div style="display:flex;gap:.4rem">
              <button class="btn btn-icon btn-secondary btn-sm" data-speak="${w.de}" style="padding:.3rem .5rem">
                <i class="fa-solid fa-volume-high"></i>
              </button>
              <button class="btn btn-icon btn-sm ${isBookmarked ? 'btn-primary' : 'btn-secondary'}" 
                      style="padding:.3rem .5rem" onclick="toggleBookmark('${w.id}', this)">
                ${isBookmarked ? '⭐' : '☆'}
              </button>
            </div>
          </div>
          <div class="vocab-en text-secondary">${w.en}</div>
          <div class="text-xs text-muted" style="font-style:italic">"${w.example_de}" — ${w.example_en}</div>
        </div>`;
    }).join('')}
  `).join('');

  setTimeout(() => Speech.attachSpeakerButtons(), 100);
}

window.filterVocab = function() {
  const input = document.getElementById('vocab-search');
  _vocabFilter.search = input ? input.value : '';
  renderVocabList();
};

window.setVocabCat = function(cat) {
  _vocabFilter.category = cat;
  // Re-render to update active chips
  renderVocabBrowser();
};

window.toggleBookmarkFilter = function() {
  _vocabFilter.bookmarked = !_vocabFilter.bookmarked;
  renderVocabBrowser();
};

window.toggleBookmark = function(wordId, btn) {
  const bookmarks = Storage.get('bookmarks', []);
  const idx = bookmarks.indexOf(wordId);
  if (idx === -1) {
    bookmarks.push(wordId);
    btn.innerHTML = '⭐';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
    Toast.success('Word saved to bookmarks!', 1500);
  } else {
    bookmarks.splice(idx, 1);
    btn.innerHTML = '☆';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    Toast.info('Removed from bookmarks', 1500);
  }
  Storage.set('bookmarks', bookmarks);
};

window.searchWithAI = async function(word) {
  const btn = document.getElementById('ai-search-btn');
  if (!btn) return;
  
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Thinking...';

  try {
    const result = await AI.defineWord(word);
    if (!result || !result.de) throw new Error('Could not define word');

    // Render the AI result
    const container = document.getElementById('vocab-list');
    const bookmarks = Storage.get('bookmarks', []);
    const isBookmarked = bookmarks.includes(result.id);
    
    container.innerHTML = `
      <div class="section-label mt-2 mb-1">🤖 AI Result</div>
      <div class="vocab-item animate-in" style="flex-direction:column;align-items:stretch;gap:.25rem;padding:.85rem;border:1px solid var(--accent-blue)">
        <div class="flex-between">
          <div style="display:flex;align-items:center;gap:.5rem">
            ${result.gender ? `<span class="vocab-gender ${result.gender}">${{m:'der',f:'die',n:'das'}[result.gender]}</span>` : ''}
            <span class="vocab-de fw-700">${result.de}</span>
            <span class="text-xs text-accent-blue fw-700 ml-1">AI Gen</span>
          </div>
          <div style="display:flex;gap:.4rem">
            <button class="btn btn-icon btn-secondary btn-sm" data-speak="${result.de}" style="padding:.3rem .5rem">
              <i class="fa-solid fa-volume-high"></i>
            </button>
            <button class="btn btn-icon btn-sm ${isBookmarked ? 'btn-primary' : 'btn-secondary'}" 
                    style="padding:.3rem .5rem" onclick="toggleAIWordBookmark(\`${JSON.stringify(result).replace(/`/g, '\\`')}\`, this)">
              ${isBookmarked ? '⭐' : '☆'}
            </button>
          </div>
        </div>
        <div class="vocab-en text-secondary">${result.en}</div>
        <div class="text-xs text-muted" style="font-style:italic">"${result.example_de}" — ${result.example_en}</div>
        <div class="text-xs mt-2 text-muted">Category: ${result.category} · Level: ${result.level}</div>
      </div>
      <div class="text-center mt-3">
        <button class="btn btn-secondary btn-sm" onclick="renderVocabBrowser()">Clear Search</button>
      </div>
    `;
    Speech.attachSpeakerButtons();
  } catch (err) {
    Toast.error('AI could not define this word. Try another?');
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
};

window.toggleAIWordBookmark = function(wordJson, btn) {
  const word = JSON.parse(wordJson);
  const bookmarks = Storage.get('bookmarks', []);
  const idx = bookmarks.indexOf(word.id);
  
  if (idx === -1) {
    // If it's an AI word, we might want to save it permanently in a local "custom vocab" list 
    // but for now, we'll just handle it as a bookmark. 
    // Actually, let's just use the existing bookmark logic but note that the word isn't in VOCABULARY.
    // To make it persistent across reloads, we should probably add it to VOCABULARY array globally in this session.
    if (!VOCABULARY.find(w => w.id === word.id)) {
      VOCABULARY.push(word);
    }
    toggleBookmark(word.id, btn);
  } else {
    toggleBookmark(word.id, btn);
  }
};
