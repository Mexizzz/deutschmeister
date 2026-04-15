/* scenarios.js — Roleplay Scenario Catalog */
'use strict';

const AI_SCENARIOS = [
  { id: 'casual', icon: '☕', name: 'Casual Coffee Chat', desc: 'A relaxed conversation with a friend.' },
  { id: 'immigration', icon: '🏢', name: 'Ausländerbehörde', desc: 'Navigate a stressful visa appointment.' },
  { id: 'doner', icon: '🥙', name: 'Döner Stand', desc: 'Order food like a local Berliner.' },
  { id: 'job_interview', icon: '💼', name: 'Job Interview', desc: 'Formal conversation at a startup.' },
  { id: 'train_station', icon: '🚆', name: 'Train Station DB', desc: 'Ask about delayed trains and tickets.' },
  { id: 'supermarket', icon: '🛒', name: 'Rewe Checkout', desc: 'Quick responses at a busy checkout line.' }
];

window.renderScenarios = function() {
  const html = `
    <button class="btn btn-secondary btn-sm mb-3" onclick="App.navigate('/ai')">← Back to AI Hub</button>
    <div class="section-label mb-1">🎭 Select a Scenario</div>
    <p class="text-secondary text-sm mb-4">Choose a roleplay mission. The AI will adopt the persona and test your skills.</p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
      ${AI_SCENARIOS.map(s => `
        <div class="glass-card" style="cursor: pointer; transition: all 0.2s ease" 
             onclick="startScenario('${s.name}')"
             onmouseover="this.style.borderColor='var(--accent-purple)'"
             onmouseout="this.style.borderColor='rgba(255,255,255,0.05)'">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">${s.icon}</div>
          <div class="fw-800 mb-1">${s.name}</div>
          <div class="text-xs text-muted">${s.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
  renderScreen(html);
};

window.startScenario = function(scenarioName) {
  Storage.set('current_ai_scenario', scenarioName);
  App.navigate('/ai/chat');
};
