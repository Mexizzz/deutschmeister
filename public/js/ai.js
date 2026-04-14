/* ai.js — Frontend AI client (calls our backend /api/* routes) */
'use strict';

const AI = (() => {
  // ── Generic fetch helper ─────────────────────────────────────────────────
  async function post(endpoint, body) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res;
  }

  // ── AI Chat (streaming) ──────────────────────────────────────────────────
  // onChunk(text) called with each streamed chunk
  // onDone() called when stream ends
  async function chat(messages, scenario, level, onChunk, onDone) {
    const p = Storage.getProfile();
    const res = await post('/api/chat', {
      messages,
      scenario: scenario || 'casual conversation',
      level: level || p.level || 'A1',
    });

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = '';
    let fullText  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') { onDone?.(fullText); return; }
        try {
          const json  = JSON.parse(data);
          const chunk = json.choices?.[0]?.delta?.content || '';
          if (chunk) { fullText += chunk; onChunk?.(chunk, fullText); }
        } catch {}
      }
    }
    onDone?.(fullText);
  }

  // ── Grammar Correction ───────────────────────────────────────────────────
  // Returns: { corrected, score, errors: [{original, corrected, type, explanation}] }
  async function correctGrammar(text) {
    const p = Storage.getProfile();
    const res = await post('/api/correct', { text, level: p.level || 'A1' });
    return res.json();
  }

  // ── Story Generator ──────────────────────────────────────────────────────
  // Returns: { title, story, vocabulary: [{de, en, gender}], questions: [{question, options, answer}] }
  async function generateStory(topic) {
    const p = Storage.getProfile();
    const res = await post('/api/story', { topic, level: p.level || 'A1' });
    return res.json();
  }

  // ── Exercise Generator ───────────────────────────────────────────────────
  // Returns: [{ type, instruction, question, answer, hint, options }]
  async function generateExercises() {
    const p = Storage.getProfile();
    const weakAreas = Gamification.getWeakAreas();
    const res = await post('/api/exercises', { weakAreas, level: p.level || 'A1' });
    return res.json();
  }

  // ── Tutor Q&A ────────────────────────────────────────────────────────────
  // Returns: { answer: "markdown string" }
  async function askTutor(question) {
    const p = Storage.getProfile();
    const res = await post('/api/tutor', { question, level: p.level || 'A1' });
    return res.json();
  }

  // ── Pronunciation Evaluation ─────────────────────────────────────────────
  // Returns: { score, feedback, matches, issues: [{word, tip}], encouragement }
  async function evaluatePronunciation(spoken, target) {
    const res = await post('/api/pronunciation', { spoken, target });
    return res.json();
  }

  // ── Universal AI Define ─────────────────────────────────────────────────
  async function defineWord(word) {
    const res = await post('/api/vocab/define', { word });
    return res.json();
  }

  return { chat, correctGrammar, generateStory, generateExercises, askTutor, evaluatePronunciation, defineWord, healthCheck };
})();
