'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Play,
  Heart,
  Users,
  DollarSign,
  TrendingUp,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { PageHeader, StatCard, SectionCard, LoadingGrid } from '@/components/producer/primitives';
import { MiniBarChart, MiniDonut } from '@/components/producer/charts';
import { useDashboardStats, useNotifications, useRevenue } from '@/hooks/use-producer';
import { useTracks as useCatalogTracks } from '@/hooks/use-tracks';
import { formatTime } from '@/lib/format';
import { Button } from '@/components/ui/button';

const DONUT_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function DashboardPage() {
  const stats = useDashboardStats();
  const { data: notifications } = useNotifications();
  const { data: revenueLines } = useRevenue();
  const { data: catalog } = useCatalogTracks();

  // Build last-14-days plays series for the bar chart.
  const playsSeries = useMemo(() => {
    const days = stats.playsByDay ?? {};
    const today = new Date();
    const out: { label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, value: days[key] ?? 0 });
    }
    return out;
  }, [stats.playsByDay]);

  const revenueDonut = useMemo(() => {
    const entries = Object.entries(stats.revenueBySource ?? {});
    return entries.map(([label, value], i) => ({
      label,
      value,
      color: DONUT_COLORS[i % DONUT_COLORS.length],
    }));
  }, [stats.revenueBySource]);

  const recentRevenue = (revenueLines ?? []).slice(0, 4);
  const recentNotifications = (notifications ?? []).slice(0, 4);

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Your producer account at a glance."
        icon={LayoutDashboard}
        action={
          <Button asChild variant="default" className="gap-2">
            <Link href="/uploads">
              Upload track
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total plays"
          value={stats.plays.toLocaleString()}
          icon={Play}
          loading={stats.isLoading}
          delta={{ value: `${stats.recentPlays} this week`, positive: true }}
        />
        <StatCard
          label="Likes"
          value={stats.likes.toLocaleString()}
          icon={Heart}
          loading={stats.isLoading}
        />
        <StatCard
          label="Followers"
          value={stats.followers.toLocaleString()}
          icon={Users}
          loading={stats.isLoading}
        />
        <StatCard
          label="Revenue"
          value={`$${(stats.totalRevenueCents / 100).toFixed(2)}`}
          icon={DollarSign}
          loading={stats.isLoading}
          iconClassName="text-primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Plays — last 14 days"
          description="Daily play events across your catalog"
          className="lg:col-span-2"
          action={
            <Link href="/analytics" className="text-xs text-primary hover:underline">
              View analytics
            </Link>
          }
        >
          <MiniBarChart data={playsSeries} valueFormatter={(v) => `${v} plays`} />
        </SectionCard>

        <SectionCard
          title="Revenue by source"
          description="Where your earnings come from"
          action={
            <Link href="/revenue" className="text-xs text-primary hover:underline">
              Details
            </Link>
          }
        >
          {revenueDonut.length > 0 ? (
            <MiniDonut slices={revenueDonut} />
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">No revenue yet</p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Top tracks"
          description="Most-played tracks this period"
          action={
            <Link href="/songs" className="text-xs text-primary hover:underline">
              All songs
            </Link>
          }
        >
          <ul className="space-y-1">
            {(catalog ?? []).slice(0, 5).map((track, idx) => {
              return (
                <li
                  key={track.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50"
                >
                  <span className="w-5 text-center text-sm text-muted-foreground">{idx + 1}</span>
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
                  <span className="hidden text-xs tabular-nums text-muted-foreground sm:block">
                    {formatTime(track.duration_seconds ?? 0)}
                  </span>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <SectionCard
          title="Recent activity"
          description="Latest notifications"
          action={
            <Link href="/notifications" className="text-xs text-primary hover:underline">
              All
            </Link>
          }
        >
          <ul className="space-y-1">
            {recentNotifications.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No new notifications
              </li>
            )}
            {recentNotifications.map((n) => (
              <li
                key={n.id}
                className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50"
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary">
                  <Bell className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  {n.body && <p className="truncate text-xs text-muted-foreground">{n.body}</p>}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent earnings"
        description="Latest revenue transactions"
        action={
          <Link href="/revenue" className="text-xs text-primary hover:underline">
            View revenue
          </Link>
        }
      >
        {stats.isLoading ? (
          <LoadingGrid count={3} />
        ) : recentRevenue.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">No earnings recorded yet</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {recentRevenue.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
                  <TrendingUp className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{r.source}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.occurred_at).toLocaleDateString()}
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
  );
}
