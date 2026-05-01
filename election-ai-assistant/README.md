# ElectionAI — Smart Election Assistant

A production-ready AI assistant for election education, built with **React + Vite**, powered by **Claude (Anthropic)**, and integrated with **Google Calendar, Maps, and YouTube**.

---

## Features

| Feature | Details |
|---|---|
| 🤖 Smart AI chat | Context-aware responses via Claude Sonnet with streaming |
| 📅 Google Calendar | Add election reminders directly to user's calendar |
| 🗺️ Google Maps | Find polling stations near the user's location |
| 📺 YouTube | Search civic education videos from within the chat |
| 🧠 Dynamic context | System prompt adapts to user name, location, and Google state |
| 💬 Streaming | Real-time token-by-token AI response rendering |
| 🌙 Dark mode | Automatic via `prefers-color-scheme` |
| 📱 Responsive | Works on desktop, tablet, and mobile |

---

## Project Structure

```
election-ai-assistant/
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx        # Main chat UI with streaming
│   │   ├── Sidebar.jsx           # Google services + quick topics
│   │   ├── ActionBar.jsx         # Contextual Google action buttons
│   │   ├── MarkdownMessage.jsx   # Safe markdown renderer
│   │   └── YouTubePanel.jsx      # Floating YouTube results panel
│   ├── hooks/
│   │   ├── useChat.js            # Chat state machine + streaming
│   │   ├── useGoogleServices.js  # Calendar, Maps, YouTube state
│   │   └── useUserContext.js     # Persistent user context
│   ├── services/
│   │   ├── anthropicService.js   # Claude API + context-aware prompt builder
│   │   └── googleService.js      # Google Calendar, Maps, YouTube APIs
│   ├── styles/
│   │   └── global.css            # CSS variables + base styles
│   ├── App.jsx                   # Root component — wires everything
│   └── main.jsx                  # Entry point
├── index.html
├── vite.config.js
├── package.json
├── .env.example                  # Copy to .env and fill in API keys
└── .gitignore
```

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/election-ai-assistant.git
cd election-ai-assistant
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_GOOGLE_API_KEY=AIza...
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

### 3. Run the dev server

```bash
npm run dev
```


---

## API Key Setup

### Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Add to `.env` as `VITE_ANTHROPIC_API_KEY`

> ⚠️ **Security note**: The Anthropic API is called directly from the browser for demo purposes. For production, proxy the API through your own backend to protect the key.

### Google APIs
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project and enable these APIs:
   - **Google Calendar API** (for calendar events)
   - **Maps JavaScript API** + **Places API** (for polling station search)
   - **YouTube Data API v3** (for video search)
   - **Geocoding API** (for address to coordinates)
3. Create an **API Key** → add as `VITE_GOOGLE_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY`
4. Create an **OAuth 2.0 Client ID** (Web application):
   - Authorized origins: `http://localhost:3000`
   - Add as `VITE_GOOGLE_CLIENT_ID`

---

## How It Works

### Smart context system
The AI system prompt is rebuilt on every message, incorporating:
- User's name (if provided)
- User's location (for local election context)
- Google Calendar connection status

### ACTION: protocol
When the AI detects an opportunity for a Google service, it appends a structured tag:
```
ACTION:[CALENDAR] Add "Election Day" reminder
ACTION:[MAPS] Find polling stations near you
ACTION:[YOUTUBE] Search: how voting works explained
```
The `ActionBar` component renders these as clickable buttons that trigger the appropriate Google service.

### Google Calendar flow
1. User clicks a CALENDAR action
2. If not connected → Google OAuth popup → token stored
3. Event created via Google Calendar REST API with 1-day + 1-hour reminders

---

## Build for Production

```bash
npm run build
```

Output is in `dist/`. Deploy to Vercel, Netlify, GitHub Pages, etc.

For Vercel:
```bash
npm i -g vercel
vercel --prod
```

---

## Tech Stack

- **React 18** + **Vite 5** — fast dev and build
- **Claude Sonnet** (Anthropic) — AI backbone with streaming
- **Google Identity Services** — OAuth 2.0 for Calendar
- **Google Calendar REST API** — event creation
- **Google Maps Places API** — polling station lookup
- **YouTube Data API v3** — civic education videos
- **react-markdown** — safe markdown rendering
- **lucide-react** — icon set

---

## License

MIT
