'use client';

import { useMemo } from 'react';
import { Music2, Play, Pause, Plus } from 'lucide-react';
import Link from 'next/link';
import { PageHeader, EmptyState } from '@/components/producer/primitives';
import { TrackRow } from '@/components/tracks/track-row';
import { useTracks } from '@/hooks/use-tracks';
import { useAnalytics } from '@/hooks/use-producer';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import type { Track } from '@/lib/types';
import { FeatureGate } from '@/components/admin/feature-gate';

export default function SongsPage() {
  const { data: tracks, isLoading } = useTracks();
  const { data: analytics } = useAnalytics();
  const currentTrack = useAudioPlayer((s) => s.currentTrack);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);
  const playTrack = useAudioPlayer((s) => s.playTrack);
  const togglePlay = useAudioPlayer((s) => s.togglePlay);

  const playsByTrack = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of analytics ?? []) {
      if (e.event_type === 'play' && e.track_id) {
        map.set(e.track_id, (map.get(e.track_id) ?? 0) + 1);
      }
    }
    return map;
  }, [analytics]);

  return (
    <FeatureGate featureKey="songs">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Songs"
        description="Your published catalog."
        icon={Music2}
        action={
          <Button asChild variant="default" className="gap-2">
            <Link href="/uploads">
              <Plus className="h-4 w-4" />
              New song
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-secondary/40" />
          ))}
        </div>
      ) : (tracks ?? []).length === 0 ? (
        <EmptyState
          icon={Music2}
          title="No songs published"
          description="Upload your first track to start building your catalog."
          action={
            <Button asChild>
              <Link href="/uploads">Upload a track</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card/40">
          <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-border/60 px-3 py-2 text-[11px] uppercase tracking-wide text-muted-foreground md:grid-cols-[2rem_4fr_2fr_1fr_auto]">
            <span className="text-center">#</span>
            <span>Title</span>
            <span className="hidden md:block">Plays</span>
            <span className="hidden md:block">Genre</span>
            <span>Duration</span>
          </div>
          <div className="p-2">
            {(tracks as Track[]).map((track, idx) => {
              const isActive = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary/60 md:grid-cols-[2rem_4fr_2fr_1fr_auto]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      isActive ? togglePlay() : playTrack(track)
                    }
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-transform hover:scale-110 hover:text-foreground"
                    aria-label={isActive && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                  >
                    {isActive && isPlaying ? (
                      <Pause className="h-4 w-4 text-primary" />
                    ) : (
                      <>
                        <span className="text-sm tabular-nums group-hover:hidden">{idx + 1}</span>
                        <Play className="hidden h-4 w-4 group-hover:block" />
                      </>
                    )}
                  </button>
                  <div className="flex min-w-0 items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={track.cover_art_url}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <p className={cn('truncate text-sm font-medium', isActive && 'text-primary')}>
                        {track.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                    </div>
                  </div>
                  <span className="hidden text-sm tabular-nums text-muted-foreground md:block">
                    {(playsByTrack.get(track.id) ?? 0).toLocaleString()}
                  </span>
                  <span className="hidden truncate text-sm text-muted-foreground md:block">
                    {track.genre ?? '—'}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatTime(track.duration_seconds ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
