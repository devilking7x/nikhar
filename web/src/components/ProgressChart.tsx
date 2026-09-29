import { useEffect, useRef } from 'react';

export interface TrendPoint {
  date: string; // ISO
  score: number;
}

/** Minimal SVG glow-score trend chart (no chart library needed). */
export default function ProgressChart({ points }: { points: TrendPoint[] }) {
  const W = 640;
  const H = 220;
  const P = 28;
  const ref = useRef<HTMLDivElement>(null);

  if (points.length === 0) return null;

  const sorted = [...points].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const scores = sorted.map((p) => p.score);
  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 100);
  const span = Math.max(1, max - min);

  const x = (i: number) =>
    sorted.length === 1 ? W / 2 : P + (i * (W - 2 * P)) / (sorted.length - 1);
  const y = (s: number) => H - P - ((s - min) / span) * (H - 2 * P);

  const line = sorted.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(' ');
  const area = `${line} L${x(sorted.length - 1).toFixed(1)},${H - P} L${x(0).toFixed(1)},${H - P} Z`;

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <div ref={ref} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[480px] w-full">
        <defs>
          <linearGradient id="glowFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7b9d0" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="glowLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f7b9d0" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={P}
            x2={W - P}
            y1={P + f * (H - 2 * P)}
            y2={P + f * (H - 2 * P)}
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="4 4"
          />
        ))}
        <path d={area} fill="url(#glowFill)" />
        <path d={line} fill="none" stroke="url(#glowLine)" strokeWidth="3" strokeLinecap="round" />
        {sorted.map((p, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(p.score)} r="5" fill="#1e1326" stroke="#f7b9d0" strokeWidth="2.5" />
            <text x={x(i)} y={y(p.score) - 12} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700">
              {p.score}
            </text>
            <text x={x(i)} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10">
              {new Date(p.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
