'use client';

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Loader2,
  Music2,
  ListMusic,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useLikedTrackIds, useToggleLike } from '@/hooks/use-producer';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { RepeatMode } from '@/lib/types';

function RepeatIcon({ mode }: { mode: RepeatMode }) {
  if (mode === 'single') return <Repeat1 className="h-4 w-4" />;
  return <Repeat className="h-4 w-4" />;
}

function VolumeIcon({ volume, muted }: { volume: number; muted: boolean }) {
  if (muted || volume === 0) return <VolumeX className="h-5 w-5" />;
  if (volume < 0.5) return <Volume1 className="h-5 w-5" />;
  return <Volume2 className="h-5 w-5" />;
}

export function PlayerBar({
  nowPlayingOpen = false,
  onToggleNowPlaying,
}: {
  nowPlayingOpen?: boolean;
  onToggleNowPlaying?: () => void;
}) {
  const currentTrack = useAudioPlayer((s) => s.currentTrack);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);
  const isBuffering = useAudioPlayer((s) => s.isBuffering);
  const currentTime = useAudioPlayer((s) => s.currentTime);
  const duration = useAudioPlayer((s) => s.duration);
  const buffered = useAudioPlayer((s) => s.buffered);
  const volume = useAudioPlayer((s) => s.volume);
  const muted = useAudioPlayer((s) => s.muted);
  const shuffle = useAudioPlayer((s) => s.shuffle);
  const repeat = useAudioPlayer((s) => s.repeat);
  const queue = useAudioPlayer((s) => s.queue);
  const { data: likedIds } = useLikedTrackIds();
  const toggleLike = useToggleLike();
  const isLiked = currentTrack ? likedIds?.has(currentTrack.id) ?? false : false;

  const togglePlay = useAudioPlayer((s) => s.togglePlay);
  const next = useAudioPlayer((s) => s.next);
  const previous = useAudioPlayer((s) => s.previous);
  const seek = useAudioPlayer((s) => s.seek);
  const setVolume = useAudioPlayer((s) => s.setVolume);
  const toggleMute = useAudioPlayer((s) => s.toggleMute);
  const toggleShuffle = useAudioPlayer((s) => s.toggleShuffle);
  const cycleRepeat = useAudioPlayer((s) => s.cycleRepeat);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;
  const hasTrack = Boolean(currentTrack);

  return (
    <footer
      className="fixed inset-x-0 z-40 border-t border-border bg-player/95 backdrop-blur-xl"
      style={{ bottom: 0 }}
      role="region"
      aria-label="Media player"
    >
      <div className="px-3 py-2 md:pb-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Mobile layout: single row with track + play, progress below */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            {hasTrack ? (
              <>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentTrack!.cover_art_url}
                    alt=""
                    className={cn(
                      'h-full w-full object-cover transition-transform duration-500',
                      isPlaying && 'scale-105',
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{currentTrack!.title}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{currentTrack!.artist}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary">
                  <Music2 className="h-4 w-4" />
                </div>
                <p className="text-xs">Nothing playing</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={previous}
            disabled={!hasTrack}
            aria-label="Previous track"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90"
            onClick={togglePlay}
            disabled={!hasTrack}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-0.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={next}
            disabled={!hasTrack}
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile progress bar */}
        {hasTrack && (
          <div className="mt-1.5 flex items-center gap-2 md:hidden">
            <span className="w-8 text-right text-[10px] tabular-nums text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            <SeekSlider
              progress={progress}
              bufferedPct={bufferedPct}
              duration={duration}
              disabled={!hasTrack}
              onSeek={(pct) => seek((pct / 100) * duration)}
            />
            <span className="w-8 text-[10px] tabular-nums text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Desktop layout: 3 columns */}
        <div className="hidden grid-cols-3 items-center gap-3 py-1 md:grid">
          {/* Track info */}
          <div className="flex min-w-0 items-center gap-3">
            {hasTrack ? (
              <>
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentTrack!.cover_art_url}
                    alt=""
                    className={cn(
                      'h-full w-full object-cover transition-transform duration-500',
                      isPlaying && 'scale-105',
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{currentTrack!.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentTrack!.artist}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'hidden h-8 w-8 shrink-0 hover:text-primary sm:inline-flex',
                    isLiked ? 'text-primary' : 'text-muted-foreground',
                  )}
                  onClick={() => currentTrack && toggleLike.mutate({ trackId: currentTrack.id, liked: isLiked })}
                  aria-label={isLiked ? 'Unlike track' : 'Like track'}
                >
                  <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-secondary">
                  <Music2 className="h-5 w-5" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">Nothing playing</p>
                  <p className="text-xs">Select a track to begin</p>
                </div>
              </div>
            )}
          </div>

          {/* Center controls */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'hidden h-8 w-8 text-muted-foreground hover:text-foreground sm:inline-flex',
                  shuffle && 'text-primary hover:text-primary',
                )}
                onClick={toggleShuffle}
                aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
                aria-pressed={shuffle}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={previous}
                disabled={!hasTrack}
                aria-label="Previous track"
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full bg-foreground text-background hover:bg-foreground/90"
                onClick={togglePlay}
                disabled={!hasTrack}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isBuffering ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 translate-x-0.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
                onClick={next}
                disabled={!hasTrack}
                aria-label="Next track"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'hidden h-8 w-8 text-muted-foreground hover:text-foreground sm:inline-flex',
                  repeat !== 'off' && 'text-primary hover:text-primary',
                )}
                onClick={cycleRepeat}
                aria-label={`Repeat: ${repeat}`}
                aria-pressed={repeat !== 'off'}
              >
                <RepeatIcon mode={repeat} />
              </Button>
            </div>

            {/* Progress / seek bar */}
            <div className="flex w-full max-w-xl items-center gap-2">
              <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <SeekSlider
                progress={progress}
                bufferedPct={bufferedPct}
                duration={duration}
                disabled={!hasTrack}
                onSeek={(pct) => seek((pct / 100) * duration)}
              />
              <span className="w-10 text-[11px] tabular-nums text-muted-foreground">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume + Queue + Now Playing toggle */}
          <div className="flex items-center justify-end gap-2">
            <QueueSheet queue={queue} />
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'hidden h-8 w-8 text-muted-foreground hover:text-foreground lg:inline-flex',
                nowPlayingOpen && 'text-primary',
              )}
              onClick={onToggleNowPlaying}
              aria-label={nowPlayingOpen ? 'Hide now playing' : 'Show now playing'}
            >
              {nowPlayingOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon volume={volume} muted={muted} />
            </Button>
            <div className="hidden w-28 sm:block lg:w-32">
              <Slider
                value={[muted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume((value[0] ?? 0) / 100)}
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface SeekSliderProps {
  progress: number;
  bufferedPct: number;
  duration: number;
  disabled: boolean;
  onSeek: (pct: number) => void;
}

function SeekSlider({ progress, bufferedPct, duration, disabled, onSeek }: SeekSliderProps) {
  const seekValue = duration > 0 ? progress : 0;

  return (
    <div className="group relative flex-1">
      <Slider
        value={[seekValue]}
        max={100}
        step={0.1}
        disabled={disabled}
        onValueChange={(value) => onSeek(value[0] ?? 0)}
        aria-label="Seek"
        className="h-1.5"
      />
      <div
        className="pointer-events-none absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted-foreground/30"
        style={{ width: `${Math.min(100, Math.max(0, bufferedPct))}%` }}
      />
    </div>
  );
}

function QueueSheet({ queue }: { queue: import('@/lib/types').Track[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 text-muted-foreground hover:text-foreground md:inline-flex"
          aria-label="Open queue"
        >
          <ListMusic className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 border-border bg-card">
        <SheetTitle className="px-4 pt-4">Up Next</SheetTitle>
        <div className="px-2 pb-4">
          {queue.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Your queue is empty.
            </p>
          ) : (
            <ul className="space-y-1">
              {queue.map((track, i) => (
                <li
                  key={`${track.id}-${i}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={track.cover_art_url}
                    alt=""
                    className="h-9 w-9 rounded object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{track.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
