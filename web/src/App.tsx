import { useEffect, useState } from 'react';
import { t, type Lang } from './i18n';
import { api } from './api';
import Home from './pages/Home';
import SkinLab from './pages/SkinLab';
import ShadeMatch from './pages/ShadeMatch';
import TryOn from './pages/TryOn';
import CompleteLook from './pages/CompleteLook';
import Progress from './pages/Progress';
import Lookbook from './pages/Lookbook';
import Tour from './components/Tour';

export type Page = 'home' | 'skin' | 'shade' | 'tryon' | 'look' | 'progress' | 'lookbook';

const ROUTES: Record<string, Page> = {
  '': 'home',
  '/': 'home',
  '/skin': 'skin',
  '/shade': 'shade',
  '/tryon': 'tryon',
  '/look': 'look',
  '/progress': 'progress',
  '/lookbook': 'lookbook',
};

function pageFromHash(): Page {
  const h = window.location.hash.replace(/^#/, '');
  return ROUTES[h] ?? 'home';
}

export default function App() {
  const [page, setPage] = useState<Page>(pageFromHash);
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('nikhar-lang') === 'hi' ? 'hi' : 'en'));
  const [demo, setDemo] = useState<boolean | undefined>(undefined);
  const [tour, setTour] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setPage(pageFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    localStorage.setItem('nikhar-lang', lang);
  }, [lang]);

  useEffect(() => {
    api.status().then((s) => setDemo(s.demo)).catch(() => setDemo(true));
  }, []);

  const go = (p: Page) => {
    const path = Object.keys(ROUTES).find((k) => ROUTES[k] === p) || '/';
    window.location.hash = '#' + path;
  };

  const nav: { id: Page; key: string }[] = [
    { id: 'home', key: 'nav_home' },
    { id: 'skin', key: 'nav_skin' },
    { id: 'shade', key: 'nav_shade' },
    { id: 'tryon', key: 'nav_tryon' },
    { id: 'look', key: 'nav_look' },
    { id: 'progress', key: 'nav_progress' },
    { id: 'lookbook', key: 'nav_lookbook' },
  ];

  return (
    <div className="app-bg flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#160f1c]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button onClick={() => go('home')} className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blush-400 to-violet-500 font-display text-lg font-bold text-[#1c0f16]">
              नि
            </span>
            <span className="text-left leading-tight">
              <span className="font-display block text-lg font-semibold">Nikhār AI</span>
              <span className="block text-[10px] uppercase tracking-widest text-white/40">{t(lang, 'tagline')}</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            {demo === undefined ? null : demo ? (
              <span className="hidden items-center gap-1.5 rounded-full bg-blush-300/15 px-3 py-1 text-[11px] font-medium text-blush-200 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-blush-300 pulse-soft" /> Demo
              </span>
            ) : (
              <span className="hidden items-center gap-1.5 rounded-full bg-emerald-300/15 px-3 py-1 text-[11px] font-medium text-emerald-200 sm:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Live
              </span>
            )}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="btn-ghost rounded-xl px-3 py-1.5 text-xs font-semibold"
              aria-label="Toggle language"
            >
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl overflow-x-auto px-4 pb-2">
          <div className="flex gap-1.5">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-medium transition ${
                  page === n.id
                    ? 'bg-gradient-to-r from-blush-400/90 to-violet-500/90 text-[#1c0f16]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t(lang, n.key)}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {page === 'home' && <Home lang={lang} demo={demo} go={go} onTour={() => setTour(true)} />}
        {page === 'skin' && <SkinLab lang={lang} demo={demo} />}
        {page === 'shade' && <ShadeMatch lang={lang} demo={demo} />}
        {page === 'tryon' && <TryOn lang={lang} demo={demo} />}
        {page === 'look' && <CompleteLook lang={lang} demo={demo} />}
        {page === 'progress' && <Progress lang={lang} go={go} />}
        {page === 'lookbook' && <Lookbook lang={lang} go={go} />}
      </main>
      {tour && <Tour lang={lang} go={go} onDone={() => setTour(false)} />}

      <footer className="border-t border-white/10 px-4 py-6">
        <div className="mx-auto max-w-6xl text-center text-xs text-white/40">
          <p className="font-display text-sm text-white/60">Nikhār AI</p>
          <p className="mx-auto mt-1 max-w-2xl">{t(lang, 'home_disclaimer')}</p>
          <p className="mt-2 text-white/30">MIT · github.com/devilking7x/nikhar</p>
        </div>
      </footer>
    </div>
  );
}
