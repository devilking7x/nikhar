# Nikhār AI — Glow, styled by AI ✨

![Nikhār AI hero](docs/hero.jpg)

**Nikhār AI** unifies **YouCam Skin Analysis** and **generative Apparel Virtual Try-On** in one guided, bilingual (Hindi/English) journey: scan your skin → get your glow score, skin age, AM/PM routine and foundation shade matches → pick an occasion and watch the AI stylist render a complete try-on look on you.

Built for the **YouCam API Skin AI & Apparel VTO Hackathon 2026**.

> **Honesty first:** without a `YOUCAM_API_KEY`, the app runs in a clearly-labeled **demo mode** — every mock response carries `demo: true` and the UI shows a "Demo preview" badge. No fake metrics are ever presented as real analysis.

## Features

| Area | What it does |
|---|---|
| **Skin Lab** | Guided live camera (face-oval overlay, 3s auto-capture) or upload → 12-concern YouCam analysis, glow score gauge, skin-age card, per-concern tips, rule-based AM/PM routine. **Tap any concern → ingredient education card** (what it is, what helps, what to avoid) |
| **Shade Matcher** | Undertone quiz + AI skin-tone detection (JPG) → foundation shade families with example matches → **rule-based color recommendations**: catalog pieces sorted by your undertone's color-temperature |
| **Try-On Studio** | Your photo + catalog garment (6 AI-generated pieces) or your own upload → before/after drag slider. **All 6 garments have demo renders**, clearly labeled |
| **Complete Look** | One transparent flow: skin scan → occasion → visible stylist reasoning steps → VTO render → verdict. **Indian look packs**: Diwali Glow, Shaadi Season, Office Ethnic, College Casual — each with styling notes + skin-prep tips |
| **⚡ 60-Second Tour** | Judge quick tour on the homepage — guided auto walkthrough of every key page, skippable anytime |
| **Progress** | Glow-score trend chart + scan history in localStorage |
| **Lookbook** | Save styled looks locally; share/download |
| **Glow Report** | Downloadable/shareable PNG report (Web Share API with download fallback) |
| **PWA** | Installable; app-shell caching only — `/api/*` always bypasses cache |
| **i18n** | Full Hindi/English UI toggle |

Cosmetic insights only — never a medical diagnosis.

## Quickstart

```bash
# 1. install
npm install --prefix server && npm install --prefix web

# 2. build the frontend (served by Express)
npm --prefix web run build

# 3. run (demo mode — no key needed)
npm --prefix server run start
# → http://localhost:8080
```

### Live YouCam mode

```bash
export YOUCAM_API_KEY="your-key-here"   # server-side only, never in the repo
npm --prefix server run start
```

The key is read from `process.env.YOUCAM_API_KEY` and never leaves the server. `/api/youcam/status` reports only `configured/demo/balance` — the key is never exposed.

### Deploy on Render

`render.yaml` defines one web service (`npm install` → build web → start server). Set `YOUCAM_API_KEY` in the Render dashboard (never commit it).

## API (server)

All YouCam traffic stays server-side; the browser only talks to these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | liveness |
| GET | `/api/youcam/status` | key configured? demo? balance (no key leaked) |
| GET | `/api/garments` | catalog + occasions |
| POST | `/api/jobs/skin` | skin analysis job (multipart `photo`) |
| POST | `/api/jobs/vto` | try-on job (`person`, `garment`, `category`, `garmentId`) |
| POST | `/api/jobs/look` | complete-look job (`photo`, `occasion`) |
| POST | `/api/jobs/tone` | skin-tone job (JPG only in live mode) |
| GET | `/api/jobs/:id` | poll job (`processing` → `done` / `error`) |

Jobs are async with bounded polling and stage labels; uploads are limited to 8MB (JPG/PNG/WebP), with per-IP rate limiting.

## YouCam integration notes

- Base `https://yce-api-01.makeupar.com`, `Authorization: Bearer <key>`
- Flow: `POST /s2s/v2.0/file` → PUT bytes to presigned URL → `POST /s2s/v2.0/task/<skin-analysis|cloth-v4|skin-tone-analysis>` → bounded poll
- VTO garment categories: `upper_body`, `full_body`, `lower_body`, `auto`, `outer`, `shoes`
- Skin-tone: JPG/JPEG only; the app reports the detected color and describes undertone matches as rule-based estimates, never as YouCam output
- Provider calls emit sanitized JSON log lines (method, path, HTTP status, latency, task id) — no headers, bodies, keys or image bytes

## Project layout

```
nikhar/
├── server/          # Express + TypeScript API (YouCam client, jobs, catalog)
├── web/             # React + Vite + Tailwind SPA
│   ├── src/pages/   # Home, SkinLab, ShadeMatch, TryOn, CompleteLook, Progress, Lookbook
│   └── public/garments/  # AI-generated sample garment + demo renders
├── docs/DEMO.md     # judge demo script
└── render.yaml
```

## License

MIT — see [LICENSE](LICENSE).
