/* homework.js — AI Daily Comprehensive Input + Roleplay */
'use strict';

let homeworkState = null;

async function renderHomework() {
  const p = Storage.getProfile();
  const today = new Date().toDateString();

  if (p.homeworkDate === today && p.homeworkCompleted) {
    renderScreen(`
      <div class="results-screen">
        <div class="results-emoji">🎓</div>
        <div class="results-title gradient-text-gold">Homework Complete!</div>
        <div class="text-secondary mt-2">You've finished your daily AI assignment. Be sure to check your vocabulary review.</div>
        <button class="btn btn-primary btn-block btn-lg mt-4" onclick="App.navigate('/dashboard')">Back to Dashboard</button>
      </div>`);
    return;
  }

  // State 1: Loading
  renderScreen(`
    <div class="loading-screen" style="min-height:75vh">
      <div class="loading-spinner"></div>
      <div class="text-center mt-3">
        <div class="fw-700" style="font-size:1.1rem;color:var(--accent-gold)">Generating Homework...</div>
        <div class="text-sm text-secondary mt-1 max-w-sm">Writing a personalized story using words you've learned.</div>
      </div>
    </div>
  `);

  try {
    // Collect specific mastered vocabulary from SRS
    const srs = Storage.getSRSCards();
    const masteredIds = Object.entries(srs).filter(([_, c]) => c.interval >= 7).map(e => e[0]);
    
    // Map IDs to actual German words
    const knownWords = VOCABULARY.filter(w => masteredIds.includes(w.id)).map(w => w.de);
    
    const resp = await fetch('/api/homework/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${Storage.getAuthToken()}` },
      body: JSON.stringify({ words: knownWords })
    });
    
    const json = await resp.json();
    if (!json.success) throw new Error(json.error);
    
    homeworkState = {
      data: json.homework,
      currentQ: 0,
      mistakes: 0
    };
    
    renderHomeworkStory();
  } catch (err) {
    console.error(err);
    renderScreen(`
      <div class="results-screen">
        <div class="results-emoji text-danger">⚠️</div>
        <div class="results-title text-danger">Generation Failed</div>
        <div class="text-secondary mt-2">Could not generate homework at this time.</div>
        <button class="btn btn-secondary mt-4" onclick="App.navigate('/dashboard')">Back to Dashboard</button>
      </div>`);
  }
}

function renderHomeworkStory() {
  const hw = homeworkState.data;
  
  const html = `
    <div class="flex-between mb-3">
      <button class="btn btn-icon btn-secondary btn-sm" onclick="App.navigate('/dashboard')"><i class="fa-solid fa-arrow-left"></i></button>
      <div class="text-xs fw-700 text-muted" style="letter-spacing:.1em;text-transform:uppercase">Part 1: Story Time</div>
      <div style="width:32px"></div>
    </div>
    
    <div class="glass-card mb-3">
      <div style="font-size:1.1rem;line-height:1.6;font-weight:600;padding:.5rem">
        ${hw.story_de}
      </div>
      <div class="flex-center mt-4">
        <button class="btn btn-primary btn-sm" onclick="Speech.speak('${hw.story_de.replace(/'/g,"\\'")}', {force:true})">
          <i class="fa-solid fa-volume-high"></i> Read Aloud
        </button>
      </div>
    </div>
    
    <button class="btn btn-secondary btn-block text-sm mb-3" onclick="document.getElementById('hw-translation').style.display='block';this.style.display='none'">
      Show English Translation
    </button>
    <div id="hw-translation" class="glass-card mb-3" style="display:none;background:rgba(255,255,255,.05);border-color:transparent">
      <div class="text-secondary text-sm line-height-16">${hw.story_en}</div>
    </div>
    
    <button class="btn btn-primary btn-block btn-lg" onclick="renderHomeworkQuestions()">
      Ready for Questions <i class="fa-solid fa-arrow-right"></i>
    </button>
  `;
  renderScreen(html);
}

