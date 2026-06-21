'use client';

import { Play, Pause, Loader2 } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { cn } from '@/lib/utils';
import type { Track } from '@/lib/types';
import { formatTime } from '@/lib/format';

interface TrackRowProps {
  track: Track;
  index: number;
  queue?: Track[];
  showAlbum?: boolean;
}

export function TrackRow({ track, index, queue, showAlbum = true }: TrackRowProps) {
  const currentTrack = useAudioPlayer((s) => s.currentTrack);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);
  const isBuffering = useAudioPlayer((s) => s.isBuffering);
  const playTrack = useAudioPlayer((s) => s.playTrack);
  const togglePlay = useAudioPlayer((s) => s.togglePlay);

  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track, queue);
    }
  };

  return (
    <div
      className={cn(
        'group grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary/60 md:grid-cols-[2rem_4fr_3fr_1fr_auto]',
        isActive && 'bg-secondary/40',
      )}
    >
      <button
        type="button"
        onClick={handlePlay}
        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-transform hover:scale-110 hover:text-foreground"
        aria-label={isActive && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
      >
        {isActive && isBuffering ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : isActive && isPlaying ? (
          <Pause className="h-4 w-4 text-primary" />
        ) : (
          <>
            <span className="text-sm tabular-nums group-hover:hidden">{index + 1}</span>
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
          <p
            className={cn(
              'truncate text-sm font-medium',
              isActive && 'text-primary',
            )}
          >
            {track.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
        </div>
      </div>

      {showAlbum && (
        <p className="hidden truncate text-sm text-muted-foreground md:block">
          {track.album ?? '—'}
        </p>
      )}

      <span className="hidden text-sm tabular-nums text-muted-foreground md:block">
        {track.genre ?? '—'}
      </span>

      <span className="text-sm tabular-nums text-muted-foreground">
        {formatTime(track.duration_seconds ?? 0)}
      </span>
    </div>
  );
}
