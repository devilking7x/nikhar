import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  isConfigured,
  analyzeSkinLive,
  tryOnLive,
  downloadImage,
  analyzeToneLive,
  getBalance,
  GARMENT_CATEGORIES,
  type GarmentCategory,
  type SkinAnalysis,
} from './youcam.js';
import { DEMO_SKIN, DEMO_TONE_COLOR, DEMO_VTO } from './demo.js';
import { GARMENTS, OCCASIONS, type Garment, type Occasion } from './catalog.js';
import { GARMENT_DIR } from './config.js';

const MAX_MB = 8;
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG or WebP images are allowed'));
  },
});

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Sniff real image magic bytes — mimetype alone can lie (e.g. renamed .txt). */
function sniffImage(buf: Buffer): 'jpeg' | 'png' | 'webp' | null {
  if (buf.length > 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'jpeg';
  if (buf.length > 3 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return 'png';
  if (
    buf.length > 11 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  )
    return 'webp';
  return null;
}

const invalidImage = { error: 'That file is not a valid image — please upload a real JPG, PNG or WebP photo.' };

// ---------------------------------------------------------------- jobs --
export interface Job {
  id: string;
  kind: 'skin' | 'vto' | 'look' | 'tone';
  status: 'processing' | 'done' | 'error';
  stage: string;
  stageIndex: number;
  stages: string[];
  demo: boolean;
  result?: unknown;
  error?: string;
  createdAt: number;
}

const jobs = new Map<string, Job>();
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [id, j] of jobs) if (j.createdAt < cutoff) jobs.delete(id);
}, 5 * 60 * 1000).unref();

function newJob(kind: Job['kind'], stages: string[], demo: boolean): Job {
  const job: Job = {
    id: randomUUID(),
    kind,
    status: 'processing',
    stage: stages[0],
    stageIndex: 0,
    stages,
    demo,
    createdAt: Date.now(),
  };
  jobs.set(job.id, job);
  return job;
}

function setStage(job: Job, i: number) {
  job.stageIndex = i;
  job.stage = job.stages[i];
}

function toDataUrl(buf: Buffer, ct: string): string {
  return `data:${ct};base64,${buf.toString('base64')}`;
}

const CONCERN_LABELS: Record<string, string> = {
  radiance: 'Radiance',
  pore: 'Pores',
  texture: 'Texture',
  acne: 'Acne',
  redness: 'Redness',
  oiliness: 'Oiliness',
  age_spot: 'Dark spots',
  moisture: 'Hydration',
  dark_circle: 'Dark circles',
  eye_bag: 'Eye bags',
  wrinkle: 'Fine lines',
  firmness: 'Firmness',
};
const concernLabel = (id: string) => CONCERN_LABELS[id] || id.replace(/_/g, ' ');

// ------------------------------------------------------------- stylist --
export interface StylistStep {
  title: string;
  detail: string;
}

export interface StylistBrief {
  steps: StylistStep[];
  garment: Garment;
  occasion: Occasion;
  focus: string;
  verdict: string;
}

function buildStylistBrief(skin: SkinAnalysis, occasionId: string): StylistBrief {
  const occ = OCCASIONS.find((o) => o.id === occasionId) ?? OCCASIONS[0];
  const garment = GARMENTS.find((g) => g.id === occ.garmentId) ?? GARMENTS[0];
  const sorted = [...skin.concerns].sort((a, b) => a.score - b.score);
  const weak = sorted.slice(0, 2);
  const weakText = weak.map((w) => `${concernLabel(w.id)} (${w.score}/100)`).join(' and ');
  const focus =
    weak[0].score < 70
      ? `boosting ${concernLabel(weak[0].id).toLowerCase()} for a healthier glow`
      : 'keeping your natural glow while dressing for the moment';

  const steps: StylistStep[] = [
    {
      title: 'Skin analysis complete',
      detail: `Scored your skin across ${skin.concerns.length} concerns — priority areas: ${weakText}.`,
    },
    {
      title: `Occasion: ${occ.name}`,
      detail: `Going for ${occ.palette}, with ${occ.note}.`,
    },
    {
      title: `Stylist pick: ${garment.name}`,
      detail: `Compared ${GARMENTS.length} catalog pieces for silhouette and palette — selected the ${garment.name.toLowerCase()} (${garment.category.replace('_', ' ')}).`,
    },
    {
      title: 'Virtual try-on rendered',
      detail: 'Your AI try-on is ready below — drag the slider to compare before and after.',
    },
  ];
  const verdict =
    `For ${occ.name.toLowerCase()}, the ${garment.name.toLowerCase()} is my pick: ` +
    `its ${occ.palette} ${weak[0].score < 70 ? `draw attention upward and flatter skin working on ${concernLabel(weak[0].id).toLowerCase()}` : 'complement your healthy glow'}, ` +
    `and the ${occ.note} fits the moment. Cosmetic guidance only — wear what makes you feel radiant.`;
  return { steps, garment, occasion: occ, focus, verdict };
}

