'use client';

import { Heart, Play, Clock } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/producer/primitives';
import { useLikedTracks, useToggleLike } from '@/hooks/use-producer';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Button } from '@/components/ui/button';
import { FeatureGate } from '@/components/admin/feature-gate';

export default function LikedTracksPage() {
  const { data: tracks, isLoading } = useLikedTracks();
  const toggleLike = useToggleLike();
  const playTrack = useAudioPlayer((s) => s.playTrack);

  return (
    <FeatureGate featureKey="songs">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Liked Songs"
        description="Tracks you've hearted, all in one place."
        icon={Heart}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : (tracks ?? []).length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No liked tracks yet"
          description="Tap the heart on any track to add it to this auto playlist."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {(tracks ?? []).map((t) => (
            <div
              key={t.id}
              className="group flex flex-col gap-3 rounded-lg bg-card/60 p-3 transition-all duration-300 hover:bg-card hover:shadow-lg hover:shadow-black/30 hover:-translate-y-1"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.cover_art_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => playTrack(t, tracks ?? [])}
                  className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-label={`Play ${t.title}`}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Play className="h-5 w-5" fill="currentColor" />
                  </span>
                </button>
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{t.title}</p>
                <p className="truncate text-sm text-muted-foreground">{t.artist}</p>
                {t.duration_seconds ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {Math.floor(t.duration_seconds / 60)}:
                    {String(t.duration_seconds % 60).padStart(2, '0')}
                  </p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-destructive"
                disabled={toggleLike.isPending}
                onClick={() => toggleLike.mutate({ trackId: t.id, liked: true })}
              >
                <Heart className="h-4 w-4" fill="currentColor" />
                Unlike
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
