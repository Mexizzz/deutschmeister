/* auth.js — Login & Sign Up flow using Email OTP */
'use strict';

let authState = { email: '', username: '', step: 'email' }; // steps: 'email' | 'code'

function renderAuthScreen() {
  const html = `
    <div style="min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1rem">
      <!-- Logo -->
      <div style="font-size:4rem;margin-bottom:.5rem;animation:bounceIn .6s cubic-bezier(0.175, 0.885, 0.32, 1.275)">🇩🇪</div>
      <div class="fw-900 gradient-text-gold" style="font-size:2.4rem;letter-spacing:-.04em">FluentGermanAI</div>
      <div class="text-secondary mt-1 mb-4" style="max-width:300px;margin:0 auto">Log in to save your vocabulary and streak across all devices.</div>

      <!-- Form Container -->
      <div class="glass-card w-full" style="max-width:400px;text-align:left;position:relative;overflow:hidden;min-height:300px" id="auth-container">
        
        <!-- Step 1: Email & Username -->
        <div id="step-email" class="auth-step ${authState.step === 'email' ? 'active' : ''}">
          <div class="fw-700 mb-3" style="font-size:1.1rem">Create Account / Log In</div>
          
          <label class="text-xs text-muted fw-700 block mb-1">Email Address</label>
          <input type="email" id="auth-email" class="modern-input mb-3" placeholder="you@example.com" value="${authState.email}">
          
          <label class="text-xs text-muted fw-700 block mb-1">Username (for future friends!)</label>
          <input type="text" id="auth-username" class="modern-input mb-3" placeholder="e.g. Polyglot99" value="${authState.username}">
          
          <button class="btn btn-primary btn-block btn-lg mt-2" id="send-code-btn" onclick="sendAuthCode()">
            Send Login Code ✨
          </button>
        </div>

        <!-- Step 2: OTP Code -->
        <div id="step-code" class="auth-step ${authState.step === 'code' ? 'active' : ''}">
          <button class="btn btn-icon btn-secondary btn-sm mb-3" onclick="authBackToEmail()"><i class="fa-solid fa-arrow-left"></i> Back</button>
          
          <div class="fw-700 mb-1" style="font-size:1.1rem">Check your email</div>
          <div class="text-sm text-secondary mb-3">We sent a 6-digit code to <strong class="text-primary">${authState.email}</strong></div>
          
          <label class="text-xs text-muted fw-700 block mb-1">Enter Code</label>
          <input type="text" id="auth-code" class="modern-input mb-3" placeholder="123456" maxlength="6" style="font-size:1.5rem;letter-spacing:8px;text-align:center;font-weight:700">
          
          <button class="btn btn-primary btn-block btn-lg mt-2" id="verify-code-btn" onclick="verifyAuthCode()">
            Verify & Log In 🚀
          </button>
        </div>

      </div>
      
      <div class="text-xs text-muted mt-3">By logging in you agree to learn German daily.</div>
    </div>
  `;

  renderScreen(html);
}

// Ensure styles for the sliding steps are injected
const authStyles = document.createElement('style');
authStyles.innerHTML = `
  .auth-step { position: absolute; top: 0; left: 0; width: 100%; height: 100%; padding: 1.25rem; transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1); background: transparent; opacity: 0; pointer-events: none; }
  .auth-step.active { position: relative; opacity: 1; pointer-events: auto; transform: translateX(0) !important; }
  #step-email { transform: translateX(-100%); }
  #step-code { transform: translateX(100%); }
`;
// Only append if it doesn't exist to avoid duplicates on re-renders
if (!document.getElementById('auth-styles-tag')) {
  authStyles.id = 'auth-styles-tag';
  document.head.appendChild(authStyles);
}

window.sendAuthCode = async function() {
  const emailInput = document.getElementById('auth-email');
  const userInput = document.getElementById('auth-username');
  const btn = document.getElementById('send-code-btn');
  
  const email = emailInput?.value.trim();
  const username = userInput?.value.trim();
  
  if (!email || !email.includes('@')) { Toast.warning('Please enter a valid email.'); return; }
  if (!username) { Toast.warning('Please pick a username.'); return; }
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
  
  try {
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send code');
    
    authState.email = email;
    authState.username = username;
    authState.step = 'code';
    renderAuthScreen();
    
    Toast.success('Mail sent! Check your inbox 📬', 3000);
    
    // For local dev convenience without a verified Resend domain
    if (data.debugCode) {
      console.log('🤖 DEBUG MODE: Your OTP is', data.debugCode);
      setTimeout(() => {
        const codeInput = document.getElementById('auth-code');
        if (codeInput) codeInput.value = data.debugCode;
        Toast.info('Debug code auto-filled for dev mode!', 4000);
      }, 500);
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = 'Send Login Code ✨';
    Toast.error(err.message, 4000);
  }
};

window.authBackToEmail = function() {
  authState.step = 'email';
  renderAuthScreen();
};

window.verifyAuthCode = async function() {
  const codeInput = document.getElementById('auth-code');
  const btn = document.getElementById('verify-code-btn');
  const code = codeInput?.value.trim();
  
  if (!code || code.length < 6) { Toast.warning('Please enter the 6-digit code'); return; }
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
  
  try {
    const res = await fetch('/api/auth/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authState.email, username: authState.username, code })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid code');
    
    // Save Token & User metadata
    Storage.setAuthToken(data.token, data.user);
    
    btn.innerHTML = '✅ Success!';
    Toast.success(`Welcome, ${data.user.username}! 🚀`, 2000);
    
    // Sync data right after login
    await Storage.forceSyncDown();
    
    setTimeout(() => {
      App.navigate('/');
      window.location.reload(); // Hard reload to boot up logged-in state safely
    }, 800);
    
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = 'Verify & Log In 🚀';
    Toast.error(err.message, 4000);
  }
};

window.logout = function() {
  localStorage.removeItem('dm_auth_token');
  localStorage.removeItem('dm_user_meta');
  window.location.reload();
};
