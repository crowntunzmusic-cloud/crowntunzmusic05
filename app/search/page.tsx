'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import { useTracks } from '@/hooks/use-tracks';
import { TrackRow } from '@/components/tracks/track-row';
import { TrackCard } from '@/components/tracks/track-card';
import type { Track } from '@/lib/types';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-4 text-sm text-muted-foreground">Loading search…</div>}>
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const searchParams = useSearchParams();
  const query = (searchParams?.get('q') ?? '').trim().toLowerCase();
  const { data: tracks } = useTracks();

  const results = useMemo<Track[]>(() => {
    if (!tracks) return [];
    if (!query) return tracks;
    return tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        (t.album?.toLowerCase().includes(query) ?? false) ||
        (t.genre?.toLowerCase().includes(query) ?? false),
    );
  }, [tracks, query]);

  return (
    <div className="space-y-6 pt-4 animate-fade-in">
      <header className="flex items-center gap-3">
        <SearchIcon className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">
          {query ? `Results for "${query}"` : 'Browse the catalog'}
        </h1>
      </header>

      {query && results.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Tracks
          </h2>
          <div className="rounded-xl bg-card/40 p-2">
            {results.map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} queue={results as Track[]} />
            ))}
          </div>
        </section>
      )}

      {query && results.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Quick play
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.slice(0, 12).map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground">
          <SearchIcon className="h-10 w-10" />
          <p className="text-lg font-semibold text-foreground">No results found</p>
          <p className="text-sm">Try a different song, artist, or album.</p>
        </div>
      )}

      {!query && tracks && tracks.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Everything
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
