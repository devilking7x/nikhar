import { useState } from 'react';
import { api } from '../api';
import { t, type Lang } from '../i18n';
import { SHADES, quizUndertone, type Undertone } from '../data';
import { DemoBadge, SectionTitle, ErrorBox, Spinner } from '../components/ui';

const QUESTIONS = [1, 2, 3];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function ShadeMatch({ lang, demo }: { lang: Lang; demo: boolean | undefined }) {
  const [answers, setAnswers] = useState<number[]>([]);
  const [tone, setTone] = useState<{ hex: string; rgb: [number, number, number]; demo: boolean } | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');

  const undertone: Undertone | null = answers.length === 3 ? quizUndertone(answers) : null;
  const group = undertone ? SHADES.find((g) => g.undertone === undertone)! : null;

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setDetecting(true);
    setError('');
    try {
      const job = await api.tone(f);
      const hex = job.result?.skinColor as string | null;
      if (!hex) {
        setError(job.result?.note || t(lang, 'c_error'));
        return;
      }
      setTone({ hex, rgb: hexToRgb(hex), demo: job.demo });
    } catch (err: any) {
      setError(err?.message || t(lang, 'c_error'));
    } finally {
      setDetecting(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <SectionTitle sub={t(lang, 'shade_sub')}>{t(lang, 'shade_title')}</SectionTitle>
      <div className="mb-6 flex justify-center">
        <DemoBadge demo={demo ?? tone?.demo} lang={lang} />
      </div>

      {/* quiz */}
      <div className="mx-auto max-w-2xl">
        {QUESTIONS.map((q, qi) => (
          <div key={q} className="glass mb-4 rounded-3xl p-6">
            <p className="mb-4 font-medium">{t(lang, `shade_q${q}`)}</p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const next = [...answers];
                    next[qi] = opt;
                    setAnswers(next);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm transition ${
                    answers[qi] === opt
                      ? 'bg-gradient-to-r from-blush-400 to-violet-500 font-semibold text-[#1c0f16]'
                      : 'btn-ghost'
                  }`}
                >
                  {t(lang, `shade_q${q}${['a', 'b', 'c'][opt]}`)}
                </button>
              ))}
            </div>
          </div>
        ))}

        {undertone && group && (
          <div className="glass fade-up rounded-3xl p-6 sm:p-8">
            <p className="text-xs uppercase tracking-widest text-white/45">{t(lang, 'shade_you_are')}</p>
            <h3 className="font-display grad-text mt-1 text-4xl font-semibold">
              {t(lang, `shade_${undertone}`)}
            </h3>
            <p className="mt-2 text-sm text-white/60">{t(lang, `shade_${undertone}_d`)}</p>

            {tone && (
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                <span
                  className="h-14 w-14 shrink-0 rounded-2xl border border-white/20"
                  style={{ background: tone.hex }}
                />
                <div>
                  <p className="text-sm font-medium">{t(lang, 'shade_detected')}</p>
                  <p className="text-xs text-white/50">{tone.hex} · RGB {tone.rgb.join(', ')}</p>
                </div>
              </div>
            )}

            <h4 className="mt-6 font-semibold">{t(lang, 'shade_shades')}</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.shades.map((s) => (
                <span key={s} className="rounded-full border border-blush-300/30 bg-blush-300/10 px-4 py-1.5 text-sm">
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-white/40">
              {t(lang, 'shade_examples')}: {group.examples[0]}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-white/40">{t(lang, 'shade_note')}</p>

            <button onClick={() => { setAnswers([]); setTone(null); }} className="btn-ghost mt-5 rounded-2xl px-5 py-2.5 text-sm">
              {t(lang, 'shade_restart')}
            </button>
          </div>
        )}

        {/* AI tone detect */}
        <div className="glass mt-4 rounded-3xl p-6 text-center">
          <label className="btn-primary inline-block cursor-pointer rounded-2xl px-6 py-3 text-sm">
            {detecting ? t(lang, 'shade_detecting') : t(lang, 'shade_detect')}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} disabled={detecting} />
          </label>
          {detecting && <Spinner />}
          {error && <div className="mt-3"><ErrorBox message={error} lang={lang} /></div>}
        </div>
      </div>
    </div>
  );
}
