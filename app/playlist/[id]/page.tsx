'use client';

import { useMemo } from 'react';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { Play, Clock3 } from 'lucide-react';
import { usePlaylists, useTracksByIds, useTracks } from '@/hooks/use-tracks';
import { TrackRow } from '@/components/tracks/track-row';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { formatTime } from '@/lib/format';
import type { Track } from '@/lib/types';

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: playlists } = usePlaylists();
  const playlist = playlists?.find((p) => p.id === id);

  const resolvedTracks = useTracksByIds(playlist?.track_ids ?? []);
  const { data: allTracks } = useTracks();

  const tracks: Track[] = useMemo(() => {
    if (resolvedTracks.length > 0) return resolvedTracks;
    if (!allTracks || !playlist) return [];
    return allTracks.filter((t) => playlist.track_ids.includes(t.id));
  }, [resolvedTracks, allTracks, playlist]);

  const playQueue = useAudioPlayer((s) => s.playQueue);
  const totalSeconds = tracks.reduce((sum, t) => sum + (t.duration_seconds ?? 0), 0);

  if (!playlist) {
    if (playlists && !playlist) notFound();
    return null;
  }

  return (
    <div className="animate-fade-in">
      <header className="relative flex flex-col gap-4 p-6 md:flex-row md:items-end md:p-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={playlist.cover_art_url} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={playlist.cover_art_url}
          alt={playlist.title}
          className="h-40 w-40 shrink-0 rounded-lg object-cover shadow-2xl md:h-48 md:w-48"
        />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Playlist
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{playlist.title}</h1>
          <p className="text-sm text-muted-foreground">{playlist.description}</p>
          <p className="text-xs text-muted-foreground">
            {tracks.length} tracks · {formatTime(totalSeconds)}
          </p>
        </div>
      </header>

      <div className="px-4 md:px-8">
        {tracks.length > 0 && (
          <button
            type="button"
            onClick={() => playQueue(tracks as Track[], 0)}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            <Play className="h-5 w-5 translate-x-0.5" />
            Play
          </button>
        )}

        <div className="mb-2 grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-border pb-2 text-xs uppercase tracking-wide text-muted-foreground md:grid-cols-[2rem_4fr_3fr_1fr_auto]">
          <span className="text-center">#</span>
          <span>Title</span>
          <span className="hidden md:block">Album</span>
          <span className="hidden md:block">Genre</span>
          <span className="text-right">
            <Clock3 className="h-4 w-4" />
          </span>
        </div>

        <div className="rounded-xl bg-card/30 p-2">
          {tracks.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">No tracks in this playlist yet.</p>
          ) : (
            tracks.map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} queue={tracks as Track[]} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
