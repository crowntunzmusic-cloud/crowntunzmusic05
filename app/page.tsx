'use client';

import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { useTracks, usePlaylists } from '@/hooks/use-tracks';
import { TrackCard } from '@/components/tracks/track-card';
import { AlbumCard } from '@/components/tracks/album-card';
import { TrackRow } from '@/components/tracks/track-row';
import { SectionScroller, ScrollCard } from '@/components/tracks/section-scroller';
import { Skeleton } from '@/components/ui/skeleton';
import type { Album, Track } from '@/lib/types';

export default function HomePage() {
  const { data: tracks, isLoading: tracksLoading } = useTracks();
  const { data: playlists } = usePlaylists();

  const featured = useMemo(() => (tracks ?? []).slice(0, 6), [tracks]);
  const trending = useMemo(() => (tracks ?? []).slice(6, 12), [tracks]);

  const albums = useMemo<Album[]>(() => {
    const base = featured.concat(trending);
    const map = new Map<string, Album>();
    for (const track of base) {
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
  }, [featured, trending]);

  const heroTrack = playlists?.[0];

  return (
    <div className="space-y-8 pt-4 animate-fade-in">
      {heroTrack && (
        <section className="relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={heroTrack.cover_art_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="relative flex flex-col gap-4 p-6 md:p-10">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Featured Playlist
            </span>
            <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
              {heroTrack.title}
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground md:text-base">{heroTrack.description}</p>
          </div>
        </section>
      )}

      <SectionScroller title="Featured tracks">
        {tracksLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <ScrollCard key={`s-${i}`}>
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </ScrollCard>
            ))
          : featured.map((track) => (
              <ScrollCard key={track.id}>
                <TrackCard track={track} />
              </ScrollCard>
            ))}
      </SectionScroller>

      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight md:text-2xl">Browse albums</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {tracksLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={`a-${i}`}>
                  <Skeleton className="aspect-square w-full rounded-md" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              ))
            : albums.map((album) => <AlbumCard key={album.id} album={album} />)}
        </div>
      </section>

      <SectionScroller title="Trending now">
        {trending.map((track) => (
          <ScrollCard key={track.id}>
            <TrackCard track={track} />
          </ScrollCard>
        ))}
      </SectionScroller>

      {tracks && tracks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight md:text-2xl">All tracks</h2>
          <div className="rounded-xl bg-card/40 p-2">
            {tracks.map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} queue={tracks as Track[]} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
