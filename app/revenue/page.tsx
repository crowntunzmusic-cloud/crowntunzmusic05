'use client';

import { useMemo } from 'react';
import { DollarSign, TrendingUp, Wallet, Download } from 'lucide-react';
import { PageHeader, StatCard, SectionCard, EmptyState } from '@/components/producer/primitives';
import { MiniBarChart, MiniDonut } from '@/components/producer/charts';
import { useRevenue } from '@/hooks/use-producer';
import { useTracks } from '@/hooks/use-tracks';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FeatureGate } from '@/components/admin/feature-gate';

const SOURCE_COLORS: Record<string, string> = {
  streams: '#22c55e',
  downloads: '#3b82f6',
  beat_license: '#f59e0b',
  royalties: '#ec4899',
};

export default function RevenuePage() {
  const { data: lines, isLoading } = useRevenue();
  const { data: catalog } = useTracks();

  const summary = useMemo(() => {
    const list = lines ?? [];
    const totalCents = list.reduce((sum, r) => sum + r.amount_cents, 0);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const last30 = list
      .filter((r) => new Date(r.occurred_at).getTime() >= thirtyDaysAgo)
      .reduce((sum, r) => sum + r.amount_cents, 0);

    const bySource = list.reduce<Record<string, number>>((acc, r) => {
      acc[r.source] = (acc[r.source] ?? 0) + r.amount_cents;
      return acc;
    }, {});

    const byMonth = list.reduce<Record<string, number>>((acc, r) => {
      const key = new Date(r.occurred_at).toLocaleString('en-US', { month: 'short' });
      acc[key] = (acc[key] ?? 0) + r.amount_cents;
      return acc;
    }, {});

    const byTrack = list.reduce<Record<string, number>>((acc, r) => {
      if (r.track_id) {
        acc[r.track_id] = (acc[r.track_id] ?? 0) + r.amount_cents;
      }
      return acc;
    }, {});

    return { totalCents, last30, bySource, byMonth, byTrack };
  }, [lines]);

  const sourceDonut = Object.entries(summary.bySource).map(([label, value]) => ({
    label: label.replace('_', ' '),
    value,
    color: SOURCE_COLORS[label] ?? '#6b7280',
  }));

  const monthSeries = Object.entries(summary.byMonth).map(([label, value]) => ({
    label,
    value,
  }));

  const trackMap = new Map((catalog ?? []).map((t) => [t.id, t]));
  const topTracks = Object.entries(summary.byTrack)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, cents]) => ({
      track: trackMap.get(id),
      cents,
    }));

  const { toast } = useToast();

  const exportCSV = () => {
    const rows = lines ?? [];
    const header = ['Date', 'Source', 'Track', 'Amount (USD)', 'Currency'];
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const linesCsv = rows.map((r) => {
      const track = r.track_id ? (trackMap.get(r.track_id)?.title ?? r.track_id) : '';
      return [
        new Date(r.occurred_at).toLocaleDateString(),
        r.source,
        track,
        (r.amount_cents / 100).toFixed(2),
        r.currency,
      ]
        .map((v) => escape(String(v)))
        .join(',');
    });
    const csv = [header.map(escape).join(','), ...linesCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-revenue-export-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Revenue statement exported',
      description: `${rows.length} transactions exported to CSV.`,
    });
  };

  return (
    <FeatureGate featureKey="revenue">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Revenue"
        description="Earnings across streams, licenses, and royalties."
        icon={DollarSign}
        action={
          <Button
            variant="outline"
            className="gap-2"
            onClick={exportCSV}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Lifetime earnings"
            value={`$${(summary.totalCents / 100).toFixed(2)}`}
            icon={Wallet}
            iconClassName="text-primary"
          />
          <StatCard
            label="Last 30 days"
            value={`$${(summary.last30 / 100).toFixed(2)}`}
            icon={TrendingUp}
            delta={{ value: 'live', positive: true }}
          />
          <StatCard
            label="Transactions"
            value={(lines ?? []).length.toLocaleString()}
            icon={DollarSign}
          />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Earnings by source" description="Where revenue originates">
          {sourceDonut.length > 0 ? (
            <MiniDonut slices={sourceDonut} />
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">No revenue yet</p>
          )}
        </SectionCard>

        <SectionCard
          title="Monthly trend"
          description="Earnings by month"
          className="lg:col-span-2"
        >
          {monthSeries.length > 0 ? (
            <MiniBarChart
              data={monthSeries}
              valueFormatter={(v) => `$${(v / 100).toFixed(2)}`}
            />
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">No data yet</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Top earning tracks" description="Best performing catalog">
        {topTracks.length === 0 ? (
          <EmptyState icon={DollarSign} title="No track-level earnings" />
        ) : (
          <ul className="divide-y divide-border/60">
            {topTracks.map(({ track, cents }, idx) => (
              <li key={track?.id ?? idx} className="flex items-center gap-3 py-2.5">
                <span className="w-5 text-center text-sm text-muted-foreground">{idx + 1}</span>
                {track ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={track.cover_art_url}
                      alt=""
                      className="h-9 w-9 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{track.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                  </>
                ) : (
                  <span className="flex-1 text-sm text-muted-foreground">Unknown track</span>
                )}
                <span className="text-sm font-semibold tabular-nums text-primary">
                  +${(cents / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Recent transactions" description="Latest earning events">
        {(lines ?? []).length === 0 ? (
          <EmptyState icon={DollarSign} title="No transactions yet" />
        ) : (
          <ul className="divide-y divide-border/60">
            {(lines ?? []).slice(0, 10).map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{r.source.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.occurred_at).toLocaleDateString()} · {r.currency}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  +${(r.amount_cents / 100).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
    </FeatureGate>
  );
}
