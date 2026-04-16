/* auth.js — Login & Sign Up flow with Email Verification for New Users */
'use strict';

let authState = { tab: 'login', email: '', username: '', password: '', step: 'details' }; // steps: 'details' | 'verify'

window.renderAuthScreen = function() {
  const html = `
    <div style="min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1rem">
      <!-- Logo -->
      <a href="/" style="text-decoration:none; display:inline-block">
        <div style="font-size:3.5rem;margin-bottom:.5rem;animation:bounceIn .6s cubic-bezier(0.175, 0.885, 0.32, 1.275)">🇩🇪</div>
        <div class="fw-900 gradient-text-gold" style="font-size:2.2rem;letter-spacing:-.04em">FluentGermanAI</div>
      </a>
      <div class="text-secondary mt-1 mb-4" style="max-width:300px;margin:0 auto">Your AI-Powered Journey to Fluency</div>

      <!-- Form Container -->
      <div class="glass-card w-full" style="max-width:400px;text-align:left;position:relative;overflow:hidden;padding:1.5rem" id="auth-container">
        
        <!-- Tabs -->
        <div style="display:flex; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:1.5rem">
          <div class="auth-tab ${authState.tab === 'login' ? 'active' : ''}" onclick="switchAuthTab('login')">Log In</div>
          <div class="auth-tab ${authState.tab === 'register' ? 'active' : ''}" onclick="switchAuthTab('register')">Sign Up</div>
        </div>
        
        ${authState.tab === 'login' ? `
          <form onsubmit="handleAuthSubmit(event, 'login')">
            <label class="text-xs text-muted fw-700 block mb-1">Email or Username</label>
            <input type="text" id="auth-email" class="modern-input mb-3" placeholder="you@example.com or Username" value="${authState.email}" required>
            
            <label class="text-xs text-muted fw-700 block mb-1">Password</label>
            <input type="password" id="auth-pass" class="modern-input mb-4" placeholder="••••••••" required>
            
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit-btn">
              Log In <i class="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </form>
        ` : `
          <form onsubmit="handleAuthSubmit(event, 'register')">
            <label class="text-xs text-muted fw-700 block mb-1">Email Address</label>
            <input type="email" id="auth-email" class="modern-input mb-3" placeholder="you@example.com" value="${authState.email}" required>
            
            <label class="text-xs text-muted fw-700 block mb-1">Display Name / Username</label>
            <input type="text" id="auth-username" class="modern-input mb-3" placeholder="e.g. Polyglot99" value="${authState.username}" required>

            <label class="text-xs text-muted fw-700 block mb-1">Create Password (Min 6 chars)</label>
            <input type="password" id="auth-pass" class="modern-input mb-4" placeholder="••••••••" required>
            
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="auth-submit-btn" style="background:var(--grad-purple)">
              Create Account 🚀
            </button>
          </form>
        `}
      </div>
    </div>
  `;

  renderScreen(html);
}

// Inline tab styling
if (!document.getElementById('auth-styles')) {
  const s = document.createElement('style');
  s.id = 'auth-styles';
  s.innerHTML = `
    .auth-tab { flex:1; text-align:center; padding:0.5rem; font-weight:700; color:var(--text-muted); cursor:pointer; transition:all 0.3s ease; border-bottom:2px solid transparent;}
    .auth-tab.active { color:var(--text-primary); border-bottom:2px solid var(--accent-gold); }
    .auth-tab:hover:not(.active) { color:white; }
  `;
  document.head.appendChild(s);
}

window.switchAuthTab = function(tab) {
  const em = document.getElementById('auth-email');
  if (em) authState.email = em.value;
  authState.tab = tab;
  renderAuthScreen();
};

window.handleAuthSubmit = async function(e, type) {
  e.preventDefault();
  
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-pass').value;
  const username = type === 'register' ? document.getElementById('auth-username').value.trim() : null;
  
  const btn = document.getElementById('auth-submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
  
  const endpoint = type === 'register' ? '/api/auth/register' : '/api/auth/login';
  const body = type === 'register' ? { email, username, password } : { email, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Authentication failed');

    // Success for Login/Registration (Direct)
    Storage.setAuthToken(data.token, data.user);
    btn.innerHTML = '✅ Success!';
    Toast.success(`Welcome back, ${data.user.username}!`, 2000);
    await Storage.forceSyncDown();
    
    setTimeout(() => {
      App.navigate('/dashboard');
      window.location.reload(); 
    }, 800);
    
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = type === 'register' ? 'Create Account 🚀' : 'Log In <i class="fa-solid fa-arrow-right ml-2"></i>';
    Toast.error(err.message, 4000);
  }
};


window.logout = function() {
  localStorage.removeItem('dm_auth_token');
  localStorage.removeItem('dm_user_meta');
  window.location.reload();
};
