# Dịch nhé — Vietnamese → English translation trainer (Next.js)

A cute, light-yellow themed app that shows an AI-generated Vietnamese sentence, takes your
English translation, and scores it with feedback. Powered by Google Gemini (free tier).

## Rendering model

- `app/page.js` + `app/layout.js` are **Server Components** — they render the static shell.
- `app/TranslateTrainer.jsx` is a **Client Component** (`"use client"`) — all the interactive
  state, input, and fetch logic. This is CSR, the right choice because the content (the
  Vietnamese sentence) is generated on demand after load; there's nothing useful to pre-render.
- `app/api/score/route.js` is a **Route Handler** — server-only, holds the Gemini key.

The key (`GEMINI_API_KEY`) has no `NEXT_PUBLIC_` prefix, so Next.js never ships it to the
browser. It's only readable inside the route handler.

## 1. Get a free Gemini key

https://aistudio.google.com/apikey — no credit card. Free tier ~1,500 req/day on gemini-2.5-flash.

## 2. Install & run

```bash
npm install
echo "GEMINI_API_KEY=your_key" > .env.local
npm run dev
```

Open http://localhost:3000

## 3. Deploy

Push to GitHub, import in Vercel. Set **GEMINI_API_KEY** in the dashboard env vars. That's it.

## Notes

- `route.js` has a basic in-memory rate limit (15 req/min per IP) to deter abuse. It resets
  per serverless instance on Vercel; for real protection back it with Upstash Redis.
- Free-tier Gemini may use prompts for training; fine for practice sentences, but tell users.
- Enabling billing on a Google Cloud project removes its free tier — use a separate project
  for production if you want to keep a free sandbox. Set a spend cap once you go paid.

## Structure

```
app/
  layout.js              root layout (server)
  page.js                page shell (server)
  TranslateTrainer.jsx   the UI ("use client")
  api/score/route.js     Gemini proxy (server-only, holds the key)
```
