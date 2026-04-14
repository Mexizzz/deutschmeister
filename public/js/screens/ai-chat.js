/* ai-chat.js — AI Conversation Partner */
'use strict';

let chatState = null;

const SCENARIOS = [
  { id:'cafe',        name:'At a Café',         icon:'☕', prompt:'You are a German café server and the learner is a customer ordering coffee and food.' },
  { id:'friends',     name:'Making Friends',     icon:'🤝', prompt:'You are a friendly German speaker meeting the learner for the first time.' },
  { id:'airport',     name:'At the Airport',     icon:'✈️', prompt:'You are a German airport staff member helping the learner navigate the airport.' },
  { id:'shopping',    name:'Shopping',           icon:'🛍️', prompt:'You are a German shop assistant helping the learner find and buy clothing.' },
  { id:'restaurant',  name:'Restaurant',         icon:'🍽️', prompt:'You are a German restaurant waiter taking the learner\'s order.' },
  { id:'directions',  name:'Asking Directions',  icon:'🗺️', prompt:'You are a German local helping the learner find their way around the city.' },
  { id:'doctor',      name:'Doctor Visit',       icon:'🏥', prompt:'You are a German doctor\'s receptionist helping the learner book an appointment.' },
  { id:'interview',   name:'Job Interview',      icon:'💼', prompt:'You are conducting a casual German job interview with the learner for a simple job.' },
];

function renderAIChat() {
  chatState = { scenario: null, messages: [], streaming: false };
  renderScenarioPicker();
}

function renderScenarioPicker() {
  const html = `
    <div class="section-label mb-2">💬 AI Conversation Partner</div>
    <p class="text-secondary text-sm mb-3">Practice real German conversations with an AI that corrects your mistakes gently.</p>
    <div class="section-label mb-2">Choose a Scenario</div>
    <div class="scenario-grid">
      ${SCENARIOS.map(s => `
        <div class="scenario-card" onclick="startChat('${s.id}')">
          <div class="scenario-icon">${s.icon}</div>
          <div class="scenario-name">${s.name}</div>
        </div>`).join('')}
    </div>
  `;
  renderScreen(html);
}

function startChat(scenarioId) {
  const scenario = SCENARIOS.find(s => s.id === scenarioId);
  if (!scenario) return;

  const savedHistory = Storage.getChatHistory(scenarioId);
  chatState = {
    scenario,
    messages: savedHistory.length > 0 ? savedHistory : [],
    streaming: false,
  };

  renderChatScreen();

  // If new chat, send opening message from AI
  if (chatState.messages.length === 0) {
    setTimeout(() => sendAIOpener(scenario), 400);
  }
}

function renderChatScreen() {
  const { scenario, messages } = chatState;

  const bubblesHtml = messages.map(m => {
    if (m.role === 'system') return '';
    const isUser = m.role === 'user';
    return `<div class="bubble ${isUser ? 'bubble-user' : 'bubble-ai'}">
      ${m.content}
      ${!isUser ? `<div style="margin-top:.5rem"><button class="btn btn-icon btn-secondary btn-sm" data-speak="${encodeURIComponent(m.content.replace(/<[^>]+>/g,''))}" onclick="speakBubble(this)" style="padding:.3rem .5rem;font-size:.75rem"><i class="fa-solid fa-volume-high"></i></button></div>` : ''}
    </div>`;
  }).join('');

  const html = `
    <div class="flex-between mb-2">
      <button class="btn btn-secondary btn-sm" onclick="renderAIChat()">← Scenarios</button>
      <span class="text-sm fw-700">${scenario.icon} ${scenario.name}</span>
      <button class="btn btn-secondary btn-sm" onclick="clearChat()">🗑️</button>
    </div>

    <div id="chat-messages" class="chat-messages" style="min-height:40vh;max-height:55vh;overflow-y:auto;padding-bottom:.5rem">
      ${bubblesHtml}
      <div id="typing-indicator" class="hide">
        <div class="typing-indicator">
          <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
      </div>
    </div>

    <div class="chat-input-bar" style="position:sticky;bottom:var(--nav-height);margin:0 -1.25rem;padding:.75rem 1.25rem">
      <input type="text" id="chat-input" class="chat-input" 
             placeholder="Type in German..." 
             onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();sendUserMessage()}">
      ${Speech.isRecognitionSupported() ? `<button class="btn btn-secondary btn-icon" id="mic-btn" onclick="startMicInput()" title="Speak">🎤</button>` : ''}
      <button class="btn btn-purple btn-icon" onclick="sendUserMessage()">
        <i class="fa-solid fa-paper-plane"></i>
      </button>
    </div>
  `;

  renderScreen(html);
  scrollChatBottom();
  setTimeout(() => Speech.attachSpeakerButtons(), 200);
}

