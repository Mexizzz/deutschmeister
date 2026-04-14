/* speech.js — Premium TTS + Speech Recognition wrapper
   Changes for better learning:
   - Default rate lowered to 0.72 (slow & clear)
   - Intelligent German voice priority (female Google/Microsoft voices first)
   - speak() pauses between words in "word-by-word" mode
   - attachSpeakerButtons() double-click → word-by-word replay
   - Recognition now accepts interimResults for better mic feedback
*/
'use strict';

const Speech = (() => {
  let voices = [];
  let germanVoice = null;

  // ── Voice priority list (best German voices first) ──────────────────────
  const PREFERRED_VOICES = [
    // Google TTS (best quality, available in Chrome)
    'Google Deutsch',
    'Google Deutsch (Deutschland)',
    // Microsoft (Edge/Windows)
    'Microsoft Hedda Online',
    'Microsoft Hedda',
    'Microsoft Katja Online',
    'Microsoft Katja',
    'Microsoft Stefan Online',
    'Microsoft Stefan',
  ];

  function selectBestGermanVoice(voiceList) {
    // 1. Try preferred voices by exact name match
    for (const name of PREFERRED_VOICES) {
      const v = voiceList.find(v => v.name === name);
      if (v) return v;
    }
    // 2. Try any voice containing "Google" + German lang
    const googleDe = voiceList.find(v => v.lang.startsWith('de') && v.name.includes('Google'));
    if (googleDe) return googleDe;

    // 3. Try any Microsoft + German
    const msDe = voiceList.find(v => v.lang.startsWith('de') && v.name.includes('Microsoft'));
    if (msDe) return msDe;

    // 4. Fall back to first German voice available
    return voiceList.find(v => v.lang.startsWith('de') || v.lang.startsWith('de-')) || null;
  }

  function loadVoices() {
    voices = speechSynthesis.getVoices();
    germanVoice = selectBestGermanVoice(voices);
  }

  if (typeof speechSynthesis !== 'undefined') {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  // ── Core speak() ─────────────────────────────────────────────────────────
  // rate: 0.72 default = slow & clear, great for learners
  function speak(text, options = {}) {
    if (!('speechSynthesis' in window)) return Promise.resolve();
    const p = Storage.getProfile();
    if (!p.soundEnabled && !options.force) return Promise.resolve();

    // Clean the text for TTS (remove HTML, decode entities)
    const clean = text
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

    if (!clean) return Promise.resolve();

    return new Promise((resolve) => {
      speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang  = 'de-DE';

      // Use profile speed OR a sensible default of 0.72 (slow & clear)
      const profileRate = p.speechSpeed ?? 0.72;
      utter.rate   = options.rate ?? profileRate;
      utter.pitch  = options.pitch ?? 1.0;
      utter.volume = options.volume ?? 1.0;

      // Ensure we use the best German voice
      if (!voices.length) loadVoices();
      if (germanVoice) utter.voice = germanVoice;

      utter.onend   = resolve;
      utter.onerror = resolve; // resolve even on error so callers don't hang

      speechSynthesis.speak(utter);
    });
  }

  // ── Word-by-Word Speak (for deep learning mode) ──────────────────────────
  // Speaks each word with a short pause between them
  async function speakWordByWord(text, pauseMs = 350) {
    if (!('speechSynthesis' in window)) return;
    const words = text.replace(/<[^>]+>/g, '').trim().split(/\s+/);
    for (const word of words) {
      await speak(word, { rate: 0.65, force: true });
      // Small gap between words
      await new Promise(r => setTimeout(r, pauseMs));
    }
  }

  function stop() {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }

  // ── Attach speaker buttons ──────────────────────────────────────────────
  // Single click: full phrase at learner speed
  // Double click: slow word-by-word replay
  function attachSpeakerButtons(container = document) {
    container.querySelectorAll('[data-speak]').forEach(btn => {
      // Prevent duplicate listeners
      if (btn.dataset.speechAttached) return;
      btn.dataset.speechAttached = '1';

      let clickTimer = null;

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const rawText = btn.getAttribute('data-speak') || '';
        const text = decodeURIComponent(rawText);
        const icon = btn.querySelector('i');

        if (clickTimer) {
          // Double-click: word by word
          clearTimeout(clickTimer);
          clickTimer = null;
          if (icon) icon.style.color = '#f59e0b'; // gold = word-by-word mode
          speakWordByWord(text).then(() => {
            if (icon) icon.style.color = '';
          });
        } else {
          clickTimer = setTimeout(() => {
            clickTimer = null;
            // Single click: full phrase at normal learning speed
            if (icon) icon.style.color = '#10b981'; // green = speaking
            speak(text, { force: true }).then(() => {
              if (icon) icon.style.color = '';
            });
          }, 250); // 250ms window for double-click detection
        }
      });
    });
  }

  // ── Speech Recognition ────────────────────────────────────────────────────
  let recognizer = null;

  function isRecognitionSupported() {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  function startListening(onResult, onError, onInterim) {
    if (!isRecognitionSupported()) {
      onError?.('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognizer = new SpeechRecognition();
    recognizer.lang            = 'de-DE';
    recognizer.continuous      = false;
    recognizer.interimResults  = !!onInterim; // show interim if handler provided
    recognizer.maxAlternatives = 3; // get top 3 alternatives for better matching

    recognizer.onresult = e => {
      let interimTranscript = '';
      let finalTranscript   = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t;
        else interimTranscript += t;
      }

      if (interimTranscript && onInterim) onInterim(interimTranscript);
      if (finalTranscript) onResult(finalTranscript.trim());
    };

    recognizer.onerror = e => {
      const msg = {
        'no-speech':    'No speech detected. Speak closer to the microphone.',
        'audio-capture':'Microphone not accessible.',
        'not-allowed':  'Microphone permission denied. Please allow microphone access.',
        'network':      'Network error during speech recognition.',
      }[e.error] || `Speech error: ${e.error}`;
      onError?.(msg);
    };

    recognizer.onend = () => {
      recognizer = null;
    };

    recognizer.start();
    return recognizer;
  }

  function stopListening() {
    if (recognizer) { try { recognizer.stop(); } catch {} recognizer = null; }
  }

  // ── Pronunciation helpers ─────────────────────────────────────────────────
  // Speak a word then pause then speak it again (repeat for learning)
  async function pronounceDrill(word, times = 2) {
    for (let i = 0; i < times; i++) {
      await speak(word, { force: true, rate: 0.65 });
      await new Promise(r => setTimeout(r, i === 0 ? 700 : 400));
    }
  }

  // Speak phrase at 3 different speeds (slow → medium → normal)
  async function pronunciationChallenge(text) {
    await speak(text, { force: true, rate: 0.6 });   // very slow
    await new Promise(r => setTimeout(r, 800));
    await speak(text, { force: true, rate: 0.8 });   // medium
    await new Promise(r => setTimeout(r, 600));
    await speak(text, { force: true, rate: 1.0 });   // natural
  }

  return {
    speak,
    speakWordByWord,
    pronounceDrill,
    pronunciationChallenge,
    stop,
    attachSpeakerButtons,
    startListening,
    stopListening,
    isRecognitionSupported,
    getVoiceInfo: () => germanVoice ? `${germanVoice.name} (${germanVoice.lang})` : 'System default',
  };
})();
