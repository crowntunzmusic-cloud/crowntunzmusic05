'use client';

import { useMemo } from 'react';
import { ListMusic } from 'lucide-react';
import { useTracks, usePlaylists } from '@/hooks/use-tracks';
import { AlbumCard } from '@/components/tracks/album-card';
import Link from 'next/link';

export default function LibraryPage() {
  const { data: tracks } = useTracks();
  const { data: playlists } = usePlaylists();

  const albums = useMemo(() => {
    const map = new Map();
    for (const track of tracks ?? []) {
      if (!track.album) continue;
      const key = `${track.album}::${track.artist}`;
      const existing = map.get(key);
      if (existing) existing.tracks.push(track);
      else
        map.set(key, {
          id: key,
          title: track.album,
          artist: track.artist,
          cover_art_url: track.cover_art_url,
          release_year: track.release_year,
          tracks: [track],
        });
    }
    return Array.from(map.values());
  }, [tracks]);

  return (
    <div className="space-y-8 pt-4 animate-fade-in">
      <header className="flex items-center gap-3">
        <ListMusic className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Library</h1>
          <p className="text-sm text-muted-foreground">Albums and playlists you can return to.</p>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Playlists
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {playlists?.map((pl) => (
            <Link
              key={pl.id}
              href={`/playlist/${pl.id}`}
              className="group flex flex-col gap-3 rounded-lg bg-card/60 p-3 transition-all duration-300 hover:bg-card hover:shadow-lg hover:shadow-black/30 hover:-translate-y-1"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pl.cover_art_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{pl.title}</p>
                <p className="truncate text-sm text-muted-foreground">{pl.track_ids.length} tracks</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Albums
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      </section>
    </div>
  );
}
