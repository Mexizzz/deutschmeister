/* dashboard.js — Home screen with Word of the Day + Smart Review */
'use strict';

// ── Word of the Day (deterministic: changes daily, same word all day) ─────────
function getWordOfTheDay() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return VOCABULARY[dayIndex % VOCABULARY.length];
}

function renderDashboard() {
  const p = Gamification.regenHearts();
  Gamification.updateStreak();

  const xpPct     = Gamification.xpProgress();
  const nextLvl   = p.appLevel + 1;
  const dueCount  = SRS.getDueCount();
  const wotd      = getWordOfTheDay();
  
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // ── Activity Dots Logic ───────────────────────────────────────────────────
  const days = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
  const todayIdx = (today.getDay() + 6) % 7; // Adjust to match our days array starting Wed
  const activityHtml = days.map((day, i) => {
    const isActive = i <= todayIdx; // Simplified for demo
    return `<div class="activity-dot ${isActive ? 'active' : ''} ${i === todayIdx ? 'today' : ''}">${day[0]}</div>`;
  }).join('');

  const html = `
    <div style="max-width: 900px; margin: 0 auto; width: 100%;">
      <!-- Top Hub Banner -->
      <div class="dashboard-banner mb-4 animate-fade-in stagger-1">
        <div class="banner-content">
          <div class="banner-meta text-xs fw-800 mb-1" style="opacity:0.7">${dateStr.toUpperCase()}</div>
          <h1>Welcome back, ${p.name || 'Mexiz'} 👋</h1>
          <div class="banner-stats">
            <div class="banner-stat-item">
              <span class="banner-stat-value">${p.streak}</span>
              <span class="banner-stat-label">day streak</span>
            </div>
            <div style="width:1px; background:rgba(255,255,255,0.2)"></div>
            <div class="banner-stat-item">
              <span class="banner-stat-value">${p.xp.toLocaleString()}</span>
              <span class="banner-stat-label">level XP</span>
            </div>
          </div>
          <!-- Enhanced XP Progress Bar -->
          <div class="mt-3" style="width: 100%; max-width: 300px; margin: 0 auto;">
            <div class="flex-between text-xs fw-800 mb-1" style="opacity:0.8">
              <span>Level ${p.appLevel}</span>
              <span>${p.xp} / ${Gamification.xpForLevel(p.appLevel+1)} XP</span>
            </div>
            <div class="xp-bar-wrap" style="height: 8px; background: rgba(255,255,255,0.1)">
              <div class="xp-bar-fill" style="width: ${xpPct}%; background: var(--grad-gold); border-radius: 4px;"></div>
            </div>
          </div>
        </div>
        <div class="banner-mascot" style="font-size: 5.5rem;">🚀</div>
      </div>

      <div class="dashboard-stack" style="display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Review Ribbon -->
        <div class="glass-card-smooth animate-fade-in stagger-2" style="background:rgba(245,158,11,0.05); border-color:rgba(245,158,11,0.2); cursor:pointer" onclick="App.navigate('/review')">
          <div class="flex-between">
            <div class="flex-center gap-2">
              <span style="font-size:1.2rem">📚</span>
              <div>
                <div class="fw-800" style="color:var(--accent-gold)">${dueCount} flashcards due for review</div>
                <div class="text-xs text-muted">Keep your spaced repetition streak going</div>
              </div>
            </div>
            <i class="fa-solid fa-chevron-right text-muted"></i>
          </div>
        </div>

        <!-- Streak Card -->
        <div class="glass-card-smooth animate-fade-in stagger-3">
          <div class="dashboard-section-title mb-2">Study Streak</div>
          <div class="flex-center gap-2 mb-1">
            <span style="font-size:1.5rem">🔥</span>
            <span style="font-size:1.8rem; font-weight:900; color:var(--accent-gold)">${p.streak}</span>
            <span class="text-xs text-muted fw-700">days</span>
          </div>
          <div class="activity-dots">
            ${activityHtml}
          </div>
          <div class="text-xs text-center text-muted mt-3">Study today to keep your streak!</div>
        </div>

        <!-- Word of the Day -->
        <div class="glass-card-smooth animate-fade-in stagger-4">
          <div class="dashboard-section-title mb-2">Word of the Day</div>
          <div class="text-center py-1">
            <div class="gender-tag ${wotd.gender || 'n'}">${wotd.gender || 'das'}</div>
            <div class="fw-900 mt-1" style="font-size:1.5rem">${wotd.de}</div>
            <div class="text-muted text-sm">${wotd.en}</div>
            <button class="btn btn-secondary btn-sm mt-3" data-speak="${wotd.de}">
              <i class="fa-solid fa-volume-high"></i> Listen
            </button>
          </div>
        </div>

        <!-- AI Homework -->
        <div class="glass-card-smooth animate-fade-in stagger-5" style="border-left: 4px solid var(--accent-purple)">
          <div class="flex-between mb-3">
            <div class="dashboard-section-title">AI Homework</div>
            <span class="text-xs text-purple fw-800">+100 XP</span>
          </div>
          <div class="flex gap-3">
            <div style="font-size:1.5rem">🧠</div>
            <div>
              <div class="fw-700 text-sm">Personalized Session</div>
              <div class="text-xs text-muted">A1 Story + Grammar Practice</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-block btn-sm mt-4" onclick="App.navigate('/homework')">Start Lesson</button>
        </div>

        <!-- Community Activity Feed -->
        <div class="glass-card-smooth mb-4 animate-fade-in stagger-6">
          <div class="flex-between mb-3">
            <div class="dashboard-section-title">🌍 Live Community</div>
            <span class="flex-center" style="position:relative"><span style="width:8px;height:8px;background:var(--success);border-radius:50%;display:inline-block;margin-right:6px;animation:pulse 2s infinite"></span> Online</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="flex-center gap-2">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--grad-purple);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700">M</div>
              <div class="text-sm"><strong style="color:var(--text)">Max_Berlin</strong> reached a <span class="text-gold fw-700">14-day streak 🔥</span>!</div>
            </div>
            <div style="height:1px;background:rgba(255,255,255,0.05)"></div>
            <div class="flex-center gap-2">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--grad-blue);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700">A</div>
              <div class="text-sm"><strong style="color:var(--text)">Anna_T</strong> unlocked <span class="text-purple fw-700">Level 5 ⭐</span>!</div>
            </div>
            <div style="height:1px;background:rgba(255,255,255,0.05)"></div>
            <div class="flex-center gap-2">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--grad-gold);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700">J</div>
              <div class="text-sm"><strong style="color:var(--text)">Jan</strong> achieved <span class="fw-700">Perfectionist 💯</span> badge!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  renderScreen(html);
  Gamification.updateHeaderStats();
  
  // Update Sidebar Level Progress
  const sideProgress = document.getElementById('sidebar-user');
  if (sideProgress) {
    const existingProgress = document.querySelector('.sidebar-progress-box');
    if (!existingProgress) {
      const progBox = document.createElement('div');
      progBox.className = 'sidebar-progress-box';
      progBox.innerHTML = `
        <div class="sidebar-progress-label">
          <span>Level ${p.appLevel}</span>
          <span>Next: ${nextLvl}</span>
        </div>
        <div class="sidebar-progress-bar">
          <div class="sidebar-progress-fill" style="width:${xpPct}%"></div>
        </div>
      `;
      sideProgress.parentNode.insertBefore(progBox, sideProgress);
    } else {
      existingProgress.querySelector('.sidebar-progress-fill').style.width = `${xpPct}%`;
    }
  }

  // Update Mini Theme Picker active state
  document.querySelectorAll('.theme-swatch-mini').forEach(sw => {
    sw.classList.toggle('active', sw.dataset.theme === p.theme);
    sw.onclick = (e) => {
      e.stopPropagation();
      setTheme(sw.dataset.theme);
    };
  });

  setTimeout(() => Speech.attachSpeakerButtons(), 150);
}

// Word of the Day determiner
function getWordOfTheDay() {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return VOCABULARY[dayIndex % VOCABULARY.length];
}

// Dashboard bookmark toggle (without re-render)
window.toggleDashBookmark = function(wordId, btn) {
  const bookmarks = Storage.get('bookmarks', []);
  const idx = bookmarks.indexOf(wordId);
  if (idx === -1) {
    bookmarks.push(wordId);
    btn.innerHTML = '⭐';
    btn.classList.remove('btn-secondary');
    btn.classList.add('btn-primary');
    Toast.success('Word of the Day saved! ⭐', 1800);
  } else {
    bookmarks.splice(idx, 1);
    btn.innerHTML = '☆';
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
    Toast.info('Removed from bookmarks', 1500);
  }
  Storage.set('bookmarks', bookmarks);
};
