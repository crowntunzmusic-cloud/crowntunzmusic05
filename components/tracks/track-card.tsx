'use client';

import { Play, Heart } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { useLikedTrackIds, useToggleLike } from '@/hooks/use-producer';
import type { Track } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const playTrack = useAudioPlayer((s) => s.playTrack);
  const currentTrack = useAudioPlayer((s) => s.currentTrack);
  const isPlaying = useAudioPlayer((s) => s.isPlaying);
  const { data: likedIds } = useLikedTrackIds();
  const toggleLike = useToggleLike();
  const isLiked = likedIds?.has(track.id) ?? false;

  const isActive = currentTrack?.id === track.id;

  return (
    <div className="group relative flex w-full flex-col gap-3 rounded-lg bg-card/60 p-3 transition-all duration-300 hover:bg-card hover:shadow-lg hover:shadow-black/30 hover:-translate-y-1">
      <button
        type="button"
        onClick={() => playTrack(track)}
        className="relative aspect-square w-full overflow-hidden rounded-md bg-secondary shadow-md"
        aria-label={`Play ${track.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.cover_art_url}
          alt={`${track.title} cover`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="absolute bottom-2 right-2 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl transition-all duration-300 group-hover:bottom-3 group-hover:opacity-100"
          aria-hidden
        >
          <Play className="h-5 w-5 translate-x-0.5" />
        </span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleLike.mutate({ trackId: track.id, liked: isLiked });
        }}
        className={cn(
          'absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/40 backdrop-blur-sm opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-black/60',
          isLiked && 'opacity-100 text-primary',
        )}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <Heart className={cn('h-4 w-4', isLiked && 'fill-current text-primary')} />
      </button>
      <div className="min-w-0">
        <p className={cn('truncate font-semibold', isActive && 'text-primary')}>{track.title}</p>
        <p className="truncate text-sm text-muted-foreground">{track.artist}</p>
        {isActive && isPlaying && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-primary">
            <span className="flex h-3 items-end gap-0.5" aria-hidden>
              <span className="h-2 w-0.5 animate-equalize bg-primary" style={{ animationDelay: '0ms' }} />
              <span className="h-2 w-0.5 animate-equalize bg-primary" style={{ animationDelay: '150ms' }} />
              <span className="h-2 w-0.5 animate-equalize bg-primary" style={{ animationDelay: '300ms' }} />
            </span>
            Now playing
          </span>
        )}
      </div>
    </div>
  );
}
