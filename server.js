'use strict';
require('dotenv').config(); // Load .env file (GROQ_API_KEY etc.)

const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const db = require('./db');

const app = express();
const resend = new Resend('re_dyrgNJBX_2Dhghb7nx8rcCBcZAcr8nPb8'); // Explicitly adding the user's key here
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-deutschmeister-key';
const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '1MB' })); // Increased limit for saving progress json
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate Limiting (in-memory per IP) ───────────────────────────────────────
const rateLimitMap = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 40; // requests per minute per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_WINDOW_MS;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return entry.count <= RATE_MAX;
}

// ── System Prompts ─────────────────────────────────────────────────────────
const PROMPTS = {
  chat: (level, scenario) =>
    `You are a friendly German language conversation partner. The learner is at CEFR level ${level}.
Scenario: ${scenario}.
Rules:
- Respond ONLY in German, but add English translations in parentheses for any word above ${level} difficulty.
- Keep replies to 2-3 short sentences.
- If the user makes a grammar mistake, gently correct it at the end of your reply with a tip emoji 💡.
- Stay in character for the scenario.
- Be warm, encouraging, and patient.`,

  correct: () =>
    `You are a German grammar expert. The user has written German text that may contain errors.
Analyze it carefully and return ONLY a valid JSON object with this exact shape:
{
  "corrected": "the fully corrected German text",
  "score": 85,
  "errors": [
    {
      "original": "the wrong phrase",
      "corrected": "the correct phrase",
      "type": "article|case|conjugation|word_order|spelling|other",
      "explanation": "Clear explanation in English of why this is wrong and how to fix it"
    }
  ]
}
If there are no errors, return an empty errors array and score of 100.`,

  story: (level, topic) =>
    `You are a creative German language teacher. Generate a short German story for a ${level} learner about: ${topic}.
Return ONLY a valid JSON object with this exact shape:
{
  "title": "Story title in German",
  "story": "The full story text in German (3-4 paragraphs, appropriate for ${level})",
  "vocabulary": [
    {"de": "German word", "en": "English translation", "gender": "m|f|n|plural|verb"}
  ],
  "questions": [
    {"question": "Comprehension question in English", "options": ["A", "B", "C", "D"], "answer": 0}
  ]
}
Include 8-10 vocabulary items and 3 comprehension questions. Use simple vocabulary for A1/A2.`,

  exercises: (level, weakAreas) =>
    `You are a German language teacher. Generate 5 targeted exercises for a ${level} learner focusing on these weak areas: ${weakAreas}.
Return ONLY a valid JSON array with this exact shape:
[
  {
    "type": "fill_blank|translate|conjugate|choose_article|word_order",
    "instruction": "What the student should do",
    "question": "The exercise question (use ___ for blanks)",
    "answer": "The correct answer",
    "hint": "A helpful hint",
    "options": ["A", "B", "C", "D"]
  }
]
Make exercises progressively harder. Include options array for all types.`,

  tutor: (level) =>
    `You are a patient and expert German language tutor. The learner is at CEFR level ${level}.
Answer their questions about German grammar, vocabulary, or usage clearly and helpfully.
Use concrete examples with both German sentences and English translations.
Format your response with markdown: use **bold** for key terms, tables for paradigms, and bullet points for lists.
Keep explanations clear and beginner-friendly for ${level} level.`,

  pronunciation: () =>
    `You are a German pronunciation coach. Compare the learner's spoken text to the target text and evaluate their pronunciation.
Return ONLY a valid JSON object with this exact shape:
{
  "score": 85,
  "feedback": "Overall encouraging feedback sentence",
  "matches": true,
  "issues": [
    {"word": "the problematic word", "tip": "specific pronunciation tip for this word"}
  ],
  "encouragement": "A motivating closing sentence"
}`
};

