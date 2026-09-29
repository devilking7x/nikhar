/** Judge Quick Tour — a guided 60-second walkthrough for hackathon judges.
 *  Auto-advances through the app's key pages with a spotlight caption card.
 *  Zero friction: no clicks needed, Skippable anytime. */
import { useEffect, useState } from 'react';
import { t, type Lang } from '../i18n';
import type { Page } from '../App';

interface TourStep {
  page: Page;
  titleKey: string;
  descKey: string;
}

const STEPS: TourStep[] = [
  { page: 'skin', titleKey: 'tour_1t', descKey: 'tour_1d' },
  { page: 'shade', titleKey: 'tour_2t', descKey: 'tour_2d' },
  { page: 'tryon', titleKey: 'tour_3t', descKey: 'tour_3d' },
  { page: 'look', titleKey: 'tour_4t', descKey: 'tour_4d' },
  { page: 'progress', titleKey: 'tour_5t', descKey: 'tour_5d' },
];

const STEP_MS = 9000;

export default function Tour({ lang, go, onDone }: { lang: Lang; go: (p: Page) => void; onDone: () => void }) {
  const [i, setI] = useState(0);
  const finished = i >= STEPS.length;

  useEffect(() => {
    if (finished) return;
    go(STEPS[i].page);
    const id = window.setTimeout(() => setI((v) => v + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [i, finished, go]);

  useEffect(() => {
    if (finished) {
      go('home');
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  if (finished) return null;
  const s = STEPS[i];

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-5">
      <div className="glass fade-up mx-auto max-w-xl rounded-3xl border-blush-300/30 p-5 shadow-2xl">
        <div className="mb-3 flex gap-1.5">
          {STEPS.map((_, d) => (
            <span
              key={d}
              className={`h-1.5 flex-1 rounded-full ${d <= i ? 'bg-gradient-to-r from-blush-400 to-violet-500' : 'bg-white/15'}`}
            />
          ))}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-blush-200">
          {t(lang, 'tour_btn')} · {i + 1}/{STEPS.length}
        </p>
        <h3 className="font-display mt-1 text-lg font-semibold">{t(lang, s.titleKey)}</h3>
        <p className="mt-1 text-sm leading-relaxed text-white/65">{t(lang, s.descKey)}</p>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={() => { go('home'); onDone(); }} className="btn-ghost rounded-xl px-4 py-2 text-xs">
            {t(lang, 'tour_skip')}
          </button>
          <div className="flex gap-2">
            {i > 0 && (
              <button onClick={() => setI(i - 1)} className="btn-ghost rounded-xl px-4 py-2 text-xs">
                {t(lang, 'tour_back')}
              </button>
            )}
            <button onClick={() => setI(i + 1)} className="btn-primary rounded-xl px-5 py-2 text-xs">
              {t(lang, 'tour_next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
