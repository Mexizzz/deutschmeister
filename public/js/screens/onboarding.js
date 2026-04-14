/* onboarding.js — First-launch goal selection */
'use strict';

function renderOnboarding() {
  const html = `
    <div style="min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1rem">

      <!-- Logo -->
      <div style="font-size:3.5rem;margin-bottom:.5rem">🇩🇪</div>
      <div class="fw-900 gradient-text-gold" style="font-size:2rem;letter-spacing:-.04em">FluentGermanAI</div>
      <div class="text-secondary text-sm mt-1 mb-3">Your personal AI-powered German tutor</div>

      <!-- Goal Picker -->
      <div class="glass-card w-full mb-3" style="max-width:420px;text-align:left">
        <div class="fw-700 mb-1" style="font-size:1.05rem">🎯 What's your goal?</div>
        <div class="text-secondary text-sm mb-3">Choose the level you want to reach. You'll follow a structured path with a certification test at the end.</div>

        <div style="display:flex;flex-direction:column;gap:.65rem" id="goal-options">
          ${[
            { level:'A1', emoji:'🌱', title:'A1 — Beginner',        desc:'Basic greetings, numbers, colors, family, food, animals. Perfect for absolute beginners.', lessons:6  },
            { level:'A2', emoji:'📗', title:'A2 — Elementary',      desc:'Body parts, clothing, home, travel, time, verbs. Build real conversation skills.',            lessons:12 },
            { level:'B1', emoji:'🚀', title:'B1 — Intermediate',    desc:'All A1+A2 content plus advanced topics. Chat fluently on everyday subjects.',                 lessons:15 },
          ].map(g => `
            <label class="goal-option" id="goal-${g.level}" onclick="selectGoal('${g.level}')">
              <div style="display:flex;align-items:center;gap:.75rem">
                <div style="font-size:1.8rem">${g.emoji}</div>
                <div style="flex:1">
                  <div class="fw-700">${g.title}</div>
                  <div class="text-xs text-secondary mt-1">${g.desc}</div>
                  <div class="text-xs text-muted mt-1">📚 ${g.lessons} lessons + certification test</div>
                </div>
                <div class="goal-check" id="check-${g.level}" style="display:none">✅</div>
              </div>
            </label>`).join('')}
        </div>
      </div>

      <!-- Name input -->
      <div class="glass-card w-full mb-3" style="max-width:420px;text-align:left">
        <div class="fw-700 mb-2">👤 What's your name?</div>
        <input class="modern-input" id="user-name-input" placeholder="e.g. Mohammed, Lisa, Thomas..." maxlength="30" value="">
      </div>

      <!-- Start button -->
      <button class="btn btn-primary btn-lg btn-block" style="max-width:420px" id="start-btn" onclick="finishOnboarding()" disabled>
        Start Learning 🚀
      </button>
      <div class="text-xs text-muted mt-2">Free forever. No ads. Powered by Groq AI.</div>
    </div>
  `;

  renderScreen(html);
}

let _selectedGoal = null;

window.selectGoal = function(level) {
  _selectedGoal = level;
  // Highlight selected
  document.querySelectorAll('.goal-option').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.goal-check').forEach(el => el.style.display = 'none');
  const el = document.getElementById(`goal-${level}`);
  if (el) el.classList.add('active');
  const check = document.getElementById(`check-${level}`);
  if (check) check.style.display = 'block';

  // Enable start button
  const btn = document.getElementById('start-btn');
  if (btn) btn.disabled = false;
};

window.finishOnboarding = function() {
  if (!_selectedGoal) { Toast.warning('Please choose a goal level first!'); return; }
  const nameInput = document.getElementById('user-name-input');
  const name = (nameInput ? nameInput.value.trim() : '') || 'Learner';

  Storage.updateProfile({
    goalLevel: _selectedGoal,
    level: _selectedGoal,
    name,
    onboardingDone: true,
  });

  Toast.success(`Willkommen, ${name}! Your ${_selectedGoal} journey begins! 🎉`, 3000);
  setTimeout(() => App.navigate('/'), 400);
};
