import { t, type Lang } from '../i18n';
import { DemoBadge } from '../components/ui';
import type { Page } from '../App';

const FEATURES = [
  { icon: '✨', t: 'home_f1t', d: 'home_f1d', go: 'skin' as Page },
  { icon: '🎨', t: 'home_f2t', d: 'home_f2d', go: 'shade' as Page },
  { icon: '👗', t: 'home_f3t', d: 'home_f3d', go: 'tryon' as Page },
  { icon: '💫', t: 'home_f4t', d: 'home_f4d', go: 'look' as Page },
];

export default function Home({ lang, demo, go }: { lang: Lang; demo: boolean | undefined; go: (p: Page) => void }) {
  return (
    <div>
      {/* hero */}
      <section className="fade-up py-8 text-center sm:py-14">
        <p className="mb-4 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest text-white/60">
          {t(lang, 'home_kicker')}
        </p>
        <h1 className="font-display mx-auto max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
          {t(lang, 'home_hero_a')}
          <br />
          <span className="grad-text">{t(lang, 'home_hero_b')}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/65">{t(lang, 'home_hero_sub')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => go('skin')} className="btn-primary rounded-2xl px-8 py-3.5 text-sm">
            {t(lang, 'home_cta_skin')}
          </button>
          <button onClick={() => go('look')} className="btn-ghost rounded-2xl px-8 py-3.5 text-sm">
            {t(lang, 'home_cta_look')}
          </button>
        </div>
        <div className="mt-6 flex justify-center">
          <DemoBadge demo={demo} lang={lang} />
        </div>
      </section>

      {/* features */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <button
            key={f.t}
            onClick={() => go(f.go)}
            className="glass fade-up rounded-3xl p-6 text-left transition hover:-translate-y-1"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span className="text-3xl">{f.icon}</span>
            <h3 className="mt-3 font-semibold">{t(lang, f.t)}</h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/55">{t(lang, f.d)}</p>
          </button>
        ))}
      </section>

      {/* how it works */}
      <section className="mt-14">
        <h2 className="font-display mb-6 text-center text-3xl font-semibold">{t(lang, 'home_how_t')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass rounded-3xl p-6">
              <h3 className="grad-text font-display text-xl font-semibold">{t(lang, `home_how_${n}t`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{t(lang, `home_how_${n}d`)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
