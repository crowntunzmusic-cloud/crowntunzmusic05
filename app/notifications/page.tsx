'use client';

import { useMemo, useState } from 'react';
import {
  Bell,
  MessageSquare,
  DollarSign,
  Users,
  Megaphone,
  Share2,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/producer/primitives';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/hooks/use-producer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/lib/types';
import { FeatureGate } from '@/components/admin/feature-gate';

const CATEGORY_ICON: Record<AppNotification['category'], typeof Bell> = {
  message: MessageSquare,
  revenue: DollarSign,
  follower: Users,
  comment: MessageSquare,
  promotion: Megaphone,
  distribution: Share2,
  system: Bell,
};

const FILTERS = ['all', 'unread', 'message', 'revenue', 'follower', 'promotion'] as const;
type Filter = (typeof FILTERS)[number];

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { toast } = useToast();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (filter === 'all') return list;
    if (filter === 'unread') return list.filter((n) => !n.read_at);
    return list.filter((n) => n.category === filter);
  }, [data, filter]);

  const unreadCount = (data ?? []).filter((n) => !n.read_at).length;

  return (
    <FeatureGate featureKey="notifications">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
        icon={Bell}
        action={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={markAllRead.isPending}
              onClick={() =>
                markAllRead.mutate(undefined, {
                  onSuccess: () => {
                    toast({ title: 'All caught up', description: 'Marked all notifications as read.' });
                  },
                  onError: () => {
                    toast({
                      variant: 'destructive',
                      title: 'Something went wrong',
                      description: 'Could not mark notifications as read.',
                    });
                  },
                })
              }
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          ) : null
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors',
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bell} title="Nothing here" description="No notifications match this filter." />
      ) : (
        <ul className="space-y-1">
          {filtered.map((n) => {
            const Icon = CATEGORY_ICON[n.category] ?? Bell;
            return (
              <li
                key={n.id}
                onClick={() =>
                  !n.read_at &&
                  markRead.mutate(n.id, {
                    onSuccess: () => {
                      toast({ title: 'Marked as read' });
                    },
                    onError: () => {
                      toast({
                        variant: 'destructive',
                        title: 'Something went wrong',
                        description: 'Could not mark notification as read.',
                      });
                    },
                  })
                }
                className={cn(
                  'group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-border/60 hover:bg-card/60',
                  !n.read_at && 'bg-card/30',
                )}
              >
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full',
                    n.read_at ? 'bg-secondary text-muted-foreground' : 'bg-primary/15 text-primary',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    {!n.read_at && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  {n.body && <p className="truncate text-xs text-muted-foreground">{n.body}</p>}
                </div>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
    </FeatureGate>
  );
}
