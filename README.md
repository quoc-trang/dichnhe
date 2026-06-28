# Dịch nhé — Vietnamese → English translation trainer (Next.js)

An App that shows an AI-generated Vietnamese sentence,
takes your English translation, and scores it with feedback. Built with Next.js
App Router and deployed on Google Cloud Run.

🌐 Live: https://dichnhe-895490522576.asia-southeast1.run.app/

## AI: Groq + GPT OSS 20B

This app uses **Groq** as the LLM provider, running the open-weight
**GPT OSS 20B** model (`openai/gpt-oss-20b`).

### Why Groq?

- **Fastest inference on the planet** — Groq designed custom chips called LPUs
  (Language Processing Units) specifically for LLM inference. GPT OSS 20B is
  served with low latency on Groq, which matters for an interactive translation
  grader where users wait on generated prompts and feedback.
- **Recommended replacement model** — Groq recommends GPT OSS 20B for workloads
  moving off deprecated Llama 3.1 8B Instant usage.
- **OpenAI-compatible API** — easy to wire up, no extra SDK required.
- **Open-weight model** — GPT OSS weights are available outside Groq too; there
  is no vendor lock-in beyond the API gateway.

### What is Groq, exactly?

Groq is an inference company, not a model lab — they don't train LLMs. Instead,
they host open and proprietary models (GPT OSS, Llama family, DeepSeek, Qwen, Whisper, etc.) on
their custom LPU hardware and expose them via API. Founded by Jonathan Ross,
former Google TPU designer.

### Provider switch

The route handler (`app/api/score/route.js`) supports two providers, switchable
via the `LLM_PROVIDER` env var:

| Provider | Model | Cost |
|---|---|---|
| `groq` (default) | `openai/gpt-oss-20b` | Recommended Groq replacement for Llama 3.1 8B Instant |
| `anthropic` | `claude-haiku-4-5` | Pay-as-you-go (~$0.0003/grading) |

Both providers return JSON conforming to the same schema, so the frontend
doesn't care which one is active. Useful if Groq is down or rate-limits hit —
add `LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` to fail over.

## Rendering model

- `app/page.js` + `app/layout.js` — **Server Components** that render the
  static shell.
- `app/TranslateTrainer.jsx` — **Client Component** (`"use client"`) — thin
  orchestrator. Composes the smaller UI pieces in `app/trainer/`.
- `app/api/score/route.js` — **Route Handler**, server-only, holds the API keys.

The API key (`GROQ_API_KEY` or `ANTHROPIC_API_KEY`) has no `NEXT_PUBLIC_`
prefix, so Next.js never ships it to the browser. It's only readable inside
the route handler.

## 1. Get a free Groq key

1. Go to https://console.groq.com — no credit card required.
2. **API Keys** → **Create API Key** → copy the value (starts with `gsk_...`).

## 2. Install & run

```bash
npm install
echo "GROQ_API_KEY=gsk_xxxxx" > .env.local
npm run dev
```

Open http://localhost:3000

To use Anthropic Claude instead:

```bash
echo "LLM_PROVIDER=anthropic" >> .env.local
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" >> .env.local
```

## 3. Deploy to Google Cloud Run

This app deploys as a Docker container to Cloud Run. The repo includes:

- `Dockerfile` — multi-stage build using Next.js `output: 'standalone'`
- `cloudbuild.yaml` — Cloud Build pipeline (build → push → deploy)

### Manual deploy

```bash
export PROJECT_ID=$(gcloud config get-value project)
export IMAGE_URL=asia-southeast1-docker.pkg.dev/$PROJECT_ID/dichnhe/dichnhe:v1

docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
  -t $IMAGE_URL --push .

gcloud run services update dichnhe \
  --region=asia-southeast1 \
  --image=$IMAGE_URL
```

### Automatic deploy (CI/CD)

Push to `main` triggers Cloud Build, which builds the image, pushes to Artifact
Registry, and deploys to Cloud Run. Average end-to-end: ~3-5 minutes.

The trigger uses an **ignored files filter** so doc-only or repo-housekeeping
changes don't burn build minutes:

```
README.md
**/*.md
.gitignore
LICENSE
.github/**
```

Anything outside this list (code, `package.json`, `Dockerfile`,
`cloudbuild.yaml`, etc.) still triggers a full build → push → deploy. If you
add a new doc file or housekeeping path, add it to the filter on the trigger
config: **Cloud Build → Triggers → deploy-on-push-main → Ignored files filter**.

### Secrets

`GROQ_API_KEY` is stored in **Google Secret Manager** (not in the image or env
file). Cloud Run mounts it as an env var at runtime via:

```bash
--set-secrets=GROQ_API_KEY=groq-api-key:latest
```

The Cloud Run runtime service account needs the `Secret Manager Secret
Accessor` role on the secret.

## Notes

- The route handler has a basic in-memory rate limit (15 req/min per IP) to
  deter abuse. It resets per container instance on Cloud Run; for real
  protection back it with Upstash Redis or Cloud Memorystore.
- Groq free-tier requests may be used to improve their service. Fine for a
  practice app, but tell users if you handle anything sensitive.
- GPT OSS 20B is text-only in this app — no image input. If you ever need
  vision, switch to a multimodal provider (Gemini, GPT-4o, Claude).
- Cloud Run cold starts add ~2-3s on the first request after idle. Set
  `--min-instances=1` to keep one instance warm (~$3-5/month).

## Structure

```
app/
├── layout.js                root layout (server)
├── page.js                  page shell (server)
├── icon.svg                 favicon 🐤
├── TranslateTrainer.jsx     thin orchestrator ("use client")
├── trainer/
│   ├── useTrainer.js        state + API hook
│   ├── api.js               fetch helper
│   ├── constants.js         difficulties + topics
│   ├── styles.js            inline styles + helpers
│   ├── Header.jsx           brand + streak counter
│   ├── Controls.jsx         difficulty pills + topic select
│   ├── PromptCard.jsx       Vietnamese sentence display
│   ├── AnswerForm.jsx       textarea + action buttons
│   └── ResultCard.jsx       score + feedback display
└── api/score/route.js       provider-switchable LLM proxy (server-only)

Dockerfile                   multi-stage Next.js standalone build
cloudbuild.yaml              CI/CD pipeline for Cloud Run
next.config.js               output: 'standalone' for Docker
```
