'use client';

import { ShieldAlert, ToggleRight, Clock3, History } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/producer/primitives';
import { useAuditLog } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';

const actionMeta: Record<string, { label: string; icon: typeof ToggleRight; color: string }> = {
  'user.disable':    { label: 'User disabled',    icon: ShieldAlert, color: 'bg-destructive/15 text-destructive' },
  'user.enable':     { label: 'User enabled',      icon: ShieldAlert, color: 'bg-primary/15 text-primary' },
  'feature.toggle':  { label: 'Feature toggled',   icon: ToggleRight, color: 'bg-blue-500/15 text-blue-400' },
};

export function AdminAuditPanel() {
  const { data: entries, isLoading } = useAuditLog();

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (entries ?? []).length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit entries"
          description="Admin actions like disabling users or toggling features will be recorded here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
          <ScrollArea className="max-h-[60vh]">
            <ul className="divide-y divide-border/40">
              {(entries ?? []).map((entry) => {
                const meta = actionMeta[entry.action] ?? {
                  label: entry.action,
                  icon: Clock3,
                  color: 'bg-secondary text-muted-foreground',
                };
                const Icon = meta.icon;
                const target = entry.target_label ?? entry.target_id ?? entry.target_type;
                const detail = entry.detail as Record<string, unknown> | null;
                return (
                  <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                    <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full', meta.color)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{meta.label}</p>
                        <time className="shrink-0 text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </time>
                      </div>
                      {target && (
                        <p className="truncate text-xs text-muted-foreground">
                          {entry.target_type}: <span className="text-foreground">{target}</span>
                        </p>
                      )}
                      {detail && (
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {Object.entries(detail)
                            .map(([k, v]) => `${k}=${String(v)}`)
                            .join(' · ')}
                        </p>
                      )}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        by {entry.performed_by}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
