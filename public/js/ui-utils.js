/* ui-utils.js — Toast, Modal, XP popup, Confetti, Markdown */
'use strict';

// ── Toast ───────────────────────────────────────────────────────────────────
const Toast = (() => {
  const container = () => document.getElementById('toast-container');

  function show(message, type = 'info', duration = 3000) {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    container().appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => { t.classList.add('show'); }); });
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 400);
    }, duration);
  }

  return {
    success: (msg, d) => show(msg, 'success', d),
    error:   (msg, d) => show(msg, 'error', d),
    info:    (msg, d) => show(msg, 'info', d),
    warning: (msg, d) => show(msg, 'warning', d),
  };
})();

// ── XP Popup ────────────────────────────────────────────────────────────────
function showXPPopup(amount) {
  const el = document.getElementById('xp-popup');
  if (!el) return;
  el.textContent = `+${amount} XP`;
  el.classList.remove('show');
  void el.offsetWidth; // reflow
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 900);
}

// ── Confetti Burst ───────────────────────────────────────────────────────────
function confettiBurst(count = 60) {
  const colors = ['#f59e0b','#8b5cf6','#10b981','#3b82f6','#ef4444','#06b6d4'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed;
      top:${40 + Math.random()*20}%;
      left:${30 + Math.random()*40}%;
      width:${6+Math.random()*6}px;
      height:${6+Math.random()*6}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>.5 ? '50%' : '2px'};
      pointer-events:none;
      z-index:9999;
      animation:confettiFall ${0.8+Math.random()*1.2}s ease-out ${Math.random()*0.4}s forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confettiFall {
        from { transform: translateY(0) rotate(0deg); opacity:1; }
        to   { transform: translateY(200px) rotate(720deg); opacity:0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ── Modal ────────────────────────────────────────────────────────────────────
const Modal = (() => {
  function show({ title, body, buttons = [] }) {
    document.getElementById('modal-header').innerHTML = `<h3>${title}</h3>`;
    document.getElementById('modal-body').innerHTML = body;
    const footer = document.getElementById('modal-footer');
    footer.innerHTML = '';
    buttons.forEach(({ label, style = 'secondary', onClick }) => {
      const btn = document.createElement('button');
      btn.className = `btn btn-${style}`;
      btn.textContent = label;
      btn.onclick = () => { onClick?.(); hide(); };
      footer.appendChild(btn);
    });
    document.getElementById('modal-overlay').classList.add('open');
  }

  function hide() {
    document.getElementById('modal-overlay').classList.remove('open');
  }

  function confirm(title, message, onConfirm) {
    show({
      title,
      body: `<p class="text-secondary">${message}</p>`,
      buttons: [
        { label: 'Cancel', style: 'secondary', onClick: () => {} },
        { label: 'Confirm', style: 'danger', onClick: onConfirm },
      ],
    });
  }

  // Close on overlay click
  document.addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') hide();
  });

  return { show, hide, confirm };
})();

// ── Markdown Renderer (simple) ───────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Tables
    .replace(/\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)*)/g, (_, header, rows) => {
      const ths = header.split('|').filter(s => s.trim()).map(s => `<th>${s.trim()}</th>`).join('');
      const trs = rows.trim().split('\n').map(row => {
        const tds = row.split('|').filter(s => s.trim()).map(s => `<td>${s.trim()}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
    })
    // Code blocks
    .replace(/```[\s\S]*?```/g, m => `<pre><code>${m.slice(3,-3).replace(/\n/,'')}</code></pre>`)
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1>$1</h1>')
    // Lists
    .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Paragraphs (double newline)
    .replace(/\n\n/g, '</p><p>')
    // Single newlines
    .replace(/\n/g, '<br>');

  return `<div class="md-content"><p>${html}</p></div>`;
}

// ── Score Ring ───────────────────────────────────────────────────────────────
function createScoreRing(score, size = 100) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return `
    <div class="score-ring-wrap">
      <svg class="score-ring-svg" width="${size}" height="${size}">
        <circle class="score-ring-track" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="7"/>
        <circle class="score-ring-fill" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="7"
          stroke-dasharray="${circ}" stroke-dashoffset="${offset}"/>
      </svg>
      <div class="score-ring-label">${score}%</div>
    </div>`;
}

// ── Waveform HTML ────────────────────────────────────────────────────────────
function createWaveform() {
  return `<div class="waveform">${Array.from({length:5},
    (_,i) => `<div class="wave-bar" style="animation-delay:${i*0.15}s"></div>`
  ).join('')}</div>`;
}

// ── Screen Transition ────────────────────────────────────────────────────────
function renderScreen(html) {
  const root = document.getElementById('app-root');
  // Trigger fade out
  root.classList.add('fade-out');
  
  setTimeout(() => {
    window.scrollTo(0, 0); // Auto-scroll to top on new screen
    root.innerHTML = html;
    // Release fade out to trigger CSS transition fade in
    requestAnimationFrame(() => {
      root.classList.remove('fade-out');
    });
  }, 180);
}

// ── Format helpers ───────────────────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return 'Never';
  return new Date(ts).toLocaleDateString();
}

function levelName(appLevel) {
  if (appLevel <= 5)  return 'Anfänger';
  if (appLevel <= 10) return 'Lernende';
  if (appLevel <= 18) return 'Fortgeschritten';
  if (appLevel <= 25) return 'Experte';
  return 'Meister';
}

function xpForLevel(level) {
  return level * level * 60; // 60, 240, 540, ...
}

// ── Theme Engine ─────────────────────────────────────────────────────────────
const UI = (() => {
  function applyTheme(themeName) {
    if (!themeName) return;
    const root = document.documentElement;
    // Remove existing themes
    root.classList.forEach(cls => {
      if (cls.startsWith('theme-')) root.classList.remove(cls);
    });
    // Add new theme
    root.classList.add(`theme-${themeName}`);
  }

  return { applyTheme };
})();
