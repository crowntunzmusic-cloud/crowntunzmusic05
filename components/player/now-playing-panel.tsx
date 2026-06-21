'use client';

import { useState } from 'react';
import { Play, Pause, Heart, X, ChevronRight, Music2, Loader2, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useLikedTrackIds, useToggleLike } from '@/hooks/use-producer';
import { cn } from '@/lib/utils';

interface NowPlayingPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NowPlayingPanel({ open, onClose }: NowPlayingPanelProps) {
  const currentTrack = useAudioPlayer((s) => s.currentTrack);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);
  const isBuffering = useAudioPlayer((s) => s.isBuffering);
  const togglePlay = useAudioPlayer((s) => s.togglePlay);
  const playTrack = useAudioPlayer((s) => s.playTrack);
  const queue = useAudioPlayer((s) => s.queue);
  const { data: likedIds } = useLikedTrackIds();
  const toggleLike = useToggleLike();
  const isLiked = currentTrack ? likedIds?.has(currentTrack.id) ?? false : false;

  const [tab, setTab] = useState<'now' | 'up-next'>('now');

  if (!open) return null;

  const hasTrack = Boolean(currentTrack);
  const upNext = queue.filter((t) => t.id !== currentTrack?.id).slice(0, 8);

  return (
    <aside className="hidden w-80 shrink-0 flex-col rounded-xl bg-sidebar/80 backdrop-blur xl:w-96 lg:flex">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Now Playing
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onClose}
          aria-label="Close now playing panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-1 px-4 pb-2">
        <button
          type="button"
          onClick={() => setTab('now')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            tab === 'now' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Now Playing
        </button>
        <button
          type="button"
          onClick={() => setTab('up-next')}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            tab === 'up-next' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Up Next
        </button>
      </div>

      <ScrollArea className="flex-1 px-4 pb-4">
        {tab === 'now' ? (
          hasTrack ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTrack!.cover_art_url}
                  alt={`${currentTrack!.title} cover`}
                  className={cn(
                    'aspect-square w-full object-cover transition-transform duration-700',
                    isPlaying && 'scale-105',
                  )}
                />
                {isPlaying && (
                  <div className="absolute bottom-3 left-3 flex items-end gap-0.5 rounded-full bg-black/50 px-2 py-1.5 backdrop-blur-sm">
                    <span className="h-3 w-0.5 animate-equalize rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
                    <span className="h-3 w-0.5 animate-equalize rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
                    <span className="h-3 w-0.5 animate-equalize rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
                    <span className="h-3 w-0.5 animate-equalize rounded-full bg-primary" style={{ animationDelay: '450ms' }} />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-bold leading-tight">{currentTrack!.title}</h4>
                <p className="text-sm text-muted-foreground">{currentTrack!.artist}</p>
                {currentTrack!.album && (
                  <p className="text-xs text-muted-foreground/70">From {currentTrack!.album}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5 rounded-full"
                  onClick={togglePlay}
                  disabled={!hasTrack}
                >
                  {isBuffering ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 translate-x-0.5" />
                  )}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'rounded-full',
                    isLiked && 'border-primary text-primary',
                  )}
                  onClick={() => currentTrack && toggleLike.mutate({ trackId: currentTrack.id, liked: isLiked })}
                  aria-label={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                </Button>
              </div>

              {currentTrack!.genre && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                    {currentTrack!.genre}
                  </span>
                  {currentTrack!.release_year && (
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                      {currentTrack!.release_year}
                    </span>
                  )}
                </div>
              )}

              <LyricsSection trackId={currentTrack!.id} trackTitle={currentTrack!.title} />
            </div>
          ) : (
            <EmptyNowPlaying />
          )
        ) : (
          <div className="space-y-1 pt-1">
            {upNext.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Your queue is empty.
              </p>
            ) : (
              upNext.map((track, i) => (
                <button
                  key={`${track.id}-${i}`}
                  type="button"
                  onClick={() => playTrack(track)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={track.cover_art_url}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{track.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}

function EmptyNowPlaying() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
        <Music2 className="h-7 w-7 text-muted-foreground" />
      </span>
      <div>
        <p className="text-sm font-medium">Nothing playing</p>
        <p className="text-xs text-muted-foreground">Select a track to begin</p>
      </div>
    </div>
  );
}

function LyricsSection({ trackId, trackTitle }: { trackId: string; trackTitle: string }) {
  const lyrics = useMockLyrics(trackId);
  const isLoading = lyrics === null;

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center gap-2">
        <Mic2 className="h-3.5 w-3.5 text-muted-foreground" />
        <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lyrics</h5>
      </div>
      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
      ) : (
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {lyrics}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground/60">Lyrics for &ldquo;{trackTitle}&rdquo;</p>
    </div>
  );
}

function useMockLyrics(trackId: string): string | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem(`lyrics-${trackId}`);
  if (stored !== null) return stored;
  if (!sessionStorage.getItem(`lyrics-loading-${trackId}`)) {
    sessionStorage.setItem(`lyrics-loading-${trackId}`, '1');
  }
  const lyrics = `In the rhythm of the night,
Every beat feels right,
Lost in the melody,
Crowntunz sets me free.

Through the highs and the lows,
Where the music flows,
We find our way back home,
In every note we roam.`;
  sessionStorage.setItem(`lyrics-${trackId}`, lyrics);
  return lyrics;
}
