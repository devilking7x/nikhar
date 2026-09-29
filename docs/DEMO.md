# Nikhār AI — Demo Guide (for judges)

Everything below works **with no API key** in demo mode. Every demo screen shows a
"Demo preview" badge and every mock payload carries `demo: true` — nothing is
presented as a live YouCam analysis.

## 0. Start

```bash
npm install --prefix server && npm install --prefix web
npm --prefix web run build
npm --prefix server run start   # http://localhost:8080
```

The header shows a pulsing **Demo** badge; `/api/youcam/status` returns
`{"configured": false, "demo": true, "balance": null}`.

## 1. Skin Lab (60 seconds)

1. Open **Skin Lab** → **Use camera** (or **Upload selfie**).
2. The live preview shows a **face-oval guide**; hit **Capture (3s)** — auto-capture with countdown.
3. Watch staged progress: *Uploading photo → Analysing skin → Preparing results*.
4. Result: **glow score gauge**, **skin-age card**, 12 concern bars sorted weakest-first
   with plain-language tips, and a rule-based **AM/PM routine**.
5. **Save to progress**, then **Download report** — a branded PNG glow report with a
   `DEMO PREVIEW` footer.

## 2. Shade Matcher

1. Answer the 3-question **undertone quiz** (veins / jewellery / sun) → Warm / Cool / Neutral.
2. See foundation **shade families** + example matches (labeled illustrative).
3. **Detect tone from selfie** → AI-detected color swatch with hex.

## 3. Try-On Studio

1. Add your photo, pick the **Rose Satin Dress** or **Maroon Kurta** from the catalog
   (these two have demo preview renders — marked with a Demo chip).
2. **Try it on** → staged progress → **before/after drag slider**.

## 4. Complete Look (the signature flow)

1. Pick an occasion (e.g. **Party**), add your photo, hit **Style my look**.
2. Watch the transparent journey: skin read → **visible stylist reasoning steps**
   (why this occasion, why this garment) → try-on render → **stylist verdict**.
3. **Save to lookbook**.

## 5. Progress & Lookbook

- **Progress**: re-run Skin Lab and save — the **trend chart** and history update (localStorage).
- **Lookbook**: saved looks with share (Web Share API) / download / delete.
- Toggle **हिन्दी / English** in the header — the entire UI switches.

## 6. Going live

Set `YOUCAM_API_KEY` in the environment (Render dashboard for deploys) and restart:
the badge flips to **Live**, and jobs call the real YouCam Skin Analysis, cloth-v4
VTO and skin-tone endpoints. The key never reaches the browser or the repo —
verify with a bundle grep: `grep -r YOUCAM_API_KEY web/dist` returns nothing.

## Talking points

- **Two YouCam products, one journey** — skin analysis *drives* the stylist's garment choice.
- **Transparent agentic reasoning** — every step is shown, not hidden.
- **Honest demo mode** — judges can evaluate the full UX without a key; nothing is faked.
- **India-first** — Hindi UI, festive/wedding occasions, kurta + lehenga in the catalog.
- **Installable PWA**, offline-tolerant app shell, API never cached.