// ---------------------------------------------------------------- routes --
export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'nikhar', ts: new Date().toISOString() });
});

apiRouter.get('/garments', (_req, res) => {
  res.json({ garments: GARMENTS, occasions: OCCASIONS });
});

/** Never leaks the key — only reports configured/demo + spendable balance. */
apiRouter.get('/youcam/status', async (_req, res) => {
  if (!isConfigured()) return res.json({ configured: false, demo: true, balance: null });
  try {
    const b = await getBalance();
    res.json({ configured: true, demo: false, balance: b.spendable });
  } catch {
    // Key set but unreachable/invalid — stay honest, fall back to demo.
    res.json({
      configured: true,
      demo: true,
      balance: null,
      balanceError: 'YouCam is unreachable right now — running in demo mode.',
    });
  }
});

apiRouter.post('/jobs/skin', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'A photo is required (JPG, PNG or WebP, max 8MB).' });
  if (!sniffImage(req.file.buffer)) return res.status(400).json(invalidImage);
  const demo = !isConfigured();
  const job = newJob('skin', ['Uploading photo', 'Analysing skin', 'Preparing results'], demo);
  res.status(202).json({ jobId: job.id });
  void runSkinJob(job, req.file.buffer, req.file.mimetype);
});

apiRouter.post('/jobs/vto', upload.fields([{ name: 'person', maxCount: 1 }, { name: 'garment', maxCount: 1 }]), (req, res) => {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  const person = files?.person?.[0];
  const garment = files?.garment?.[0];
  const category = String(req.body?.category || 'auto');
  if (!person || !garment)
    return res.status(400).json({ error: 'Both a person photo and a garment photo are required.' });
  if (!(GARMENT_CATEGORIES as string[]).includes(category))
    return res.status(400).json({ error: `Invalid category. Use one of: ${GARMENT_CATEGORIES.join(', ')}` });
  if (!sniffImage(person.buffer) || !sniffImage(garment.buffer))
    return res.status(400).json(invalidImage);
  const garmentId = String(req.body?.garmentId || '');
  const demo = !isConfigured();
  const job = newJob('vto', ['Uploading photos', 'Trying on outfit', 'Preparing result'], demo);
  res.status(202).json({ jobId: job.id });
  void runVtoJob(job, person.buffer, person.mimetype, garment.buffer, garment.mimetype, category as GarmentCategory, garmentId);
});

apiRouter.post('/jobs/look', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'A photo is required (JPG, PNG or WebP, max 8MB).' });
  const occasion = String(req.body?.occasion || 'casual');
  if (!OCCASIONS.some((o) => o.id === occasion))
    return res.status(400).json({ error: `Invalid occasion. Use one of: ${OCCASIONS.map((o) => o.id).join(', ')}` });
  if (!sniffImage(req.file.buffer)) return res.status(400).json(invalidImage);
  const demo = !isConfigured();
  const job = newJob('look', ['Analysing skin', 'Styling your look', 'Rendering try-on', 'Final verdict'], demo);
  res.status(202).json({ jobId: job.id });
  void runLookJob(job, req.file.buffer, req.file.mimetype, occasion);
});

apiRouter.post('/jobs/tone', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'A photo is required (JPG, PNG or WebP, max 8MB).' });
  const live = isConfigured();
  if (live && req.file.mimetype !== 'image/jpeg')
    return res
      .status(400)
      .json({ error: 'Skin tone analysis needs a JPG photo — please upload a .jpg/.jpeg selfie.' });
  if (!sniffImage(req.file.buffer)) return res.status(400).json(invalidImage);
  const job = newJob('tone', ['Uploading photo', 'Reading color tones'], !live);
  res.status(202).json({ jobId: job.id });
  void runToneJob(job, req.file.buffer);
});

