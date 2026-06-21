'use client';

import { useMemo, useState } from 'react';
import { Users, UserPlus, Check } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/producer/primitives';
import { useFollowers, useToggleFollow } from '@/hooks/use-producer';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FeatureGate } from '@/components/admin/feature-gate';

export default function FollowersPage() {
  const { data: followers, isLoading } = useFollowers();
  const { toast } = useToast();
  const toggleFollow = useToggleFollow();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const list = followers ?? [];
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (f) =>
        (f.display_name ?? '').toLowerCase().includes(q) ||
        (f.handle ?? '').toLowerCase().includes(q),
    );
  }, [followers, query]);

  return (
    <FeatureGate featureKey="followers">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Followers"
        description={`${(followers ?? []).length} people follow your work.`}
        icon={Users}
        action={
          <div className="hidden w-56 sm:block">
            <Input
              placeholder="Search followers…"
              className="bg-secondary/60"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No followers yet"
          description="Share your tracks to grow your audience."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f) => {
            const initials = (f.display_name ?? f.handle)
              .split(/[\s_]+/)
              .map((p) => p[0]?.toUpperCase() ?? '')
              .slice(0, 2)
              .join('');
            return (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-xl bg-card/60 p-3 transition-colors hover:bg-card"
              >
                <Avatar className="h-11 w-11">
                  {f.avatar_url && <AvatarImage src={f.avatar_url} alt="" />}
                  <AvatarFallback className="bg-secondary text-xs">
                    {initials || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {f.display_name ?? f.handle}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">@{f.handle}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Followed {new Date(f.followed_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant={f.followed_at ? 'secondary' : 'outline'}
                  size="sm"
                  className="gap-1.5"
                  disabled={toggleFollow.isPending}
                  onClick={() =>
                    toggleFollow.mutate(
                      { id: f.id, followed: !!f.followed_at },
                      {
                        onSuccess: () => {
                          toast({
                            title: f.followed_at ? 'Unfollowed' : 'Following',
                            description: f.followed_at
                              ? `You unfollowed ${f.display_name ?? f.handle}`
                              : `You are now following ${f.display_name ?? f.handle}`,
                          });
                        },
                        onError: () => {
                          toast({
                            variant: 'destructive',
                            title: 'Something went wrong',
                            description: 'Could not update follow status. Please try again.',
                          });
                        },
                      },
                    )
                  }
                >
                  {f.followed_at ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
