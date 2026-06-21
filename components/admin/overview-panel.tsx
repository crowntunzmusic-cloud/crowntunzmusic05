'use client';

import { Users, ToggleRight, History, ShieldCheck, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/producer/primitives';
import { useAdminUsers, useFeatureFlagsQuery, useAuditLog } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';

export function AdminOverview() {
  const { data: users } = useAdminUsers();
  const { data: flags } = useFeatureFlagsQuery();
  const { data: audit } = useAuditLog();

  const totalUsers = (users ?? []).length;
  const disabledUsers = (users ?? []).filter((u) => u.is_disabled).length;
  const enabledFeatures = (flags ?? []).filter((f) => f.is_enabled).length;
  const totalFeatures = (flags ?? []).length;
  const recentActions = (audit ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total users" value={totalUsers} icon={Users} />
        <StatCard label="Disabled users" value={disabledUsers} icon={ShieldCheck} />
        <StatCard
          label="Features enabled"
          value={`${enabledFeatures}/${totalFeatures}`}
          icon={ToggleRight}
        />
        <StatCard label="Audit entries" value={(audit ?? []).length} icon={History} />
      </div>

      <section className="rounded-xl bg-card/40 p-4">
        <h2 className="mb-3 text-sm font-semibold">Platform health</h2>
        <div className="space-y-2.5">
          {[
            { label: 'Active users', value: totalUsers - disabledUsers, max: totalUsers, color: 'bg-primary' },
            { label: 'Features operational', value: enabledFeatures, max: totalFeatures, color: 'bg-blue-500' },
          ].map((row) => {
            const pct = row.max > 0 ? (row.value / row.max) * 100 : 0;
            return (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="tabular-nums">
                    {row.value}/{row.max}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', row.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl bg-card/40 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="h-4 w-4" />
          Recent admin activity
        </h2>
        {recentActions.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">No actions recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {recentActions.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-medium">{entry.action}</span>
                  {entry.target_label && (
                    <span className="text-muted-foreground"> · {entry.target_label}</span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
