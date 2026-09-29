import { useEffect, useState } from 'react';
import { api, type Occasion } from '../api';
import { t, type Lang } from '../i18n';
import { FALLBACK_OCCASIONS, PACKS } from '../data';
import { DemoBadge, SectionTitle, ErrorBox, StageProgress, Gauge } from '../components/ui';
import CameraCapture from '../components/CameraCapture';
import CompareSlider from '../components/CompareSlider';
import { downscaleDataUrl } from '../components/GlowReport';

const PACK_IDS = ['diwali', 'shaadi', 'office-ethnic', 'college'];
const PACK_EMOJI: Record<string, string> = { diwali: '🪔', shaadi: '💒', 'office-ethnic': '💼', college: '🎒' };

export interface LookEntry {
  id: string;
  date: string;
  occasion: string;
  occasionName: string;
  image: string; // downscaled data URL
  verdict: string;
  demo: boolean;
  glowScore: number | null;
}

interface LookResult {
  skin: { demo: boolean; glowScore: number; skinAge: number | null; concerns: { id: string; score: number }[] };
  garment: { id: string; name: string; file: string; category: string };
  occasion: Occasion;
  steps: { title: string; detail: string }[];
  verdict: string;
  image: string | null;
  demo: boolean;
}

export default function CompleteLook({ lang, demo }: { lang: Lang; demo: boolean | undefined }) {
  const [occasions, setOccasions] = useState<Occasion[]>(FALLBACK_OCCASIONS as Occasion[]);
  const [occasionId, setOccasionId] = useState('party');
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<'input' | 'loading' | 'result'>('input');
  const [stage, setStage] = useState({ text: '', index: 0, total: 1 });
  const [result, setResult] = useState<LookResult | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.catalog().then((c) => {
      if (c.occasions?.length) setOccasions(c.occasions);
    }).catch(() => {});
  }, []);

  const onCapture = (f: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const start = async () => {
    if (!photo) return;
    setPhase('loading');
    setError('');
    setSaved(false);
    try {
      const job = await api.look(photo, occasionId, (s, i, stages) => setStage({ text: s, index: i, total: stages.length }));
      setResult(job.result as LookResult);
      setPhase('result');
    } catch (e: any) {
      setError(e?.message || t(lang, 'c_error'));
      setPhase('input');
    }
  };

  const save = async () => {
    if (!result?.image) return;
    const raw = localStorage.getItem('nikhar-lookbook');
    const arr: LookEntry[] = raw ? JSON.parse(raw) : [];
    try {
      arr.unshift({
        id: `${Date.now()}`,
        date: new Date().toISOString(),
        occasion: result.occasion.id,
        occasionName: result.occasion.name,
        image: await downscaleDataUrl(result.image),
        verdict: result.verdict,
        demo: result.demo,
        glowScore: result.skin.glowScore,
      });
      localStorage.setItem('nikhar-lookbook', JSON.stringify(arr.slice(0, 30)));
      setSaved(true);
    } catch {
      setError('Lookbook is full — delete an old look first.');
    }
  };

  const reset = () => {
    setPhase('input');
    setResult(null);
    setSaved(false);
    setPhoto(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const weakest = result ? [...result.skin.concerns].sort((a, b) => a.score - b.score).slice(0, 3) : [];
  const activePack = PACKS[occasionId]?.[lang];
  const baseOccasions = occasions.filter((o) => !PACK_IDS.includes(o.id));

  return (
    <div>
      <SectionTitle sub={t(lang, 'look_sub')}>{t(lang, 'look_title')}</SectionTitle>
      <div className="mb-6 flex justify-center">
        <DemoBadge demo={demo ?? result?.demo} lang={lang} />
      </div>

      {phase === 'input' && (
        <div className="mx-auto max-w-xl">
          {/* curated indian look packs */}
          <div className="mb-4">
            <h3 className="font-display mb-1 text-xl font-semibold">{t(lang, 'pack_title')}</h3>
            <p className="mb-4 text-xs text-white/45">{t(lang, 'pack_sub')}</p>
            <div className="grid grid-cols-2 gap-3">
              {PACK_IDS.map((pid) => {
                const p = PACKS[pid]?.[lang];
                if (!p) return null;
                const active = occasionId === pid;
                return (
                  <button
                    key={pid}
                    onClick={() => setOccasionId(pid)}
                    className={`rounded-3xl border-2 p-4 text-left transition ${
                      active
                        ? 'border-blush-300 bg-blush-300/10'
                        : 'glass border-transparent hover:border-white/20'
                    }`}
                  >
                    <span className="text-2xl">{PACK_EMOJI[pid]}</span>
                    <p className="mt-2 text-sm font-semibold">{p.tagline}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-white/50">{p.styling[0]}</p>
                  </button>
                );
              })}
            </div>
            {activePack && (
              <div className="glass fade-up mt-3 rounded-3xl border-blush-300/25 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blush-200">{t(lang, 'pack_styling')}</p>
                    <ul className="space-y-1.5">
                      {activePack.styling.map((s, i) => (
                        <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-white/70">
                          <span className="text-blush-300">✦</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-200">{t(lang, 'pack_prep')}</p>
                    <ul className="space-y-1.5">
                      {activePack.prep.map((s, i) => (
                        <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-white/70">
                          <span className="text-violet-300">✦</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass mb-4 rounded-3xl p-6">
            <h3 className="mb-4 font-semibold">{t(lang, 'look_occasion')}</h3>
            <div className="flex flex-wrap gap-2">
              {baseOccasions.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOccasionId(o.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm transition ${
                    occasionId === o.id
                      ? 'bg-gradient-to-r from-blush-400 to-violet-500 font-semibold text-[#1c0f16]'
                      : 'btn-ghost'
                  }`}
                >
                  {o.name}
                </button>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            {!preview ? (
              <CameraCapture lang={lang} onCapture={onCapture} />
            ) : (
              <div className="text-center">
                <img src={preview} alt="You" className="mx-auto aspect-square w-full max-w-xs rounded-3xl border border-white/15 object-cover" />
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <button onClick={start} className="btn-primary rounded-2xl px-8 py-3 text-sm">
                    {t(lang, 'look_btn')}
                  </button>
                  <button onClick={() => { setPhoto(null); if (preview) URL.revokeObjectURL(preview); setPreview(null); }} className="btn-ghost rounded-2xl px-5 py-3 text-sm">
                    {t(lang, 'skin_retake')}
                  </button>
                </div>
              </div>
            )}
          </div>
          {error && <div className="mt-4"><ErrorBox message={error} lang={lang} /></div>}
        </div>
      )}

      {phase === 'loading' && (
        <div className="mx-auto max-w-xl">
          <StageProgress stage={stage.text} index={stage.index} total={stage.total} lang={lang} />
        </div>
      )}

      {phase === 'result' && result && (
        <div className="fade-up mx-auto max-w-2xl">
          <div className="mb-4 flex justify-center">
            <DemoBadge demo={result.demo} lang={lang} />
          </div>

          {/* step 1: skin read */}
          <div className="glass step-in rounded-3xl p-6" style={{ animationDelay: '0ms' }}>
            <div className="flex items-center gap-5">
              <Gauge value={result.skin.glowScore} label={t(lang, 'skin_glow')} size={110} />
              <div className="text-sm text-white/70">
                <p className="font-semibold text-white">{result.steps[0]?.title}</p>
                <p className="mt-1 leading-relaxed">{result.steps[0]?.detail}</p>
                <div className="mt-2 flex gap-2">
                  {weakest.map((c) => (
                    <span key={c.id} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">
                      {c.id.replace(/_/g, ' ')} · {Math.round(c.score)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* steps 2..n: reasoning */}
          <div className="glass step-in mt-4 rounded-3xl p-6" style={{ animationDelay: '350ms' }}>
            <h3 className="font-display mb-4 text-lg font-semibold">{t(lang, 'look_stylist')}</h3>
            <ol className="space-y-4">
              {result.steps.slice(1).map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-400/20 text-xs font-bold text-violet-200">
                    {i + 2}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-white/60">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* try-on result */}
          {result.image && preview && (
            <div className="step-in mt-4" style={{ animationDelay: '700ms' }}>
              <CompareSlider before={preview} after={result.image} lang={lang} />
            </div>
          )}

          {/* verdict */}
          <div className="glass step-in mt-4 rounded-3xl border-blush-300/25 p-6" style={{ animationDelay: '1000ms' }}>
            <h3 className="font-display grad-text mb-2 text-xl font-semibold">{t(lang, 'look_verdict')}</h3>
            <p className="text-[15px] leading-relaxed text-white/80">{result.verdict}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {result.image && (
                <button onClick={save} disabled={saved} className="btn-primary rounded-2xl px-6 py-3 text-sm">
                  {saved ? t(lang, 'look_saved') : t(lang, 'look_save')}
                </button>
              )}
              <button onClick={reset} className="btn-ghost rounded-2xl px-6 py-3 text-sm">
                {t(lang, 'look_new')}
              </button>
            </div>
            {error && <div className="mt-3"><ErrorBox message={error} lang={lang} /></div>}
          </div>
        </div>
      )}
    </div>
  );
}
