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
    container.innerHTML = `<div class="text-center text-muted mt-3">No words found.</div>`;
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
