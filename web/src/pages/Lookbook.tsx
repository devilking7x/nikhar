import { useState } from 'react';
import { t, type Lang } from '../i18n';
import { SectionTitle, ErrorBox } from '../components/ui';
import { shareOrDownload } from '../components/GlowReport';
import type { LookEntry } from './CompleteLook';
import type { Page } from '../App';

function load(): LookEntry[] {
  try {
    return JSON.parse(localStorage.getItem('nikhar-lookbook') || '[]');
  } catch {
    return [];
  }
}

export default function Lookbook({ lang, go }: { lang: Lang; go: (p: Page) => void }) {
  const [looks, setLooks] = useState<LookEntry[]>(load);
  const [error, setError] = useState('');

  const remove = (id: string) => {
    const next = looks.filter((l) => l.id !== id);
    setLooks(next);
    localStorage.setItem('nikhar-lookbook', JSON.stringify(next));
  };

  const share = async (l: LookEntry) => {
    try {
      const blob = await (await fetch(l.image)).blob();
      await shareOrDownload(blob, `nikhar-look-${l.occasion}.jpg`, 'Nikhār AI Look');
    } catch {
      setError(t(lang, 'c_error'));
    }
  };

  const download = async (l: LookEntry) => {
    const a = document.createElement('a');
    a.href = l.image;
    a.download = `nikhar-look-${l.occasion}.jpg`;
    a.click();
  };

  return (
    <div>
      <SectionTitle sub={t(lang, 'book_sub')}>{t(lang, 'book_title')}</SectionTitle>

      {looks.length === 0 ? (
        <div className="glass mx-auto max-w-md rounded-3xl p-10 text-center">
          <p className="text-4xl">💫</p>
          <p className="mt-4 text-white/70">{t(lang, 'book_empty')}</p>
          <button onClick={() => go('look')} className="btn-primary mt-6 rounded-2xl px-8 py-3 text-sm">
            {t(lang, 'book_cta')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((l) => (
            <div key={l.id} className="glass fade-up overflow-hidden rounded-3xl">
              <img src={l.image} alt={l.occasionName} className="aspect-[3/4] w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{l.occasionName}</p>
                  <span className="rounded-full bg-white/8 px-2.5 py-0.5 text-[11px] text-white/55">
                    {l.demo ? 'Demo' : 'Live'}
                    {l.glowScore != null ? ` · ✦${Math.round(l.glowScore)}` : ''}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/55">{l.verdict}</p>
                <p className="mt-1 text-[11px] text-white/35">
                  {new Date(l.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => share(l)} className="btn-ghost flex-1 rounded-xl px-3 py-2 text-xs">
                    {t(lang, 'book_share')}
                  </button>
                  <button onClick={() => download(l)} className="btn-ghost flex-1 rounded-xl px-3 py-2 text-xs">
                    {t(lang, 'c_download')}
                  </button>
                  <button onClick={() => remove(l.id)} className="flex-1 rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs text-rose-200">
                    {t(lang, 'book_delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <div className="mx-auto mt-4 max-w-md"><ErrorBox message={error} lang={lang} /></div>}
    </div>
  );
}
