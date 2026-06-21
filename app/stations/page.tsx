'use client';

import { Radio } from 'lucide-react';
import { useTracks } from '@/hooks/use-tracks';
import { TrackCard } from '@/components/tracks/track-card';

const stations = [
  { id: 'chill', name: 'Chill Vibes', genre: 'Ambient' },
  { id: 'focus', name: 'Deep Focus', genre: 'Downtempo' },
  { id: 'night-drive', name: 'Night Drive', genre: 'Synthwave' },
  { id: 'indie', name: 'Indie Hour', genre: 'Indie' },
];

export default function StationsPage() {
  const { data: tracks } = useTracks();

  return (
    <div className="space-y-8 pt-4 animate-fade-in">
      <header className="flex items-center gap-3">
        <Radio className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Radio Stations</h1>
          <p className="text-sm text-muted-foreground">Genre-based mixes, generated from the catalog.</p>
        </div>
      </header>

      <div className="space-y-8">
        {stations.map((station) => {
          const stationTracks = (tracks ?? []).filter((t) => t.genre === station.genre);
          return (
            <section key={station.id} className="space-y-4">
              <h2 className="text-lg font-semibold">{station.name}</h2>
              {stationTracks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tracks available for this station.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {stationTracks.map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
