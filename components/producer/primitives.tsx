'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 pt-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-foreground">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {action}
    </header>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  iconClassName,
  loading,
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean } | null;
  icon: LucideIcon;
  iconClassName?: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl bg-card/60 p-4 transition-colors hover:bg-card">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground">
          <Icon className="h-4 w-4" />
        </span>
        {delta && (
          <span
            className={cn(
              'text-xs font-medium',
              delta.positive ? 'text-primary' : 'text-destructive',
            )}
          >
            {delta.positive ? '+' : ''}
            {delta.value}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums">
        {loading ? <Skeleton className="h-7 w-16" /> : value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  processing: 'bg-blue-500/15 text-blue-400',
  published: 'bg-primary/15 text-primary',
  delivered: 'bg-primary/15 text-primary',
  active: 'bg-primary/15 text-primary',
  completed: 'bg-emerald-500/15 text-emerald-400',
  succeeded: 'bg-emerald-500/15 text-emerald-400',
  scheduled: 'bg-violet-500/15 text-violet-400',
  invited: 'bg-violet-500/15 text-violet-400',
  failed: 'bg-destructive/15 text-destructive',
  declined: 'bg-destructive/15 text-destructive',
  paused: 'bg-amber-500/15 text-amber-400',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status.toLowerCase()] ?? 'bg-secondary text-muted-foreground';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        cls,
      )}
    >
      {status}
    </span>
  );
}

const tierColors: Record<string, string> = {
  free: 'bg-secondary text-muted-foreground',
  premium: 'bg-amber-500/15 text-amber-400',
};

export function TierBadge({ tier }: { tier: string }) {
  const cls = tierColors[tier.toLowerCase()] ?? tierColors.free;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        cls,
      )}
    >
      {tier}
    </span>
  );
}

const ownershipColors: Record<string, string> = {
  full: 'bg-emerald-500/15 text-emerald-400',
  beat_license: 'bg-blue-500/15 text-blue-400',
};

export function OwnershipBadge({ type }: { type: string }) {
  const cls = ownershipColors[type.toLowerCase()] ?? 'bg-secondary text-muted-foreground';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold',
        cls,
      )}
    >
      {type === 'beat_license' ? 'Beat license' : 'Full ownership'}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-lg font-semibold text-foreground">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn('rounded-xl bg-card/40 p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
