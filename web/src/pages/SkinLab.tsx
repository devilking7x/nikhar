import { useState } from 'react';
import { api, type SkinResult } from '../api';
import { t, type Lang } from '../i18n';
import { concernMeta, buildRoutine } from '../data';
import { DemoBadge, SectionTitle, ErrorBox, StageProgress, Gauge, ScoreBar } from '../components/ui';
import CameraCapture from '../components/CameraCapture';
import { renderGlowReport, shareOrDownload } from '../components/GlowReport';

export interface ProgressEntry {
  date: string;
  glowScore: number;
  skinAge: number | null;
  demo: boolean;
}

export function saveProgressEntry(e: ProgressEntry) {
  const raw = localStorage.getItem('nikhar-progress');
  const arr: ProgressEntry[] = raw ? JSON.parse(raw) : [];
  arr.push(e);
  localStorage.setItem('nikhar-progress', JSON.stringify(arr.slice(-60)));
}

export default function SkinLab({ lang, demo }: { lang: Lang; demo: boolean | undefined }) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<'capture' | 'loading' | 'result'>('capture');
  const [stage, setStage] = useState({ text: '', index: 0, total: 1 });
  const [result, setResult] = useState<SkinResult | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const onCapture = (f: File) => {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const analyze = async () => {
    if (!photo) return;
    setPhase('loading');
    setError('');
    setSaved(false);
    try {
      const job = await api.skin(photo, (s, i, stages) => setStage({ text: s, index: i, total: stages.length }));
      setResult(job.result as SkinResult);
      setPhase('result');
    } catch (e: any) {
      setError(e?.message || t(lang, 'c_error'));
      setPhase('capture');
    }
  };

  const reset = () => {
    setPhoto(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setPhase('capture');
    setSaved(false);
  };

  const handleSave = () => {
    if (!result) return;
    saveProgressEntry({ date: new Date().toISOString(), glowScore: result.glowScore, skinAge: result.skinAge, demo: result.demo });
    setSaved(true);
  };

  const handleShare = async () => {
    if (!result) return;
    const blob = await renderGlowReport({
      glowScore: result.glowScore,
      skinAge: result.skinAge,
      concerns: result.concerns.map((c) => ({ label: concernMeta(c.id, lang).label, score: c.score })),
      date: result.analyzedAt,
      demo: result.demo,
      lang,
    });
    await shareOrDownload(blob, 'nikhar-glow-report.png', 'Nikhār AI Glow Report');
  };

  const handleDownload = async () => {
    if (!result) return;
    const blob = await renderGlowReport({
      glowScore: result.glowScore,
      skinAge: result.skinAge,
      concerns: result.concerns.map((c) => ({ label: concernMeta(c.id, lang).label, score: c.score })),
      date: result.analyzedAt,
      demo: result.demo,
      lang,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nikhar-glow-report.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  const sorted = result ? [...result.concerns].sort((a, b) => a.score - b.score) : [];
  const routine = result ? buildRoutine(result.concerns, lang) : { am: [], pm: [] };

  return (
    <div>
      <SectionTitle sub={t(lang, 'skin_sub')}>{t(lang, 'skin_title')}</SectionTitle>
      <div className="mb-6 flex justify-center">
        <DemoBadge demo={demo ?? result?.demo} lang={lang} />
      </div>

      {phase === 'capture' && (
        <div className="glass mx-auto max-w-xl rounded-3xl p-6 sm:p-8">
          {!preview ? (
            <CameraCapture lang={lang} onCapture={onCapture} />
          ) : (
            <div className="fade-up text-center">
              <img src={preview} alt="Selfie preview" className="mx-auto aspect-square w-full max-w-sm rounded-3xl border border-white/15 object-cover" />
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button onClick={analyze} className="btn-primary rounded-2xl px-8 py-3 text-sm">
                  {t(lang, 'skin_analyze')}
                </button>
                <button onClick={reset} className="btn-ghost rounded-2xl px-6 py-3 text-sm">
                  {t(lang, 'skin_retake')}
                </button>
              </div>
            </div>
          )}
          {error && <div className="mt-4"><ErrorBox message={error} lang={lang} /></div>}
        </div>
      )}

      {phase === 'loading' && (
        <div className="mx-auto max-w-xl">
          <StageProgress stage={stage.text} index={stage.index} total={stage.total} lang={lang} />
        </div>
      )}

      {phase === 'result' && result && (
        <div className="fade-up mx-auto max-w-3xl">
          <div className="mb-4 flex justify-center">
            <DemoBadge demo={result.demo} lang={lang} />
          </div>

          {/* headline scores */}
          <div className="glass flex flex-col items-center gap-6 rounded-3xl p-6 sm:flex-row sm:justify-center sm:gap-12 sm:p-8">
            <Gauge value={result.glowScore} label={t(lang, 'skin_glow')} size={150} />
            <div className="text-center sm:text-left">
              <p className="text-xs uppercase tracking-widest text-white/45">{t(lang, 'skin_age_t')}</p>
              <p className="font-display mt-1 text-5xl font-semibold">
                {result.skinAge != null ? result.skinAge : '—'}
              </p>
              <p className="mt-1 text-xs text-white/45">{t(lang, 'skin_age_d')}</p>
            </div>
          </div>

          {/* concerns */}
          <div className="glass mt-4 rounded-3xl p-6 sm:p-8">
            <h3 className="font-display mb-1 text-xl font-semibold">{t(lang, 'skin_concerns')}</h3>
            <p className="mb-5 text-xs text-white/40">{t(lang, 'skin_derived')}</p>
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {sorted.map((c) => (
                <div key={c.id}>
                  <ScoreBar label={concernMeta(c.id, lang).label} value={c.score} />
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{concernMeta(c.id, lang).tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* routine */}
          <div className="glass mt-4 rounded-3xl p-6 sm:p-8">
            <h3 className="font-display mb-5 text-xl font-semibold">{t(lang, 'skin_routine')}</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blush-200">☀️ {t(lang, 'skin_am')}</p>
                <ol className="space-y-2.5">
                  {routine.am.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/75">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blush-300/15 text-xs font-bold text-blush-200">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-200">🌙 {t(lang, 'skin_pm')}</p>
                <ol className="space-y-2.5">
                  {routine.pm.map((s, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/75">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-300/15 text-xs font-bold text-violet-200">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={handleSave} disabled={saved} className="btn-primary rounded-2xl px-6 py-3 text-sm">
              {saved ? t(lang, 'skin_saved') : t(lang, 'skin_save')}
            </button>
            <button onClick={handleShare} className="btn-ghost rounded-2xl px-6 py-3 text-sm">
              {t(lang, 'skin_report')}
            </button>
            <button onClick={handleDownload} className="btn-ghost rounded-2xl px-6 py-3 text-sm">
              {t(lang, 'skin_download')}
            </button>
            <button onClick={reset} className="btn-ghost rounded-2xl px-6 py-3 text-sm">
              {t(lang, 'skin_new')}
            </button>
          </div>

          <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-white/35">
            {t(lang, 'home_disclaimer')}
          </p>
        </div>
      )}
    </div>
  );
}
