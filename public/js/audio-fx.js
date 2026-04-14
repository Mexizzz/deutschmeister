/* audio-fx.js — Zero-dependency Web Audio API synthesizers for satisfying UI feedback */
'use strict';

const AudioFX = (() => {
  let L, T; // audioContext and playTime variables

  function initAudio() {
    if (!L) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) L = new AudioCtx();
    }
  }

  function s(e, t, n, r, a, o) {
    if (!L) return;
    const i = L.createOscillator();
    const u = L.createGain();
    i.connect(u);
    u.connect(L.destination);
    i.type = t;
    i.frequency.setValueAtTime(n, e);
    i.frequency.exponentialRampToValueAtTime(r, e + o);
    u.gain.setValueAtTime(a, e);
    u.gain.exponentialRampToValueAtTime(0.001, e + o);
    i.start(e);
    i.stop(e + o);
  }

  // ── Specific Sound Effects ──────────────────────────────────────────────────
  function success() {
    initAudio();
    if (!L) return;
    T = L.currentTime;
    s(T,        'sine', 523.25, 523.25, 0.4, 0.15); // C5
    s(T + 0.1,  'sine', 659.25, 659.25, 0.4, 0.3);  // E5
  }

  function error() {
    initAudio();
    if (!L) return;
    T = L.currentTime;
    s(T,        'sawtooth', 150, 100, 0.3, 0.2);
    s(T + 0.15, 'sawtooth', 100,  80, 0.3, 0.3);
  }

  function levelUp() {
    initAudio();
    if (!L) return;
    T = L.currentTime;
    s(T,        'sine', 523.25, 523.25, 0.4, 0.2); // C5
    s(T + 0.15, 'sine', 659.25, 659.25, 0.4, 0.2); // E5
    s(T + 0.3,  'sine', 783.99, 783.99, 0.4, 0.2); // G5
    s(T + 0.45, 'sine', 1046.5, 1046.5, 0.5, 0.6); // C6
  }

  function tap() {
    initAudio();
    if (!L) return;
    T = L.currentTime;
    s(T, 'sine', 300, 200, 0.2, 0.05);
  }

  // Pre-warm context on first user interaction to bypass browser autoplay policies
  window.addEventListener('pointerdown', () => {
    if (L && L.state === 'suspended') L.resume();
  }, { once: true });

  return { success, error, levelUp, tap, initAudio };
})();
