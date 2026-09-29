import { useEffect, useState } from 'react';
import { api, type Garment } from '../api';
import { t, type Lang } from '../i18n';
import { FALLBACK_GARMENTS } from '../data';
import { DemoBadge, SectionTitle, ErrorBox, StageProgress } from '../components/ui';
import CameraCapture from '../components/CameraCapture';
import CompareSlider from '../components/CompareSlider';

const DEMO_PREVIEW_IDS = ['tshirt-blush', 'jacket-indigo', 'blazer-lavender', 'kurta-maroon', 'dress-rose', 'lehenga-emerald'];

export default function TryOn({ lang, demo }: { lang: Lang; demo: boolean | undefined }) {
  const [catalog, setCatalog] = useState<Garment[]>(FALLBACK_GARMENTS as Garment[]);
  const [tab, setTab] = useState<'catalog' | 'custom'>('catalog');
  const [person, setPerson] = useState<File | null>(null);
  const [personUrl, setPersonUrl] = useState<string | null>(null);
  const [garmentId, setGarmentId] = useState<string>('dress-rose');
  const [customGarment, setCustomGarment] = useState<File | null>(null);
  const [customUrl, setCustomUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('full_body');
  const [phase, setPhase] = useState<'idle' | 'loading' | 'result'>('idle');
  const [stage, setStage] = useState({ text: '', index: 0, total: 1 });
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultDemo, setResultDemo] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.catalog().then((c) => {
      if (c.garments?.length) setCatalog(c.garments);
    }).catch(() => {});
  }, []);

  const onPerson = (f: File) => {
    if (personUrl) URL.revokeObjectURL(personUrl);
    setPerson(f);
    setPersonUrl(URL.createObjectURL(f));
  };

  const onCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (customUrl) URL.revokeObjectURL(customUrl);
    setCustomGarment(f);
    setCustomUrl(URL.createObjectURL(f));
    e.target.value = '';
  };

  const pickGarment = (id: string) => {
    setGarmentId(id);
    const g = catalog.find((x) => x.id === id);
    if (g) setCategory(g.category);
  };

  const canTry = person && (tab === 'custom' ? customGarment : garmentId);

  const tryOn = async () => {
    if (!canTry || !person) return;
    setPhase('loading');
    setError('');
    try {
      let garmentFile: File | Blob;
      let gid = garmentId;
      if (tab === 'custom' && customGarment) {
        garmentFile = customGarment;
        gid = 'custom-upload';
      } else {
        const g = catalog.find((x) => x.id === garmentId)!;
        const res = await fetch(`/garments/${g.file}`);
        garmentFile = await res.blob();
      }
      const job = await api.vto(person, garmentFile, category, gid, (s, i, stages) =>
        setStage({ text: s, index: i, total: stages.length }),
      );
      setResultUrl(job.result.imageUrl as string);
      setResultDemo(job.demo);
      setPhase('result');
    } catch (e: any) {
      setError(e?.message || t(lang, 'c_error'));
      setPhase('idle');
    }
  };

  const reset = () => {
    setPhase('idle');
    setResultUrl(null);
    setError('');
  };

  return (
    <div>
      <SectionTitle sub={t(lang, 'tryon_sub')}>{t(lang, 'tryon_title')}</SectionTitle>
      <div className="mb-6 flex justify-center">
        <DemoBadge demo={demo ?? resultDemo} lang={lang} />
      </div>

      {phase !== 'result' && (
        <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-2">
          {/* person */}
          <div className="glass rounded-3xl p-6">
            <h3 className="mb-4 font-semibold">{t(lang, 'tryon_person')}</h3>
            {personUrl ? (
              <div className="text-center">
                <img src={personUrl} alt="You" className="mx-auto aspect-[3/4] max-h-72 rounded-2xl border border-white/15 object-cover" />
                <button onClick={() => { setPerson(null); if (personUrl) URL.revokeObjectURL(personUrl); setPersonUrl(null); }} className="btn-ghost mt-3 rounded-xl px-4 py-2 text-xs">
                  {t(lang, 'skin_retake')}
                </button>
              </div>
            ) : (
              <CameraCapture lang={lang} onCapture={onPerson} />
            )}
          </div>

          {/* garment */}
          <div className="glass rounded-3xl p-6">
            <h3 className="mb-4 font-semibold">{t(lang, 'tryon_garment')}</h3>
            <div className="mb-4 flex gap-2">
              {(['catalog', 'custom'] as const).map((tb) => (
                <button
                  key={tb}
                  onClick={() => setTab(tb)}
                  className={`rounded-xl px-4 py-2 text-sm ${tab === tb ? 'bg-gradient-to-r from-blush-400 to-violet-500 font-semibold text-[#1c0f16]' : 'btn-ghost'}`}
                >
                  {t(lang, tb === 'catalog' ? 'tryon_catalog' : 'tryon_custom')}
                </button>
              ))}
            </div>
            {tab === 'catalog' ? (
              <div className="grid grid-cols-3 gap-2">
                {catalog.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => pickGarment(g.id)}
                    className={`relative overflow-hidden rounded-2xl border-2 transition ${garmentId === g.id ? 'border-blush-300' : 'border-transparent hover:border-white/25'}`}
                  >
                    <img src={`/garments/${g.file}`} alt={g.name} className="aspect-square w-full object-cover" loading="lazy" />
                    {demo && DEMO_PREVIEW_IDS.includes(g.id) && (
                      <span className="absolute left-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-blush-200">Demo</span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1.5 pt-4 text-left text-[10px] font-medium text-white">
                      {g.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center">
                {customUrl ? (
                  <>
                    <img src={customUrl} alt="Custom garment" className="mx-auto aspect-square max-h-56 rounded-2xl border border-white/15 object-cover" />
                    <label className="btn-ghost mt-3 inline-block cursor-pointer rounded-xl px-4 py-2 text-xs">
                      {t(lang, 'skin_retake')}
                      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onCustom} />
                    </label>
                  </>
                ) : (
                  <label className="btn-ghost inline-block cursor-pointer rounded-2xl px-6 py-3 text-sm">
                    {t(lang, 'skin_upload')}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onCustom} />
                  </label>
                )}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-white/50">{t(lang, 'tryon_category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-[#241628] px-3 py-2.5 text-sm"
              >
                {['upper_body', 'full_body', 'lower_body'].map((c) => (
                  <option key={c} value={c}>{c.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {phase === 'idle' && (
        <div className="mx-auto mt-6 max-w-4xl text-center">
          <button onClick={tryOn} disabled={!canTry} className="btn-primary rounded-2xl px-10 py-3.5 text-sm">
            {t(lang, 'tryon_btn')}
          </button>
          {!person && <p className="mt-2 text-xs text-white/40">{t(lang, 'tryon_pick_person')}</p>}
          {person && !canTry && <p className="mt-2 text-xs text-white/40">{t(lang, 'tryon_pick_garment')}</p>}
          {error && <div className="mt-4"><ErrorBox message={error} lang={lang} /></div>}
        </div>
      )}

      {phase === 'loading' && (
        <div className="mx-auto mt-6 max-w-xl">
          <StageProgress stage={stage.text} index={stage.index} total={stage.total} lang={lang} />
        </div>
      )}

      {phase === 'result' && personUrl && (
        <div className="fade-up mx-auto max-w-xl">
          <div className="mb-4 flex justify-center">
            <DemoBadge demo={resultDemo} lang={lang} />
          </div>
          {resultUrl ? (
            <>
              <h3 className="font-display mb-4 text-center text-2xl font-semibold">{t(lang, 'tryon_result')}</h3>
              <CompareSlider before={personUrl} after={resultUrl} lang={lang} />
            </>
          ) : (
            <div className="glass rounded-3xl p-8 text-center">
              <p className="text-sm leading-relaxed text-white/70">
                {t(lang, 'tryon_demo_noresult')}
              </p>
            </div>
          )}
          <div className="mt-5 text-center">
            <button onClick={reset} className="btn-ghost rounded-2xl px-6 py-3 text-sm">
              {t(lang, 'tryon_new')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