function renderHomeworkQuestions() {
  const hw = homeworkState.data;
  const q = hw.questions[homeworkState.currentQ];
  const pct = Math.round((homeworkState.currentQ / hw.questions.length) * 100);
  
  const html = `
    <div class="flex-between mb-3">
      <div class="text-xs fw-700 text-muted" style="letter-spacing:.1em;text-transform:uppercase">Part 2: Comprehension</div>
      <div class="text-xs text-muted">${homeworkState.currentQ + 1} / ${hw.questions.length}</div>
    </div>
    <div class="xp-bar-wrap mb-4"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
    
    <div class="lesson-card mb-3">
      <div style="font-size:1.2rem;font-weight:700">${q.q}</div>
    </div>
    
    <div class="mcq-options">
      ${q.options.map((opt, i) => `
        <button class="mcq-option" onclick="homeworkCheckAnswer('${opt.replace(/'/g,"\\'")}', '${q.answer.replace(/'/g,"\\'")}', this)">
          ${opt}
        </button>
      `).join('')}
    </div>
  `;
  renderScreen(html);
}

window.homeworkCheckAnswer = function(selected, correct, btn) {
  document.querySelectorAll('.mcq-option').forEach(b => b.disabled = true);
  const isCorrect = selected === correct;
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  
  if (isCorrect) {
    if (window.AudioFX) AudioFX.success();
  } else {
    homeworkState.mistakes++;
    if (window.AudioFX) AudioFX.error();
    document.querySelectorAll('.mcq-option').forEach(b => {
      if (b.textContent.trim() === correct) b.classList.add('correct');
    });
  }
  
  setTimeout(() => {
    homeworkState.currentQ++;
    if (homeworkState.currentQ >= homeworkState.data.questions.length) {
      renderHomeworkRoleplay();
    } else {
      renderHomeworkQuestions();
    }
  }, 1200);
};

function renderHomeworkRoleplay() {
  const hw = homeworkState.data;
  
  const html = `
    <div class="flex-between mb-3">
      <div class="text-xs fw-700 text-muted" style="letter-spacing:.1em;text-transform:uppercase">Part 3: Roleplay</div>
    </div>
    
    <div class="lesson-card" style="background:var(--grad-purple)">
      <div style="font-size:3.5rem;margin-bottom:.5rem">🎭</div>
      <div style="font-size:1.15rem;font-weight:800;color:#fff">${hw.roleplay_setup}</div>
      <div class="text-sm mt-3" style="color:rgba(255,255,255,.8)">
        The AI has been instructed to act securely within this scenario. You must respond in German to complete your objective.
      </div>
    </div>
    
    <button class="btn btn-primary btn-block btn-lg mt-4" onclick="startHomeworkRoleplay()">
      Start Roleplay <i class="fa-solid fa-microphone"></i>
    </button>
    <button class="btn btn-secondary btn-block mt-2" onclick="finishHomeworkEarly()">
      Skip Roleplay & Finish
    </button>
  `;
  renderScreen(html);
}

window.startHomeworkRoleplay = function() {
  const hw = homeworkState.data;
  
  // Trick: We will inject the roleplay_system prompt into the AI Chat system,
  // push an artificial intro message, and navigate to chat!
  window.__ROLEPLAY_OVERRIDE__ = hw.roleplay_system;
  
  // Set homework as done
  completeHomeworkMark();
  
  // Route to AI Chat 
  App.navigate('/ai/chat');
  
  setTimeout(() => {
    // Add artificial system start indication in chat
    const msgs = document.getElementById('chat-messages');
    if (msgs) {
      msgs.innerHTML = `
        <div class="flex-center mb-3">
          <span style="background:var(--grad-purple);color:#fff;padding:.2rem .75rem;border-radius:12px;font-size:.7rem;font-weight:800">
            SCENARIO ACTIVE
          </span>
        </div>
      ` + msgs.innerHTML;
    }
  }, 300);
};

window.finishHomeworkEarly = function() {
  completeHomeworkMark();
  App.navigate('/dashboard');
};

function completeHomeworkMark() {
  const p = Storage.getProfile();
  p.homeworkDate = new Date().toDateString();
  p.homeworkCompleted = true;
  Storage.setProfile(p);
  
  // Award massive XP
  Gamification.awardXP(100);
  if (window.AudioFX) AudioFX.levelUp(); // special fanfare!
  Toast.success('Daily Homework Complete! +100 XP', 4000);
}
