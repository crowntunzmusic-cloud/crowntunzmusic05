'use client';

import { useState } from 'react';
import { Drum, Play, Pause, ShoppingCart, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader, EmptyState, StatusBadge } from '@/components/producer/primitives';
import { useBeatsWithTracks } from '@/hooks/use-producer';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { Track } from '@/lib/types';
import { FeatureGate } from '@/components/admin/feature-gate';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

type LicenseBeat = {
  track_id: string;
  producer: string;
  price_cents: number;
  is_exclusive: boolean;
  track?: Track;
};

export default function BeatsPage() {
  const { data: beats, isLoading } = useBeatsWithTracks();
  const currentTrack = useAudioPlayer((s) => s.currentTrack);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);
  const playTrack = useAudioPlayer((s) => s.playTrack);
  const togglePlay = useAudioPlayer((s) => s.togglePlay);
  const { toast } = useToast();
  const [licenseBeat, setLicenseBeat] = useState<LicenseBeat | null>(null);
  const [isSecuring, setIsSecuring] = useState(false);

  const handleLicense = (beat: LicenseBeat) => {
    setLicenseBeat(beat);
  };

  const confirmLicense = async () => {
    if (!licenseBeat) return;
    setIsSecuring(true);
    try {
      const { error } = await supabase
        .from('distribution')
        .insert({
          track_id: licenseBeat.track_id,
          store: 'Platform License',
          status: 'delivered',
        });
      if (error) throw error;
      toast({
        title: 'License secured',
        description: `License secured for ${licenseBeat.track?.title ?? 'beat'}`,
      });
      setLicenseBeat(null);
    } catch (err) {
      console.error('[license] insert failed', err);
      toast({
        title: 'Could not secure license',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setIsSecuring(false);
    }
  };

  return (
    <FeatureGate featureKey="beats">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Beats"
        description="License instrumentals from the catalog."
        icon={Drum}
        action={
          <Button asChild variant="outline">
            <Link href="/uploads">Submit a beat</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : beats.length === 0 ? (
        <EmptyState
          icon={Drum}
          title="No beats listed yet"
          description="Upload an instrumental from the Uploads page to list it as a beat."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {beats.map((beat) => {
            const track = beat.track;
            if (!track) return null;
            const isActive = currentTrack?.id === track.id;
            const isCurrent = isActive && isPlaying;
            return (
              <div
                key={beat.id}
                className="group flex items-center gap-3 rounded-xl bg-card/60 p-3 transition-all duration-300 hover:bg-card hover:shadow-lg hover:shadow-black/30"
              >
                <button
                  type="button"
                  onClick={() =>
                    isActive ? togglePlay() : playTrack(track as Track)
                  }
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg"
                  aria-label={isCurrent ? `Pause ${track.title}` : `Play ${track.title}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={track.cover_art_url}
                    alt=""
                    className={cn(
                      'h-full w-full object-cover transition-transform duration-500',
                      'group-hover:scale-105',
                    )}
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {isCurrent ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Play className="h-6 w-6 translate-x-0.5 text-white" />
                    )}
                  </span>
                  {isCurrent && (
                    <Loader2 className="absolute bottom-1 right-1 hidden h-3 w-3 animate-spin text-white" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{track.title}</p>
                    {beat.is_exclusive && (
                      <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-label="Exclusive" />
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{beat.producer}</p>
                  <div className="mt-1 flex items-center gap-2">
                    {beat.genre && (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {beat.genre}
                      </span>
                    )}
                    {track.bpm && (
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {track.bpm} BPM
                      </span>
                    )}
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {beat.plays.toLocaleString()} plays
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-bold tabular-nums text-primary">
                    ${(beat.price_cents / 100).toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    onClick={() => handleLicense(beat)}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    License
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!licenseBeat} onOpenChange={(open) => !open && setLicenseBeat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>License this beat</DialogTitle>
            <DialogDescription>
              Review the terms and confirm to secure your license.
            </DialogDescription>
          </DialogHeader>
          {licenseBeat && (
            <div className="space-y-3 py-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Beat</span>
                <span className="font-medium text-right">
                  {licenseBeat.track?.title ?? 'Untitled beat'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Producer</span>
                <span className="font-medium">{licenseBeat.producer}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold text-primary">
                  ${(licenseBeat.price_cents / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">License type</span>
                <span className="font-medium">
                  {licenseBeat.is_exclusive ? 'Exclusive' : 'Non-exclusive'}
                </span>
              </div>
              <p className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
                {licenseBeat.is_exclusive
                  ? 'Exclusive rights grant sole usage. The beat will be marked as licensed and removed from the marketplace.'
                  : 'Non-exclusive rights allow you to use the beat for your project. The producer may license it to others.'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLicenseBeat(null)} disabled={isSecuring}>
              Cancel
            </Button>
            <Button onClick={confirmLicense} disabled={isSecuring}>
              {isSecuring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Securing…
                </>
              ) : (
                'Confirm license'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </FeatureGate>
  );
}
