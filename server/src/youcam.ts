/**
 * YouCam S2S API client (Perfect Corp).
 * Endpoints verified against https://docs.perfectcorp.com/reference/ai_skin_analysis.md
 * and https://github.com/YouCam-API/skills (snapshot 2026-09-01).
 *
 * SECURITY: the API key is read from process.env.YOUCAM_API_KEY only, is used
 * server-side only, and is never logged or included in any API response.
 */
const BASE = 'https://yce-api-01.makeupar.com';
const FETCH_TIMEOUT_MS = 30000;

export function isConfigured(): boolean {
  return !!(process.env.YOUCAM_API_KEY && process.env.YOUCAM_API_KEY.trim());
}

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.YOUCAM_API_KEY!.trim()}`,
    'Content-Type': 'application/json',
  };
}

function sanitize(msg: string): string {
  return msg.replace(/Bearer\s+\S+/gi, 'Bearer [redacted]');
}

/**
 * Sanitized provider logging: method, endpoint path, HTTP status, latency and
 * task id only. Never logs headers, request/response bodies, image bytes or keys.
 */
function plog(event: string, fields: Record<string, unknown>) {
  try {
    console.log(JSON.stringify({ ts: new Date().toISOString(), src: 'youcam', event, ...fields }));
  } catch {
    /* logging must never break a request */
  }
}

function taskIdOf(json: any): string | null {
  const raw = json?.data?.task_id ?? json?.task_id;
  if (typeof raw !== 'string' || !raw) return null;
  return raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || null;
}

async function reqJson(method: string, path: string, body?: unknown): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  const t0 = Date.now();
  try {
    const res = await fetch(BASE + path, {
      method,
      headers: authHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ctrl.signal,
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* non-JSON body */
    }
    plog('response', {
      method,
      path,
      httpStatus: res.status,
      latencyMs: Date.now() - t0,
      taskId: taskIdOf(json),
      bodyBytes: text.length,
    });
    if (!res.ok || (json && typeof json.status === 'number' && json.status !== 200)) {
      const msg = json?.error || json?.message || `HTTP ${res.status}`;
      throw new Error(`YouCam ${path} failed: ${msg}`);
    }
    return json?.data ?? json;
  } catch (e: any) {
    plog('error', { method, path, latencyMs: Date.now() - t0, message: sanitize(e?.message || String(e)).slice(0, 200) });
    throw new Error(sanitize(e?.message || String(e)));
  } finally {
    clearTimeout(timer);
  }
}

/** Step 1+2 of the YouCam flow: register file, then PUT bytes to the presigned URL. */
export async function uploadFile(buf: Buffer, contentType: string, fileName: string): Promise<string> {
  const meta = await reqJson('POST', '/s2s/v2.0/file', {
    files: [{ content_type: contentType, file_name: fileName, file_size: buf.length }],
  });
  const f = meta?.files?.[0];
  const fileId: string | undefined = f?.file_id;
  const up = f?.requests?.[0];
  if (!fileId || !up?.url) throw new Error('YouCam file init returned no file_id / upload URL');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  try {
    const put = await fetch(up.url, {
      method: up.method || 'PUT',
      headers: { 'Content-Type': contentType, 'Content-Length': String(buf.length), ...(up.headers || {}) },
      body: new Uint8Array(buf),
      signal: ctrl.signal,
    });
    if (!put.ok) throw new Error(`YouCam upload PUT failed: HTTP ${put.status}`);
  } catch (e: any) {
    throw new Error(sanitize(e?.message || String(e)));
  } finally {
    clearTimeout(timer);
  }
  return fileId;
}

export async function createTask(taskPath: string, body: Record<string, unknown>): Promise<string> {
  const data = await reqJson('POST', taskPath, body);
  const taskId: string | undefined = data?.task_id;
  if (!taskId) throw new Error(`YouCam ${taskPath} returned no task_id`);
  return taskId;
}

/** Poll GET {taskPath}/{taskId} until task_status === 'success' (bounded). */
export async function pollTask(
  taskPath: string,
  taskId: string,
  opts?: { intervalMs?: number; timeoutMs?: number },
): Promise<any> {
  const intervalMs = opts?.intervalMs ?? 4000;
  const timeoutMs = opts?.timeoutMs ?? 120000;
  const started = Date.now();
  const url = `${taskPath}/${encodeURIComponent(taskId)}`;
  for (;;) {
    const data = await reqJson('GET', url);
    const st = String(data?.task_status || '').toLowerCase();
    if (st === 'success') return data;
    if (st === 'error' || st === 'failed') throw new Error(`YouCam task failed (status: ${st})`);
    if (Date.now() - started > timeoutMs) throw new Error('YouCam task timed out — please try again');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export async function getBalance(): Promise<{ spendable: number; byType: Record<string, number> }> {
  const data = await reqJson('GET', '/s2s/v1.0/client/credit');
  const batches: any[] = Array.isArray(data?.results) ? data.results : [];
  const byType: Record<string, number> = {};
  let spendable = 0;
  for (const b of batches) {
    const amt = Number(b?.amount || 0);
    const type = String(b?.type || '?');
    byType[type] = (byType[type] || 0) + amt;
    if (type.startsWith('Api')) spendable += amt;
  }
  return { spendable, byType };
}

// ---------------------------------------------------------------- skin --
export interface SkinConcernScore {
  id: string;
  score: number; // 1-100, higher = healthier
}
export interface SkinAnalysis {
  glowScore: number;
  skinAge: number | null;
  concerns: SkinConcernScore[];
}

// SD concerns (docs: SD and HD dst_actions cannot be mixed in one call).
const SKIN_ACTIONS = [
  'wrinkle',
  'pore',
  'texture',
  'acne',
  'redness',
  'oiliness',
  'age_spot',
  'radiance',
  'moisture',
  'dark_circle',
  'eye_bag',
  'firmness',
];

export async function analyzeSkinLive(buf: Buffer, contentType: string): Promise<SkinAnalysis> {
  const fileId = await uploadFile(buf, contentType, `skin-${Date.now()}.jpg`);
  const taskId = await createTask('/s2s/v2.0/task/skin-analysis', {
    src_file_id: fileId,
    dst_actions: SKIN_ACTIONS,
    format: 'json',
  });
  const data = await pollTask('/s2s/v2.0/task/skin-analysis', taskId, { timeoutMs: 90000 });
  const out: any[] = data?.results?.output || [];
  const concerns: SkinConcernScore[] = [];
  for (const o of out) {
    const id = String(o?.type || '').toLowerCase();
    const score = Number(o?.ui_score ?? o?.raw_score);
    if (id && Number.isFinite(score)) {
      concerns.push({ id, score: Math.round(Math.max(1, Math.min(100, score))) });
    }
  }
  if (concerns.length === 0) throw new Error('YouCam skin analysis returned no scores');
  const all = Number(data?.results?.all);
  const glowScore = Number.isFinite(all)
    ? Math.round(Math.max(1, Math.min(100, all)))
    : Math.round(concerns.reduce((a, c) => a + c.score, 0) / concerns.length);
  const ageRaw = Number(data?.results?.skin_age ?? data?.results?.skinAge);
  const skinAge = Number.isFinite(ageRaw) ? Math.round(ageRaw) : null;
  return { glowScore, skinAge, concerns };
}

// ----------------------------------------------------------------- VTO --
export type GarmentCategory = 'full_body' | 'lower_body' | 'upper_body' | 'shoes' | 'auto' | 'outer';
export const GARMENT_CATEGORIES: GarmentCategory[] = [
  'full_body',
  'lower_body',
  'upper_body',
  'shoes',
  'auto',
  'outer',
];

export async function tryOnLive(
  person: Buffer,
  personType: string,
  garment: Buffer,
  garmentType: string,
  category: GarmentCategory,
): Promise<string> {
  const srcId = await uploadFile(person, personType, `person-${Date.now()}.jpg`);
  const refId = await uploadFile(garment, garmentType, `garment-${Date.now()}.jpg`);
  const taskId = await createTask('/s2s/v2.0/task/cloth-v4', {
    src_file_id: srcId,
    ref_file_id: refId,
    garment_category: category,
  });
  const data = await pollTask('/s2s/v2.0/task/cloth-v4', taskId, { timeoutMs: 150000, intervalMs: 5000 });
  const url: string | undefined = data?.results?.url;
  if (!url) throw new Error('YouCam try-on returned no result image URL');
  return url;
}

/**
 * Download a provider-issued result URL server-side and return bytes.
 * Only ever called with URLs returned by the YouCam API itself —
 * never with user-supplied URLs (SSRF surface stays zero).
 */
export async function downloadImage(url: string): Promise<{ buf: Buffer; contentType: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`result download failed: HTTP ${res.status}`);
    const ct = (res.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();
    const ab = await res.arrayBuffer();
    if (ab.byteLength > 15 * 1024 * 1024) throw new Error('result image too large');
    return { buf: Buffer.from(ab), contentType: ct.startsWith('image/') ? ct : 'image/jpeg' };
  } catch (e: any) {
    throw new Error(sanitize(e?.message || String(e)));
  } finally {
    clearTimeout(timer);
  }
}

// ------------------------------------------------------------ skin tone --
export interface ToneAnalysis {
  skinColor: string | null;
}

/**
 * AI Facial Color Tones Analyzer. NOTE: per the skill docs, jpg/jpeg only.
 * We report detected colors only and never invent an undertone.
 */
export async function analyzeToneLive(jpegBuf: Buffer): Promise<ToneAnalysis> {
  const fileId = await uploadFile(jpegBuf, 'image/jpeg', `tone-${Date.now()}.jpg`);
  const taskId = await createTask('/s2s/v2.0/task/skin-tone-analysis', {
    src_file_id: fileId,
    face_angle_strictness_level: 'high',
  });
  const data = await pollTask('/s2s/v2.0/task/skin-tone-analysis', taskId, { timeoutMs: 90000 });
  return { skinColor: extractSkinColor(data) };
}

/** Defensive hunt for a hex skin color in a response whose exact shape may vary. */
function extractSkinColor(data: any): string | null {
  const hexRe = /^#?[0-9a-fA-F]{6}$/;
  const seen = new Set<unknown>();
  const stack: unknown[] = [data];
  while (stack.length) {
    const cur = stack.pop();
    if (!cur || seen.has(cur)) continue;
    seen.add(cur);
    if (Array.isArray(cur)) {
      stack.push(...cur);
      continue;
    }
    if (typeof cur === 'object') {
      for (const [k, v] of Object.entries(cur as Record<string, unknown>)) {
        if (typeof v === 'string' && /skin/i.test(k) && hexRe.test(v.trim())) {
          const h = v.trim();
          return h.startsWith('#') ? h : '#' + h;
        }
        if (v && typeof v === 'object') stack.push(v);
      }
    }
  }
  return null;
}