apiRouter.get('/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found or expired.' });
  const { id, kind, status, stage, stageIndex, stages, demo, result, error } = job;
  res.json({ id, kind, status, stage, stageIndex, stages, demo, result, error });
});

// ---------------------------------------------------------------- runners --
async function runSkinJob(job: Job, buf: Buffer, mime: string) {
  try {
    setStage(job, 1);
    let analysis: SkinAnalysis;
    if (job.demo) {
      await delay(2200);
      analysis = DEMO_SKIN;
    } else {
      analysis = await analyzeSkinLive(buf, mime);
    }
    setStage(job, 2);
    job.status = 'done';
    job.result = { demo: job.demo, analyzedAt: new Date().toISOString(), ...analysis };
  } catch (e: any) {
    job.status = 'error';
    job.error = e?.message || 'Skin analysis failed';
  }
}

async function runVtoJob(
  job: Job,
  person: Buffer,
  personMime: string,
  garment: Buffer,
  garmentMime: string,
  category: GarmentCategory,
  garmentId: string,
) {
  try {
    setStage(job, 1);
    let imageUrl: string | null;
    let note: string;
    if (job.demo) {
      await delay(2200);
      imageUrl = DEMO_VTO[garmentId] || null;
      note = imageUrl
        ? 'Demo preview — AI-generated sample render. Connect a YouCam API key for live try-on.'
        : 'Demo preview — connect a YouCam API key for a live AI try-on of this garment.';
    } else {
      const url = await tryOnLive(person, personMime, garment, garmentMime, category);
      const dl = await downloadImage(url);
      imageUrl = toDataUrl(dl.buf, dl.contentType);
      note = 'AI-generated try-on for reference only — actual fit and appearance may vary.';
    }
    setStage(job, 2);
    job.status = 'done';
    job.result = { demo: job.demo, imageUrl, note };
  } catch (e: any) {
    job.status = 'error';
    job.error = e?.message || 'Virtual try-on failed';
  }
}

async function runLookJob(job: Job, buf: Buffer, mime: string, occasion: string) {
  try {
    let skin: SkinAnalysis;
    if (job.demo) {
      await delay(2000);
      skin = DEMO_SKIN;
    } else {
      skin = await analyzeSkinLive(buf, mime);
    }
    setStage(job, 1);
    const brief = buildStylistBrief(skin, occasion);
    await delay(1200);
    setStage(job, 2);
    let imageUrl: string | null;
    let note: string;
    if (job.demo) {
      await delay(1800);
      imageUrl = DEMO_VTO[brief.garment.id] || null;
      note = imageUrl
        ? 'Demo preview — AI-generated sample render. Connect a YouCam API key for live try-on.'
        : 'Demo preview — connect a YouCam API key for a live AI try-on of this look.';
    } else {
      const gPath = path.join(GARMENT_DIR, brief.garment.file);
      const garmentBuf = fs.readFileSync(gPath);
      const url = await tryOnLive(buf, mime, garmentBuf, 'image/jpeg', brief.garment.category);
      const dl = await downloadImage(url);
      imageUrl = toDataUrl(dl.buf, dl.contentType);
      note = 'AI-generated try-on for reference only — actual fit and appearance may vary.';
    }
    setStage(job, 3);
    job.status = 'done';
    job.result = {
      demo: job.demo,
      occasion: brief.occasion,
      analyzedAt: new Date().toISOString(),
      skin: { glowScore: skin.glowScore, skinAge: skin.skinAge, concerns: skin.concerns },
      garment: brief.garment,
      steps: brief.steps,
      verdict: brief.verdict,
      image: imageUrl,
      note,
    };
  } catch (e: any) {
    job.status = 'error';
    job.error = e?.message || 'Complete look failed';
  }
}

async function runToneJob(job: Job, buf: Buffer) {
  try {
    setStage(job, 1);
    let skinColor: string | null;
    if (job.demo) {
      await delay(1800);
      skinColor = DEMO_TONE_COLOR;
    } else {
      const live = await analyzeToneLive(buf);
      skinColor = live.skinColor;
    }
    job.status = 'done';
    job.result = {
      demo: job.demo,
      skinColor,
      note: skinColor
        ? 'AI-detected skin tone for reference only — lighting affects accuracy.'
        : 'Could not detect a skin tone from this photo — try a front-facing selfie in daylight.',
    };
  } catch (e: any) {
    job.status = 'error';
    job.error = e?.message || 'Tone analysis failed';
  }
}
