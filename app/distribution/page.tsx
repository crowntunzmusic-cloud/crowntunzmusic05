'use client';

import { useMemo, useState } from 'react';
import { Share2, ExternalLink } from 'lucide-react';
import { PageHeader, EmptyState, StatusBadge, StatCard } from '@/components/producer/primitives';
import {
  useDistribution,
  useDistributeTrack,
  useRetryDistribution,
} from '@/hooks/use-producer';
import { useTracks } from '@/hooks/use-tracks';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeatureGate } from '@/components/admin/feature-gate';

export default function DistributionPage() {
  const { data: deals, isLoading } = useDistribution();
  const { data: catalog } = useTracks();
  const { toast } = useToast();
  const distributeTrack = useDistributeTrack();
  const retryDistribution = useRetryDistribution();
  const trackMap = useMemo(
    () => new Map((catalog ?? []).map((t) => [t.id, t])),
    [catalog],
  );

  const [distributeOpen, setDistributeOpen] = useState(false);
  const [trackId, setTrackId] = useState('');
  const [store, setStore] = useState('');

  const STORE_OPTIONS = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'Tidal'];

  function handleDistribute(e: React.FormEvent) {
    e.preventDefault();
    distributeTrack.mutate(
      { trackId, store },
      {
        onSuccess: () => {
          toast({ title: 'Distribution started' });
          setTrackId('');
          setStore('');
          setDistributeOpen(false);
        },
        onError: (err) =>
          toast({
            title: 'Failed to distribute',
            description: err.message,
            variant: 'destructive',
          }),
      },
    );
  }

  function handleRetry(id: string) {
    retryDistribution.mutate(id, {
      onSuccess: () => toast({ title: 'Retrying distribution' }),
      onError: (err) =>
        toast({
          title: 'Failed to retry',
          description: err.message,
          variant: 'destructive',
        }),
    });
  }

  const delivered = (deals ?? []).filter((d) => d.status === 'delivered').length;
  const pending = (deals ?? []).filter((d) => d.status === 'pending' || d.status === 'processing').length;
  const stores = new Set((deals ?? []).map((d) => d.store));

  return (
    <FeatureGate featureKey="distribution">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Distribution"
        description="Delivery status across streaming stores."
        icon={Share2}
        action={
          <Dialog open={distributeOpen} onOpenChange={setDistributeOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <Share2 className="h-4 w-4" />
                Distribute
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Distribute a track</DialogTitle>
              <form onSubmit={handleDistribute} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Track</label>
                  <Select value={trackId} onValueChange={setTrackId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a track" />
                    </SelectTrigger>
                    <SelectContent>
                      {(catalog ?? []).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Store</label>
                  <Select value={store} onValueChange={setStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {STORE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={distributeTrack.isPending || !trackId || !store}
                  className="w-full"
                >
                  {distributeTrack.isPending ? 'Distributing…' : 'Distribute'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Delivered" value={delivered} icon={Share2} />
          <StatCard label="In progress" value={pending} icon={Share2} />
          <StatCard label="Stores" value={stores.size} icon={ExternalLink} />
        </div>
      )}

      {(deals ?? []).length === 0 && !isLoading ? (
        <EmptyState
          icon={Share2}
          title="Not distributed yet"
          description="Send your tracks to streaming stores to reach listeners everywhere."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card/40">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/60 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground md:grid-cols-[1fr_1fr_auto_auto]">
            <span>Track</span>
            <span className="hidden md:block">Store</span>
            <span>Status</span>
            <span>Delivered</span>
          </div>
          <ul className="divide-y divide-border/40">
            {(deals ?? []).map((d) => {
              const track = d.track_id ? trackMap.get(d.track_id) : undefined;
              return (
                <li
                  key={d.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-3 py-3 transition-colors hover:bg-secondary/30 md:grid-cols-[1fr_1fr_auto_auto]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {track ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.cover_art_url}
                          alt=""
                          className="h-9 w-9 rounded object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{track.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unknown track</span>
                    )}
                  </div>
                  <span className="hidden text-sm md:block">{d.store}</span>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={d.status} />
                    {d.status === 'failed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={retryDistribution.isPending}
                        onClick={() => handleRetry(d.id)}
                      >
                        Retry
                      </Button>
                    )}
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {d.delivered_at ? new Date(d.delivered_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
