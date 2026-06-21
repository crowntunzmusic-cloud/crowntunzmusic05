'use client';

import { useMemo } from 'react';
import { BarChart3, Play, CheckCircle2, SkipForward, Heart } from 'lucide-react';
import { PageHeader, StatCard, SectionCard, LoadingGrid } from '@/components/producer/primitives';
import { MiniBarChart, MiniDonut } from '@/components/producer/charts';
import { useAnalytics } from '@/hooks/use-producer';
import { FeatureGate } from '@/components/admin/feature-gate';

const EVENT_COLORS: Record<string, string> = {
  play: '#22c55e',
  complete: '#3b82f6',
  skip: '#ef4444',
  like: '#ec4899',
};

const DEVICE_LABEL: Record<string, string> = { web: 'Web', ios: 'iOS', android: 'Android' };

export default function AnalyticsPage() {
  const { data: events, isLoading } = useAnalytics();

  const stats = useMemo(() => {
    const list = events ?? [];
    const plays = list.filter((e) => e.event_type === 'play').length;
    const completes = list.filter((e) => e.event_type === 'complete').length;
    const skips = list.filter((e) => e.event_type === 'skip').length;
    const likes = list.filter((e) => e.event_type === 'like').length;
    const completionRate = plays > 0 ? (completes / plays) * 100 : 0;
    const skipRate = plays > 0 ? (skips / plays) * 100 : 0;

    const byType = list.reduce<Record<string, number>>((acc, e) => {
      acc[e.event_type] = (acc[e.event_type] ?? 0) + 1;
      return acc;
    }, {});

    const byDevice = list.reduce<Record<string, number>>((acc, e) => {
      const key = e.device ?? 'unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const byCountry = list.reduce<Record<string, number>>((acc, e) => {
      const key = e.country ?? 'Unknown';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return { plays, completes, skips, likes, completionRate, skipRate, byType, byDevice, byCountry };
  }, [events]);

  const series = useMemo(() => {
    const today = new Date();
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = (events ?? []).filter(
        (e) => e.event_type === 'play' && e.occurred_at.slice(0, 10) === key,
      ).length;
      out.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, value: count });
    }
    return out;
  }, [events]);

  const typeDonut = Object.entries(stats.byType).map(([label, value]) => ({
    label,
    value,
    color: EVENT_COLORS[label] ?? '#6b7280',
  }));

  const deviceDonut = Object.entries(stats.byDevice).map(([label, value], i) => ({
    label: DEVICE_LABEL[label] ?? label,
    value,
    color: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'][i % 4],
  }));

  const topCountries = Object.entries(stats.byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCountry = Math.max(1, ...topCountries.map(([, n]) => n));

  return (
    <FeatureGate featureKey="analytics">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Analytics & Insights"
        description="Performance across your catalog — last 14 days."
        icon={BarChart3}
      />

      {isLoading ? (
        <LoadingGrid count={4} />
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Plays" value={stats.plays.toLocaleString()} icon={Play} />
          <StatCard
            label="Completion rate"
            value={`${stats.completionRate.toFixed(0)}%`}
            icon={CheckCircle2}
          />
          <StatCard label="Skip rate" value={`${stats.skipRate.toFixed(0)}%`} icon={SkipForward} />
          <StatCard label="Likes" value={stats.likes.toLocaleString()} icon={Heart} />
        </div>
      )}

      <SectionCard
        title="Plays over time"
        description="Daily play events in the last 14 days"
      >
        <MiniBarChart data={series} valueFormatter={(v) => `${v} plays`} />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="By event type" description="Breakdown of all events">
          {typeDonut.length > 0 ? (
            <MiniDonut slices={typeDonut} />
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">No events yet</p>
          )}
        </SectionCard>

        <SectionCard title="By device" description="Where listeners tune in">
          {deviceDonut.length > 0 ? (
            <MiniDonut slices={deviceDonut} />
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">No data</p>
          )}
        </SectionCard>

        <SectionCard title="Top countries" description="Listeners by region">
          {topCountries.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">No data</p>
          ) : (
            <ul className="space-y-2.5">
              {topCountries.map(([country, count]) => (
                <li key={country}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{country}</span>
                    <span className="tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(count / maxCountry) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
    </FeatureGate>
  );
}