window.speakBubble = function(btn) {
  const text = decodeURIComponent(btn.getAttribute('data-speak'));
  Speech.speak(text, { force: true });
};

async function sendAIOpener(scenario) {
  const p = Storage.getProfile();
  showTypingIndicator();

  try {
    let fullText = '';
    await AI.chat(
      [{ role:'user', content:'Start the conversation. Greet me and set the scene.' }],
      scenario.prompt,
      p.level,
      (chunk) => {
        fullText += chunk;
        updateStreamingBubble(fullText);
      },
      (final) => {
        finalizeAIBubble(final, scenario.id);
      }
    );
  } catch (err) {
    hideTypingIndicator();
    appendBubble('ai', '⚠️ Could not connect to AI. Please check your server.');
  }
}

async function sendUserMessage() {
  const input = document.getElementById('chat-input');
  if (!input || chatState.streaming) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  appendBubble('user', text);
  chatState.messages.push({ role:'user', content: text });
  Storage.setChatHistory(chatState.scenario.id, chatState.messages);
  Gamification.awardXP(5);

  showTypingIndicator();
  chatState.streaming = true;

  const p = Storage.getProfile();
  const historyForAPI = chatState.messages
    .filter(m => m.role !== 'system')
    .slice(-10)
    .map(m => ({ role: m.role, content: m.content }));

  try {
    let fullText = '';
    await AI.chat(
      historyForAPI,
      chatState.scenario.prompt,
      p.level,
      (chunk) => {
        hideTypingIndicator();
        fullText += chunk;
        updateStreamingBubble(fullText);
      },
      (final) => {
        finalizeAIBubble(final, chatState.scenario.id);
        chatState.streaming = false;

        // XP for sustained conversation
        if (chatState.messages.filter(m => m.role === 'user').length >= 10) {
          Gamification.awardXP(20);
          Gamification.logMistake('ai_chat_used');
          Toast.info('🗣️ +20 XP for sustained conversation!', 3000);
        }
      }
    );
  } catch (err) {
    chatState.streaming = false;
    hideTypingIndicator();
    appendBubble('ai', `⚠️ Error: ${err.message}`);
  }
}

function appendBubble(role, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `bubble bubble-${role === 'user' ? 'user' : 'ai'}`;
  div.innerHTML = text;
  // Remove typing indicator first
  const ti = document.getElementById('typing-indicator');
  if (ti) container.insertBefore(div, ti);
  else container.appendChild(div);
  scrollChatBottom();
}

let streamingBubble = null;
function updateStreamingBubble(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  if (!streamingBubble) {
    streamingBubble = document.createElement('div');
    streamingBubble.className = 'bubble bubble-ai';
    const ti = document.getElementById('typing-indicator');
    if (ti) container.insertBefore(streamingBubble, ti);
    else container.appendChild(streamingBubble);
  }
  streamingBubble.innerHTML = text + '<span style="opacity:.5">▌</span>';
  scrollChatBottom();
}

function finalizeAIBubble(text, scenarioId) {
  if (streamingBubble) {
    streamingBubble.innerHTML = `
      ${text}
      <div style="margin-top:.5rem">
        <button class="btn btn-secondary btn-sm" data-speak="${encodeURIComponent(text.replace(/<[^>]+>/g,''))}" 
                onclick="speakBubble(this)" style="padding:.3rem .5rem;font-size:.75rem">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>`;
    streamingBubble = null;
  }
  hideTypingIndicator();
  chatState.messages.push({ role:'assistant', content: text });
  Storage.setChatHistory(scenarioId, chatState.messages);
  setTimeout(() => Speech.attachSpeakerButtons(), 100);
}

function showTypingIndicator() {
  const ti = document.getElementById('typing-indicator');
  if (ti) { ti.classList.remove('hide'); scrollChatBottom(); }
}
function hideTypingIndicator() {
  const ti = document.getElementById('typing-indicator');
  if (ti) ti.classList.add('hide');
}
function scrollChatBottom() {
  const el = document.getElementById('chat-messages');
  if (el) el.scrollTop = el.scrollHeight;
}

window.clearChat = function() {
  if (!chatState?.scenario) return;
  Modal.confirm('Clear Chat', 'Delete this conversation history?', () => {
    Storage.setChatHistory(chatState.scenario.id, []);
    chatState.messages = [];
    renderChatScreen();
    sendAIOpener(chatState.scenario);
  });
};

window.startMicInput = function() {
  const btn = document.getElementById('mic-btn');
  if (btn) btn.textContent = '🔴';
  Speech.startListening(
    (transcript) => {
      if (btn) btn.textContent = '🎤';
      const input = document.getElementById('chat-input');
      if (input) { input.value = transcript; sendUserMessage(); }
    },
    (err) => {
      if (btn) btn.textContent = '🎤';
      Toast.error(err);
    }
  );
};
