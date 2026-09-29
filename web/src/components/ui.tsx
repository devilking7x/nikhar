import React from 'react';
import { t, type Lang } from '../i18n';

export function DemoBadge({ demo, lang }: { demo: boolean | undefined; lang: Lang }) {
  if (demo === undefined) return null;
  return demo ? (
    <div className="inline-flex items-center gap-2 rounded-full border border-blush-300/40 bg-blush-300/10 px-4 py-1.5 text-xs font-medium text-blush-200">
      <span className="h-2 w-2 rounded-full bg-blush-300 pulse-soft" />
      {t(lang, 'demo_badge')}
    </div>
  ) : (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-1.5 text-xs font-medium text-emerald-200">
      <span className="h-2 w-2 rounded-full bg-emerald-300" />
      {t(lang, 'live_badge')}
    </div>
  );
}

export function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-3xl font-semibold grad-text sm:text-4xl">{children}</h2>
      {sub && <p className="mt-2 max-w-2xl text-sm text-white/60">{sub}</p>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blush-300/30 border-t-blush-300" />
      {label && <span className="text-sm text-white/70">{label}</span>}
    </div>
  );
}

export function ErrorBox({ message, onRetry, lang }: { message: string; onRetry?: () => void; lang: Lang }) {
  return (
    <div className="glass fade-up rounded-2xl p-6 text-center">
      <p className="font-medium text-rose-200">{t(lang, 'c_error')}</p>
      <p className="mt-1 text-sm text-white/60">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-4 rounded-xl px-5 py-2 text-sm">
          {t(lang, 'c_retry')}
        </button>
      )}
    </div>
  );
}

export function StageProgress({ stage, index, total, lang }: { stage: string; index: number; total: number; lang: Lang }) {
  return (
    <div className="glass fade-up rounded-2xl p-6 text-center">
      <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-300/30 border-t-violet-300" />
      <p className="text-sm text-white/80">{stage}</p>
      <p className="mt-1 text-xs text-white/40">
        {t(lang, 'c_stage')} {index + 1} {t(lang, 'c_of')} {total}
      </p>
      <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blush-400 to-violet-400 transition-all duration-500"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function gaugeColor(v: number): string {
  if (v >= 80) return '#6ee7b7';
  if (v >= 60) return '#f7b9d0';
  return '#fb7185';
}

export function Gauge({ value, label, size = 132 }: { value: number; label: string; size?: number }) {
  const v = Math.max(1, Math.min(100, Math.round(value)));
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 120 74" width={size} height={(size * 74) / 120} role="img" aria-label={`${label}: ${v}`}>
        <path d="M 8 66 A 52 52 0 0 1 112 66" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="11" strokeLinecap="round" />
        <path
          d="M 8 66 A 52 52 0 0 1 112 66"
          fill="none"
          stroke={gaugeColor(v)}
          strokeWidth="11"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - v}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)' }}
        />
        <text x="60" y="58" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700" fontFamily="Outfit,sans-serif">
          {v}
        </text>
      </svg>
      <span className="mt-1 text-center text-xs font-medium text-white/70">{label}</span>
    </div>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const v = Math.max(1, Math.min(100, Math.round(value)));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-white/75">{label}</span>
        <span className="font-semibold text-white">{v}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${v}%`, background: gaugeColor(v) }}
        />
      </div>
    </div>
  );
}
