'use client';

import { useMemo } from 'react';
import { ShieldCheck, ToggleLeft, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeatureFlagsQuery, useToggleFeatureFlag } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import type { FeatureFlag, FeatureFlagCategory } from '@/lib/types';

const categoryLabels: Record<FeatureFlagCategory, string> = {
  core: 'Core platform',
  browse: 'Browse',
  account: 'Account & content',
  growth: 'Growth & monetization',
  engagement: 'Engagement & community',
};

const categoryOrder: FeatureFlagCategory[] = ['core', 'browse', 'account', 'growth', 'engagement'];

export function AdminFeaturesPanel() {
  const { data: flags, isLoading } = useFeatureFlagsQuery();
  const toggle = useToggleFeatureFlag();
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const map = new Map<FeatureFlagCategory, FeatureFlag[]>();
    for (const flag of flags ?? []) {
      const list = map.get(flag.category);
      if (list) list.push(flag);
      else map.set(flag.category, [flag]);
    }
    return categoryOrder
      .map((cat) => ({ category: cat, items: map.get(cat) ?? [] }))
      .filter((g) => g.items.length > 0);
  }, [flags]);

  const enabledCount = (flags ?? []).filter((f) => f.is_enabled).length;
  const disabledCount = (flags ?? []).length - enabledCount;

  const handleToggle = (flag: FeatureFlag) => {
    const next = !flag.is_enabled;
    toggle.mutate(
      { key: flag.feature_key, enabled: next },
      {
        onSuccess: () => {
          toast({
            title: next ? 'Feature enabled' : 'Feature disabled',
            description: `${flag.label} is now ${next ? 'available' : 'hidden'} across the platform.`,
          });
        },
        onError: () => {
          toast({
            title: 'Could not update feature',
            description: 'Please try again.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-card/60 p-3">
          <p className="text-2xl font-bold tabular-nums">{(flags ?? []).length}</p>
          <p className="text-xs text-muted-foreground">Total features</p>
        </div>
        <div className="rounded-xl bg-card/60 p-3">
          <p className="text-2xl font-bold tabular-nums text-primary">{enabledCount}</p>
          <p className="text-xs text-muted-foreground">Enabled</p>
        </div>
        <div className="rounded-xl bg-card/60 p-3">
          <p className="text-2xl font-bold tabular-nums text-muted-foreground">{disabledCount}</p>
          <p className="text-xs text-muted-foreground">Disabled</p>
        </div>
      </div>

      {disabledCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {disabledCount} feature{disabledCount > 1 ? 's are' : ' is'} currently disabled. Affected
            navigation items and routes are hidden for all users.
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.category} className="space-y-2">
              <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryLabels[group.category]}
              </p>
              <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
                <ul className="divide-y divide-border/40">
                  {group.items.map((flag) => (
                    <li
                      key={flag.feature_key}
                      className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-secondary/20"
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                          flag.is_enabled
                            ? 'bg-primary/15 text-primary'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <ToggleLeft className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{flag.label}</p>
                        {flag.description && (
                          <p className="truncate text-xs text-muted-foreground">{flag.description}</p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Key: <code className="rounded bg-secondary px-1 py-0.5">{flag.feature_key}</code>
                          {' · '}
                          Updated {new Date(flag.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Switch
                        checked={flag.is_enabled}
                        onCheckedChange={() => handleToggle(flag)}
                        disabled={toggle.isPending || flag.feature_key === 'player'}
                        aria-label={`Toggle ${flag.label}`}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/30 p-3 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          The audio player (core) cannot be disabled from this panel — it is the platform&apos;s
          foundational feature and remains always on. All other toggles take effect immediately for
          every user across the app.
        </span>
      </div>
    </div>
  );
}
