'use client';

import { Play } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import type { Album } from '@/lib/types';

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  const playQueue = useAudioPlayer((s) => s.playQueue);
  const currentTrack = useAudioPlayer((s) => s.currentTrack);

  const isPlayingAlbum = currentTrack
    ? album.tracks.some((t) => t.id === currentTrack.id)
    : false;

  return (
    <button
      type="button"
      onClick={() => playQueue(album.tracks, 0)}
      className="group relative flex w-full flex-col gap-3 rounded-lg bg-card/60 p-3 text-left transition-all duration-300 hover:bg-card hover:shadow-lg hover:shadow-black/30 hover:-translate-y-1"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-secondary shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={album.cover_art_url}
          alt={`${album.title} cover`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="absolute bottom-2 right-2 grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-xl transition-all duration-300 group-hover:bottom-3 group-hover:opacity-100"
          aria-hidden={!isPlayingAlbum}
        >
          <Play className="h-5 w-5 translate-x-0.5" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold">{album.title}</p>
        <p className="truncate text-sm text-muted-foreground">{album.artist}</p>
      </div>
    </button>
  );
}