// ── Auth & Database Routes ───────────────────────────────────────────────────

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// 1. Password Registration (Initiation)
app.post('/api/auth/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) return res.status(400).json({ error: 'All fields are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const emailLower = email.toLowerCase();
    
    // Check conflicts
    if (await db.getUserByEmail(emailLower)) return res.status(409).json({ error: 'Email already registered' });
    if (await db.getUserByUsername(username)) return res.status(409).json({ error: 'Username is already taken' });

    // Generate Verification Code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = db.generateSalt();
    const hash = db.hashPassword(password, salt);
    const userId = crypto.randomUUID();
    
    // Save to PENDING instead of permanent
    await db.savePendingUser(userId, emailLower, username, hash, salt, code);

    // Send Code via Resend
    try {
      await resend.emails.send({
        from: 'FluentGermanAI <onboarding@resend.dev>',
        to: emailLower,
        subject: `${code} is your FluentGermanAI verification code 🇩🇪`,
        html: `
          <div style="font-family:sans-serif; text-align:center; padding:2rem; border:1px solid #eee; border-radius:12px;">
            <h2 style="color:#6366f1;">Welcome to FluentGermanAI!</h2>
            <p>To finalize your account, please enter this code in the app:</p>
            <h1 style="letter-spacing:6px; font-size:3rem; color:#111;">${code}</h1>
            <p style="color:#666; font-size:0.9rem;">This code expires in 15 minutes.</p>
          </div>
        `
      });
      res.json({ success: true, verificationRequired: true, message: 'Code sent!' });
    } catch (err) {
      console.error('Email Dispatch Error:', err);
      // Fallback debug code for dev
      res.json({ success: true, verificationRequired: true, debugCode: code });
    }
  } catch (err) {
    console.error('Registration Init Error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// 1.5 Verify Registration Code
app.post('/api/auth/verify-registration', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code required' });

  try {
    const emailLower = email.toLowerCase();
    const pending = await db.getPendingUser(emailLower);

    if (!pending || pending.code !== code) {
      return res.status(401).json({ error: 'Invalid or expired verification code' });
    }

    // Officialize Account
    await db.createUser(pending.id, emailLower, pending.username, pending.password_hash, pending.salt);

    // Initialize Default User Profile Data
    const defaultProfile = { name: pending.username, level: 'A1', xp: 0, hearts: 5, appLevel: 1 };
    await db.createUserData(pending.id, defaultProfile, {}, []);

    // Cleanup
    await db.deletePendingUser(emailLower);

    const token = jwt.sign({ id: pending.id, username: pending.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: pending.id, username: pending.username, email: emailLower } });
  } catch (err) {
    console.error('Verification Error:', err);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

// 2. Password Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const emailLower = email.toLowerCase();
    const user = await db.getUserByEmail(emailLower);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Legacy OTP users won't have a passwordHash/salt. Gracefully handle it.
    if (!user.passwordHash || !user.salt) {
       return res.status(401).json({ error: 'This account was created via Email Magic Link. Please re-register to set a password.' });
    }

    const hash = db.hashPassword(password, user.salt);
    if (hash !== user.password_hash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// 3. User Data Sync
app.get('/api/user/sync', authenticateToken, async (req, res) => {
  try {
    const data = await db.getUserData(req.user.id);
    if (!data) return res.json({ success: true, data: { profile: {}, srsCards: {}, chatHistory: {}, bookmarks: [] } });

    res.json({
      success: true,
      data: {
        profile: data.profile || {},
        srsCards: data.srsCards || {},
        chatHistory: data.chatHistory || {},
        bookmarks: data.bookmarks || []
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Fetch data failed' });
  }
});

app.post('/api/user/sync', authenticateToken, async (req, res) => {
  const { profile, srsCards, chatHistory, bookmarks } = req.body;
  try {
    await db.updateUserData(
      req.user.id,
      profile || null,
      srsCards || null,
      chatHistory || null,
      bookmarks || null
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Sync data failed' });
  }
});

// 4. Leaderboard API
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const board = await db.getLeaderboard(limit);
    res.json({ success: true, data: board });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// 5. Daily AI Homework Generator
app.post('/api/homework/generate', authenticateToken, async (req, res) => {
  const { words } = req.body;
  if (!words || !Array.isArray(words)) return res.status(400).json({ error: 'Missing words array' });

  // Fallback if user is totally new
  let targets = words;
  if (targets.length < 5) {
    targets = ['Hallo', 'Danke', 'Bitte', 'Tschüss', 'Wasser', 'Brot', 'Kaffee'];
  }
  
  const selected = targets.sort(() => 0.5 - Math.random()).slice(0, 12).join(', ');

  const systemPrompt = `You are a German language curriculum designer. 
The user has learned these words: [${selected}]. 
Generate a Daily Homework JSON object containing:
{
  "story_de": "A 4-5 sentence short story in simple German (A1/A2) using as many of these specific words as naturally possible.",
  "story_en": "The exact English translation of the story.",
  "questions": [ // Array of exactly 3 comprehension questions
    { "q": "Question string in English", "options": ["Choice A", "Choice B", "Choice C"], "answer": "Exact string of the correct choice" }
  ],
  "roleplay_setup": "A 1-sentence description of a roleplay scenario related to the story context.",
  "roleplay_system": "The system prompt the AI should adopt for this roleplay (e.g. 'You are a baker. Be polite but strict.')"
}
Output ONLY valid JSON matching this schema exactly.`;

  try {
    const resp = await callGroq({ systemPrompt, messages: [], json: true });
    const json = await resp.json();
    const resultString = json.choices[0].message.content;
    const parsed = JSON.parse(resultString);
    res.json({ success: true, homework: parsed });
  } catch (err) {
    console.error('Homework Gen Error:', err);
    res.status(500).json({ error: 'Generation failed' });
  }
});

// ── Groq API Helper ────────────────────────────────────────────────────────
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FAST_MODEL = 'llama-3.1-8b-instant';

async function callGroq({ systemPrompt, messages, stream = false, json = false, fast = false }) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const body = {
    model: fast ? FAST_MODEL : PRIMARY_MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 1500,
    temperature: 0.7,
    stream,
  };

  if (json && !stream) {
    body.response_format = { type: 'json_object' };
  }

  const resp = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.text();
    if (resp.status === 429) throw new Error('RATE_LIMITED');
    throw new Error(`Groq API error ${resp.status}: ${err}`);
  }

  return resp;
}

// ── Route: AI Chat (streaming) ─────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  if (!checkRateLimit(req.ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const { messages = [], level = 'A1', scenario = 'casual conversation' } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  try {
    const groqResp = await callGroq({
      systemPrompt: PROMPTS.chat(level, scenario),
      messages: messages.slice(-12), // Keep last 12 messages for context
      stream: true,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');

    const reader = groqResp.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) { res.write('data: [DONE]\n\n'); break; }
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// ── Route: Grammar Corrector ───────────────────────────────────────────────
app.post('/api/correct', async (req, res) => {
  if (!checkRateLimit(req.ip)) return res.status(429).json({ error: 'Rate limited. Wait a moment.' });

  const { text = '', level = 'A1' } = req.body;
  if (!text.trim()) return res.status(400).json({ error: 'text required' });

  try {
    const groqResp = await callGroq({
      systemPrompt: PROMPTS.correct(level),
      messages: [{ role: 'user', content: `Please correct this German text: "${text}"` }],
      json: true,
    });
    const data = await groqResp.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Route: Story Generator ─────────────────────────────────────────────────
app.post('/api/story', async (req, res) => {
  if (!checkRateLimit(req.ip)) return res.status(429).json({ error: 'Rate limited. Wait a moment.' });

  const { topic = 'daily life', level = 'A1' } = req.body;

  try {
    const groqResp = await callGroq({
      systemPrompt: PROMPTS.story(level, topic),
      messages: [{ role: 'user', content: `Generate a German story about: ${topic}` }],
      json: true,
    });
    const data = await groqResp.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Route: Exercise Generator ──────────────────────────────────────────────
app.post('/api/exercises', async (req, res) => {
  if (!checkRateLimit(req.ip)) return res.status(429).json({ error: 'Rate limited. Wait a moment.' });

  const { weakAreas = 'articles, cases', level = 'A1' } = req.body;

  try {
    const groqResp = await callGroq({
      systemPrompt: PROMPTS.exercises(level, weakAreas),
      messages: [{ role: 'user', content: `Generate exercises for: ${weakAreas}` }],
      json: true,
      fast: true,
    });
    const data = await groqResp.json();
    const content = data.choices?.[0]?.message?.content || '[]';
    // The prompt asks for an array but json_object mode needs an object — unwrap if needed
    let parsed = JSON.parse(content);
    if (!Array.isArray(parsed) && parsed.exercises) parsed = parsed.exercises;
    res.json(Array.isArray(parsed) ? parsed : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Route: AI Tutor ────────────────────────────────────────────────────────
app.post('/api/tutor', async (req, res) => {
  if (!checkRateLimit(req.ip)) return res.status(429).json({ error: 'Rate limited. Wait a moment.' });

  const { question = '', level = 'A1' } = req.body;
  if (!question.trim()) return res.status(400).json({ error: 'question required' });

  try {
    const groqResp = await callGroq({
      systemPrompt: PROMPTS.tutor(level),
      messages: [{ role: 'user', content: question }],
    });
    const data = await groqResp.json();
    const content = data.choices?.[0]?.message?.content || 'Could not generate answer.';
    res.json({ answer: content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Route: Pronunciation Coach ─────────────────────────────────────────────
app.post('/api/pronunciation', async (req, res) => {
  if (!checkRateLimit(req.ip)) return res.status(429).json({ error: 'Rate limited. Wait a moment.' });

  const { spoken = '', target = '' } = req.body;
  if (!spoken || !target) return res.status(400).json({ error: 'spoken and target required' });

  try {
    const groqResp = await callGroq({
      systemPrompt: PROMPTS.pronunciation(),
      messages: [{
        role: 'user',
        content: `Target text: "${target}"\nWhat the learner said: "${spoken}"\nEvaluate their pronunciation.`
      }],
      json: true,
      fast: true,
    });
    const data = await groqResp.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    res.json(JSON.parse(content));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasKey: !!GROQ_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// ── SPA Fallback ───────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🇩🇪 DeutschMeister running → http://localhost:${PORT}`);
  if (!GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY not set — AI features will not work');
  }
});
