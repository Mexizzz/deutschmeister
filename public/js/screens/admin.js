/* admin.js — Admin Panel for viewing all users */
'use strict';

async function renderAdminPanel() {
  const token = Storage.getAuthToken();
  if (!token) return App.navigate('/auth');

  renderScreen(`
    <div style="max-width: 1000px; margin: 0 auto; width: 100%;">
      <div class="dashboard-banner mb-4 animate-fade-in stagger-1">
        <div class="banner-content">
          <h1>Admin Dashboard 👑</h1>
          <p style="opacity: 0.7;">Overview of all registered users on the platform.</p>
        </div>
      </div>
      
      <div id="admin-content" class="glass-card-smooth animate-fade-in stagger-2" style="min-height: 400px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
        <i class="fa-solid fa-circle-notch fa-spin fa-2x" style="color: var(--color-primary);"></i>
      </div>
    </div>
  `);

  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!res.ok) {
      if (res.status === 403) {
        document.getElementById('admin-content').innerHTML = `
          <i class="fa-solid fa-lock fa-3x mb-3" style="color: var(--color-secondary);"></i>
          <h3>Access Denied</h3>
          <p class="text-muted">You do not have administrative privileges.</p>
          <button class="btn btn-primary mt-3" onclick="App.navigate('/dashboard')">Go Back</button>
        `;
        return;
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    
    if (!data.success) throw new Error(data.error || 'Failed to fetch users');
    
    let rowsHtml = '';
    data.users.forEach(u => {
      const date = new Date(u.created_at).toLocaleDateString();
      const synced = u.last_synced ? new Date(u.last_synced).toLocaleDateString() : 'Never';
      rowsHtml += `
        <tr style="transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
          <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: 700;">${u.username}</td>
          <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--text-muted);">${u.email}</td>
          <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);">${u.app_level || 1}</td>
          <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: var(--accent-gold); font-weight: 800;">${u.streak || 0} 🔥</td>
          <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9rem;">${date}</td>
          <td style="padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.8rem; color: var(--text-muted);">${synced}</td>
        </tr>
      `;
    });

    document.getElementById('admin-content').innerHTML = `
      <div style="width: 100%; overflow-x: auto; align-self: flex-start;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr>
              <th style="padding: 1rem; border-bottom: 2px solid var(--panel-border); color: var(--text-muted); font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Username</th>
              <th style="padding: 1rem; border-bottom: 2px solid var(--panel-border); color: var(--text-muted); font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Email</th>
              <th style="padding: 1rem; border-bottom: 2px solid var(--panel-border); color: var(--text-muted); font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Level</th>
              <th style="padding: 1rem; border-bottom: 2px solid var(--panel-border); color: var(--text-muted); font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Streak</th>
              <th style="padding: 1rem; border-bottom: 2px solid var(--panel-border); color: var(--text-muted); font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Joined</th>
              <th style="padding: 1rem; border-bottom: 2px solid var(--panel-border); color: var(--text-muted); font-weight: 800; font-size: 0.85rem; text-transform: uppercase;">Last Sync</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      <div class="text-xs text-muted text-center mt-4 w-100 pb-2">Total Users: ${data.count}</div>
    `;
    // reset alignment
    document.getElementById('admin-content').style.justifyContent = 'flex-start';

  } catch (err) {
    console.error('Admin Panel Error:', err);
    document.getElementById('admin-content').innerHTML = `
      <i class="fa-solid fa-triangle-exclamation fa-3x mb-3" style="color: var(--color-secondary);"></i>
      <h3>Error Loading Users</h3>
      <p class="text-muted">${err.message}</p>
    `;
  }
}
