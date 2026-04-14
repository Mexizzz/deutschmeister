/* settings.js — Settings Screen */
'use strict';

function renderSettings() {
  const p = Storage.getProfile();
  const metaRaw = localStorage.getItem('dm_user_meta');
  const userMeta = metaRaw ? JSON.parse(metaRaw) : null;

  const html = `
    <div class="flex-between mb-2">
      <div class="section-label mb-0">⚙️ Settings</div>
    </div>

    <!-- Account Details -->
    <div class="glass-card mb-3 text-center">
      <div style="font-size:3rem;margin-bottom:.5rem">👤</div>
      <div class="fw-900" style="font-size:1.4rem">${userMeta ? userMeta.username : p.name}</div>
      <div class="text-secondary text-sm">${userMeta ? userMeta.email : 'Local Guest'}</div>
      
      <button class="btn btn-secondary btn-block mt-3" onclick="logout()" style="color:var(--danger)">
        <i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out
      </button>
    </div>

    <!-- Learning Settings -->
    <div class="settings-group">
      <div class="section-label mb-2">📚 Learning</div>

      <div class="settings-item">
        <div class="settings-item-info">
          <h4>Daily XP Goal</h4>
          <p>How much XP to earn per day</p>
        </div>
        <select class="modern-select" style="width:auto" id="daily-goal-select" 
                onchange="updateSetting('dailyGoal', +this.value)">
          ${[10,20,30,50].map(v => `<option value="${v}" ${p.dailyGoal===v?'selected':''}>${v} XP</option>`).join('')}
        </select>
      </div>

      <div class="settings-item">
        <div class="settings-item-info">
          <h4>German Level</h4>
          <p>Your CEFR proficiency level</p>
        </div>
        <select class="modern-select" style="width:auto" id="level-select"
                onchange="updateSetting('level', this.value)">
          ${['A1','A2','B1'].map(l => `<option value="${l}" ${p.level===l?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>

      <div class="settings-item">
        <div class="settings-item-info">
          <h4>AI Response Style</h4>
          <p>How the AI includes English</p>
        </div>
        <select class="modern-select" style="width:auto" id="ai-lang-select"
                onchange="updateSetting('aiResponseLang', this.value)">
          <option value="german"  ${p.aiResponseLang==='german' ?'selected':''}>German Only</option>
          <option value="hints"   ${p.aiResponseLang==='hints'  ?'selected':''}>German + Hints</option>
          <option value="english" ${p.aiResponseLang==='english'?'selected':''}>Full English</option>
        </select>
      </div>
    </div>

    <!-- Audio Settings -->
    <div class="settings-group">
      <div class="section-label mb-2">🔊 Audio</div>

      <div class="settings-item">
        <div class="settings-item-info">
          <h4>Sound Effects</h4>
          <p>Audio feedback on answers</p>
        </div>
        <label class="toggle">
          <input type="checkbox" id="sound-toggle" ${p.soundEnabled ? 'checked' : ''}
                 onchange="updateSetting('soundEnabled', this.checked)">
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-item">
        <div class="settings-item-info">
          <h4>Speech Speed</h4>
          <p>Speed of German TTS voice. "Slow" is best for learning.</p>
        </div>
        <select class="modern-select" style="width:auto" id="speech-speed-select"
                onchange="updateSetting('speechSpeed', +this.value)">
          <option value="0.6"  ${p.speechSpeed===0.6  ?'selected':''}>🐢 Very Slow</option>
          <option value="0.72" ${(p.speechSpeed===0.72||!p.speechSpeed)?'selected':''}>🎓 Slow (Recommended)</option>
          <option value="0.9"  ${p.speechSpeed===0.9  ?'selected':''}>🚶 Medium</option>
          <option value="1.1"  ${p.speechSpeed===1.1  ?'selected':''}>🏃 Fast</option>
        </select>
      </div>

      <div class="glass-card mb-2" style="background:rgba(139,92,246,.07);border-color:rgba(139,92,246,.25)">
        <div class="text-xs text-muted mb-1">💡 Pro Tip</div>
        <div class="text-sm">
          <strong>Single click</strong> 🔊 on any speaker button to hear the full phrase.<br>
          <strong>Double click</strong> 🔊🔊 for <span class="text-gold fw-700">word-by-word</span> slow playback — perfect for pronunciation practice!
        </div>
        <div class="text-xs text-muted mt-2" id="voice-name-display"></div>
      </div>
    </div>

    <!-- About -->
    <div class="settings-group">
      <div class="section-label mb-2">ℹ️ About</div>
      <div class="glass-card mb-2">
        <div class="flex-between">
          <span class="text-muted">App</span><span class="fw-700">🇩🇪 DeutschMeister</span>
        </div>
        <div class="flex-between mt-1">
          <span class="text-muted">Version</span><span>1.0.0</span>
        </div>
        <div class="flex-between mt-1">
          <span class="text-muted">AI Provider</span><span class="text-purple fw-700">Groq (llama-3.3-70b)</span>
        </div>
        <div class="flex-between mt-1">
          <span class="text-muted">Words Available</span><span>${VOCABULARY.length}</span>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="settings-group">
      <div class="section-label mb-2" style="color:var(--danger)">⚠️ Danger Zone</div>
      <button class="btn btn-secondary btn-block mb-2" onclick="exportProgress()">
        <i class="fa-solid fa-download"></i> Export Progress
      </button>
      <button class="btn btn-danger btn-block" onclick="confirmReset()">
        <i class="fa-solid fa-trash"></i> Reset All Progress
      </button>
    </div>

    <!-- AI Connection Test -->
    <div class="glass-card mt-3">
      <div class="fw-700 mb-2">🤖 AI Connection</div>
      <p class="text-secondary text-sm mb-2">Test the connection to the Groq AI backend.</p>
      <button class="btn btn-secondary btn-block" id="test-ai-btn" onclick="testAIConnection()">
        Test Connection
      </button>
      <div id="ai-test-result" class="mt-2"></div>
    </div>
  `;

  renderScreen(html);
}

window.updateSetting = function(key, value) {
  Storage.updateProfile({ [key]: value });
  Toast.success('Setting saved ✓', 1500);
};

window.confirmReset = function() {
  Modal.confirm(
    '⚠️ Reset All Progress',
    'This will delete ALL your XP, streaks, lesson progress, and vocabulary. This cannot be undone.',
    () => {
      Storage.clear();
      Toast.success('Progress reset. Starting fresh!', 3000);
      setTimeout(() => App.navigate('/'), 500);
    }
  );
};

window.testAIConnection = async function() {
  const btn = document.getElementById('test-ai-btn');
  const result = document.getElementById('ai-test-result');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing...'; }

  try {
    const health = await AI.healthCheck();
    if (health.hasKey) {
      if (result) result.innerHTML = '<div class="text-success fw-700">✅ Connected to Groq AI! Ready to learn.</div>';
    } else {
      if (result) result.innerHTML = '<div class="text-danger fw-700">❌ GROQ_API_KEY not set on server. Add it to Railway env vars.</div>';
    }
  } catch (err) {
    if (result) result.innerHTML = `<div class="text-danger fw-700">❌ Cannot reach server: ${err.message}</div>`;
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = 'Test Connection'; }
  }
};
