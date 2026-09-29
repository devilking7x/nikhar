import { useState } from 'react';
import { t, type Lang } from '../i18n';

/** Draggable before/after comparison slider (proven pattern). */
export default function CompareSlider({
  before,
  after,
  lang,
}: {
  before: string;
  after: string;
  lang: Lang;
}) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative select-none overflow-hidden rounded-3xl border border-white/15">
      <img src={after} alt={t(lang, 'tryon_after')} className="block aspect-[3/4] w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <img src={before} alt={t(lang, 'tryon_before')} className="block aspect-[3/4] w-full object-cover" draggable={false} />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)]"
        style={{ left: `${pos}%` }}
      />
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
        {t(lang, 'tryon_before')}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
        {t(lang, 'tryon_after')}
      </span>
      <input
        type="range"
        min={2}
        max={98}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="compare-range absolute inset-0 h-full w-full cursor-ew-resize"
        aria-label="Compare before and after"
      />
    </div>
  );
}
