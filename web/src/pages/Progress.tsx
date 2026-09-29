import { useState } from 'react';
import { t, type Lang } from '../i18n';
import { SectionTitle } from '../components/ui';
import ProgressChart from '../components/ProgressChart';
import type { ProgressEntry } from './SkinLab';
import type { Page } from '../App';

function load(): ProgressEntry[] {
  try {
    return JSON.parse(localStorage.getItem('nikhar-progress') || '[]');
  } catch {
    return [];
  }
}

export default function Progress({ lang, go }: { lang: Lang; go: (p: Page) => void }) {
  const [entries, setEntries] = useState<ProgressEntry[]>(load);

  const clear = () => {
    localStorage.removeItem('nikhar-progress');
    setEntries([]);
  };

  const delta =
    entries.length >= 2 ? entries[entries.length - 1].glowScore - entries[0].glowScore : null;

  return (
    <div>
      <SectionTitle sub={t(lang, 'prog_sub')}>{t(lang, 'prog_title')}</SectionTitle>

      {entries.length === 0 ? (
        <div className="glass mx-auto max-w-md rounded-3xl p-10 text-center">
          <p className="text-4xl">🌱</p>
          <p className="mt-4 text-white/70">{t(lang, 'prog_empty')}</p>
          <button onClick={() => go('skin')} className="btn-primary mt-6 rounded-2xl px-8 py-3 text-sm">
            {t(lang, 'prog_cta')}
          </button>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">{t(lang, 'prog_trend')}</h3>
              {delta !== null && (
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    delta >= 0 ? 'bg-emerald-300/15 text-emerald-200' : 'bg-rose-300/15 text-rose-200'
                  }`}
                >
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(Math.round(delta))} pts
                </span>
              )}
            </div>
            <ProgressChart points={entries.map((e) => ({ date: e.date, score: e.glowScore }))} />
          </div>

          <div className="glass mt-4 rounded-3xl p-6 sm:p-8">
            <h3 className="font-display mb-4 text-xl font-semibold">{t(lang, 'prog_history')}</h3>
            <ul className="space-y-3">
              {[...entries].reverse().map((e, i) => (
                <li key={i} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(e.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-white/45">
                      {e.demo ? 'Demo' : 'Live'}
                      {e.skinAge != null ? ` · Skin age ${e.skinAge}` : ''}
                    </p>
                  </div>
                  <span className="font-display text-2xl font-semibold text-blush-200">{Math.round(e.glowScore)}</span>
                </li>
              ))}
            </ul>
            <button onClick={clear} className="btn-ghost mt-5 rounded-xl px-4 py-2 text-xs text-white/60">
              {t(lang, 'prog_clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
