/* achievements.js — Display unlocked and locked achievements */
'use strict';

window.renderAchievements = function() {
  const achievements = Gamification.getAllAchievements();
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPct = Math.round((unlockedCount / achievements.length) * 100);

  const html = `
    <button class="btn btn-secondary btn-sm mb-3" onclick="App.navigate('/progress')">← Back to Progress</button>
    <div class="section-label mb-1">🏆 Achievements</div>
    <p class="text-secondary text-sm mb-4">Complete challenges to earn badges and show off your German mastery.</p>

    <!-- Progress Overview -->
    <div class="glass-card mb-4 text-center">
      <div class="fw-800 text-gold mb-1" style="font-size:1.8rem">${unlockedCount} / ${achievements.length}</div>
      <div class="text-sm text-secondary mb-3">Achievements Unlocked</div>
      <div class="xp-bar-wrap" style="height: 12px; max-width: 300px; margin: 0 auto; background: rgba(255,255,255,0.05)">
        <div class="xp-bar-fill" style="width: ${progressPct}%; background: var(--grad-gold)"></div>
      </div>
    </div>

    <!-- Achievement Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;">
      ${achievements.map(a => `
        <div class="glass-card text-center" style="padding: 1.5rem 1rem; opacity: ${a.unlocked ? '1' : '0.5'}; filter: ${a.unlocked ? 'none' : 'grayscale(100%)'}; border-color: ${a.unlocked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)'}">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem; text-shadow: ${a.unlocked ? '0 0 15px rgba(245,158,11,0.5)' : 'none'}; animation: ${a.unlocked ? 'floatBlob 6s infinite alternate' : 'none'}">${a.icon}</div>
          <div class="fw-800 text-sm mb-1">${a.unlocked ? a.name : '???'}</div>
          <div class="text-xs text-muted" style="line-height: 1.3">${a.unlocked ? a.desc : 'Keep learning to unlock'}</div>
        </div>
      `).join('')}
    </div>
  `;

  renderScreen(html);
};
