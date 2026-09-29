/** Renders the shareable Glow Report as a PNG on canvas. */
import { t, type Lang } from '../i18n';

export interface ReportInput {
  glowScore: number;
  skinAge: number | null;
  concerns: { label: string; score: number }[];
  date: string;
  demo: boolean;
  lang: Lang;
}

function bar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, label: string, v: number) {
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '600 26px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x, y + 22);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.fillText(String(Math.round(v)), x + w, y + 22);
  const by = y + 34;
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.roundRect(x, by, w, 14, 7);
  ctx.fill();
  const col = v >= 80 ? '#6ee7b7' : v >= 60 ? '#f7b9d0' : '#fb7185';
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.roundRect(x, by, (w * Math.min(100, Math.max(1, v))) / 100, 14, 7);
  ctx.fill();
  ctx.textAlign = 'left';
}

export async function renderGlowReport(inp: ReportInput): Promise<Blob> {
  const W = 1080;
  const H = 1500;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#2b1732');
  bg.addColorStop(0.5, '#1c1122');
  bg.addColorStop(1, '#120b17');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // soft glows
  const glow = (x: number, y: number, r: number, c: string) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  glow(220, 200, 320, 'rgba(167,139,250,0.25)');
  glow(880, 420, 300, 'rgba(244,114,182,0.20)');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f7b9d0';
  ctx.font = '700 64px Georgia, serif';
  ctx.fillText('Nikhār AI', W / 2, 130);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '500 30px Outfit, sans-serif';
  ctx.fillText(t(inp.lang, 'tagline') + ' · ' + new Date(inp.date).toLocaleDateString(), W / 2, 180);

  // glow score ring
  const cx = W / 2;
  const cy = 400;
  const R = 130;
  ctx.lineWidth = 30;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  const v = Math.min(100, Math.max(1, Math.round(inp.glowScore)));
  const col = v >= 80 ? '#6ee7b7' : v >= 60 ? '#f7b9d0' : '#fb7185';
  ctx.strokeStyle = col;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * v) / 100);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = '800 92px Outfit, sans-serif';
  ctx.fillText(String(v), cx, cy + 30);
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '600 30px Outfit, sans-serif';
  ctx.fillText(t(inp.lang, 'skin_glow'), cx, cy + 78);

  // skin age
  if (inp.skinAge != null) {
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 260, 600, 520, 90, 20);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '600 32px Outfit, sans-serif';
    ctx.fillText(`${t(inp.lang, 'skin_age_t')}: ${inp.skinAge}`, W / 2, 656);
  }

  // concerns
  let y = 780;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.font = '700 36px Outfit, sans-serif';
  ctx.fillText(t(inp.lang, 'skin_concerns'), 90, y);
  y += 30;
  for (const c of inp.concerns.slice(0, 6)) {
    bar(ctx, 90, y, W - 180, c.label, c.score);
    y += 92;
  }

  // footer
  const fy = H - 170;
  ctx.textAlign = 'center';
  ctx.fillStyle = inp.demo ? '#f7b9d0' : '#6ee7b7';
  ctx.font = '600 28px Outfit, sans-serif';
  ctx.fillText(inp.demo ? 'DEMO PREVIEW' : 'LIVE ANALYSIS', W / 2, fy);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '400 24px Outfit, sans-serif';
  ctx.fillText(t(inp.lang, 'home_disclaimer'), W / 2, fy + 44, W - 160);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('render failed'))), 'image/png');
  });
}

/** Web Share API with graceful download fallback. Returns 'shared' | 'downloaded'. */
export async function shareOrDownload(blob: Blob, filename: string, title: string): Promise<'shared' | 'downloaded'> {
  const file = new File([blob], filename, { type: blob.type || 'image/png' });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return 'shared';
    }
  } catch {
    /* user cancelled or share failed — fall through to download */
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}

/** Downscale an image data-URL so lookbook entries stay small in localStorage. */
export function downscaleDataUrl(dataUrl: string, maxDim = 768): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/** Fetch a same-origin image URL and return a downscaled data-URL. */
export async function urlToDataUrl(url: string, maxDim = 768): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  const raw = await new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.readAsDataURL(blob);
  });
  return downscaleDataUrl(raw, maxDim);
}
