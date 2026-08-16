# Nebula

An AI-powered image editor with a browser-based canvas editing experience — upload an image, apply edits, and export the result.

> Built for [Hackathon Name] — submission-ready core flow: sign in → upload → edit → export.

---

## ✨ Features

### Core (working)
- **Image upload** — renders directly on canvas for editing
- **Core editing tools** *(list the 2–3 tools you kept — e.g. Brightness/Contrast, Crop, Filter)*
- **Undo / Redo**
- **Export** — downloads a flattened image reflecting all applied edits

### Known Issues (see below)
- **Google Sign-In** — currently unavailable in this build
- **AI features (Gemini / remove.bg)** — currently unavailable in this build

> Features outside the core list above may be disabled or marked **"Coming soon"** in this build due to time constraints.

---

## 🧱 Tech Stack

- **Framework:** Next.js
- **Auth & Backend:** Supabase
- **AI:** Google Gemini API, remove.bg API
- **Styling:** Dark / glassmorphism UI
- **Deployment:** Vercel

*(Update this section to match your actual stack.)*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- A Supabase project (URL + anon key)
- A Gemini API key
- A remove.bg API key (optional — feature degrades gracefully without it)

### Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd nebula

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# then fill in the values below in .env.local
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `GEMINI_API_KEY` | No* | Enables AI editing features (server-side only) |
| `REMOVE_BG_API_KEY` | No* | Enables background removal |

\* Missing AI keys will not crash the app — the related feature will show as "not configured" instead.

> ⚠️ Never commit `.env.local`. It is already listed in `.gitignore`.

### Run locally

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Production build test

```bash
npm run build && npm run start
```

---

## 🗺️ Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in with Google |
| `/auth/callback` | OAuth callback handler |
| `/editor` | Main editing workspace (auth required) |

---

## 🧪 User Flow (demo path)

1. Land on `/` → go to `/editor`
2. Upload an image
3. Apply 2–3 edits using the left tool panel
4. Export → download reflects all applied edits

> Sign-in is currently disabled in this build (see Known Limitations).

---

## ⚠️ Known Limitations

- **Sign-in is currently unavailable** in this build — app is usable without authentication for demo purposes.
- **AI features (Gemini, remove.bg) are currently unavailable** in this build.
- Some left-panel tools are disabled ("Coming soon") due to time constraints.

---

## 🔒 Security Notes

- API keys are read only from environment variables — never hardcoded.
- AI API calls are made server-side so keys are never exposed to the client bundle.
- `.env.local` is git-ignored; `.env.example` documents required variables without real values.

---

## 📄 License

*(Add your license here, e.g. MIT)*
