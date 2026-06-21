'use client';

import { cn } from '@/lib/utils';

interface BarChartProps {
  data: { label: string; value: number }[];
  className?: string;
  valueFormatter?: (v: number) => string;
}

export function MiniBarChart({ data, className, valueFormatter }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn('flex h-40 items-end gap-1.5', className)}>
      {data.length === 0 && (
        <p className="m-auto text-xs text-muted-foreground">No data yet</p>
      )}
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        return (
          <div key={`${d.label}-${i}`} className="group flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t bg-primary/80 transition-all duration-300 group-hover:bg-primary"
                style={{ height: `${Math.max(2, heightPct)}%` }}
                title={`${d.label}: ${valueFormatter ? valueFormatter(d.value) : d.value}`}
              />
            </div>
            <span className="hidden text-[10px] tabular-nums text-muted-foreground sm:block">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function MiniDonut({ slices, size = 140 }: { slices: DonutSlice[]; size?: number }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = size / 2;
  const stroke = 18;
  const circumference = 2 * Math.PI * (radius - stroke / 2);

  let offset = 0;
  const arcs = slices.map((slice, i) => {
    const fraction = total > 0 ? slice.value / total : 0;
    const dash = fraction * circumference;
    const arc = (
      <circle
        key={`${slice.label}-${i}`}
        cx={radius}
        cy={radius}
        r={radius - stroke / 2}
        fill="none"
        stroke={slice.color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${radius} ${radius})`}
        className="transition-all duration-500"
      />
    );
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={radius}
          cy={radius}
          r={radius - stroke / 2}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth={stroke}
        />
        {total > 0 && arcs}
      </svg>
      <ul className="space-y-1.5">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-medium tabular-nums">
              {total > 0 ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 100;
  const height = 28;
  const step = width / Math.max(1, data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn('h-7 w-full', className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
