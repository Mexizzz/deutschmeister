# 🇩🇪 DeutschMeister — Learn German with AI

A **free, ad-free, gamified German learning app** powered by Groq AI (llama-3.3-70b). Built as a Single Page Application with a secure Node.js/Express backend proxy.

## ✨ Features

- 🎓 **Structured Learning Path** — A1 → A2 → B1 with certification tests
- 📚 **12 Vocabulary Lessons** — 150+ words with SRS spaced repetition
- 🧠 **Smart Review** — AI picks the words you're most likely to forget
- 🤖 **5 AI Tools** — Chat, Grammar Correction, Stories, Tutor, Pronunciation Coach
- 🎤 **Pronunciation** — Real-time speech recognition with word-by-word feedback
- 🏆 **Gamification** — XP, streaks, hearts, 30 levels, 15+ achievements
- 📅 **Word of the Day** — Daily rotating vocabulary
- 📖 **Vocabulary Browser** — Search & bookmark 150+ words
- 🔒 **Secure** — API key never exposed to the client

## 🚀 Deploy to Railway (1-click)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Select this repository
4. Add environment variable: `GROQ_API_KEY` = your key from [console.groq.com](https://console.groq.com)
5. Railway auto-deploys — your app is live! 🎉

## 🛠 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
echo "GROQ_API_KEY=your_key_here" > .env

# 3. Start the server
npm start
# → http://localhost:3000
```

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Get free at [console.groq.com](https://console.groq.com) |
| `PORT` | ❌ Optional | Defaults to 3000 (Railway sets this automatically) |

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML / CSS / JavaScript (SPA) |
| Backend | Node.js + Express |
| AI | Groq API (llama-3.3-70b-versatile) |
| TTS | Web Speech API (browser-native) |
| Storage | localStorage (zero database cost) |
| Deployment | Railway |

## 📁 Project Structure

```
deutschmeister/
├── server.js          # Express backend + Groq API proxy
├── package.json
├── .env               # (local only, never committed)
└── public/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── app.js           # SPA router
        ├── storage.js       # localStorage abstraction
        ├── gamification.js  # XP, levels, achievements
        ├── srs.js           # Spaced repetition (SM-2)
        ├── speech.js        # TTS + speech recognition
        ├── ai.js            # Groq API client
        ├── data/            # Vocabulary, grammar, phrases
        └── screens/         # All screen components
```

## 📄 License

MIT — free to use, modify, and deploy.
