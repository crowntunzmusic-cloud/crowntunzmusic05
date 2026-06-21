'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { mockAlbums, mockPlaylists, mockTracks } from '@/lib/mock-data';
import type { Album, Playlist, Track } from '@/lib/types';

export const tracksKeys = {
  all: ['tracks'] as const,
  list: () => [...tracksKeys.all, 'list'] as const,
  detail: (id: string) => [...tracksKeys.all, 'detail', id] as const,
  albums: () => [...tracksKeys.all, 'albums'] as const,
  playlists: () => [...tracksKeys.all, 'playlists'] as const,
};

async function fetchTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Track[]) ?? [];
}

async function fetchTrackById(id: string): Promise<Track | null> {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as Track) ?? null;
}

function groupAlbums(tracks: Track[]): Album[] {
  const map = new Map<string, Album>();
  for (const track of tracks) {
    if (!track.album) continue;
    const key = `${track.album}::${track.artist}`;
    const existing = map.get(key);
    if (existing) {
      existing.tracks.push(track);
    } else {
      map.set(key, {
        id: key,
        title: track.album,
        artist: track.artist,
        cover_art_url: track.cover_art_url,
        release_year: track.release_year,
        tracks: [track],
      });
    }
  }
  return Array.from(map.values());
}

export function useTracks() {
  return useQuery<Track[], Error>({
    queryKey: tracksKeys.list(),
    queryFn: async () => {
      try {
        return await fetchTracks();
      } catch (err) {
        console.warn('[tracks] Supabase fetch failed, falling back to mock dataset:', err);
        return mockTracks;
      }
    },
    placeholderData: () => mockTracks,
  });
}

export function useTrack(id: string | null | undefined) {
  return useQuery<Track | null, Error>({
    queryKey: tracksKeys.detail(id ?? 'null'),
    queryFn: () => (id ? fetchTrackById(id) : Promise.resolve(null)),
    enabled: Boolean(id),
  });
}

export function useAlbums() {
  return useQuery<Album[], Error>({
    queryKey: tracksKeys.albums(),
    queryFn: async () => {
      try {
        const tracks = await fetchTracks();
        return groupAlbums(tracks);
      } catch (err) {
        console.warn('[albums] Supabase fetch failed, falling back to mock dataset:', err);
        return mockAlbums;
      }
    },
    placeholderData: () => mockAlbums,
  });
}

export function usePlaylists() {
  return useQuery<Playlist[], Error>({
    queryKey: tracksKeys.playlists(),
    queryFn: async () => mockPlaylists,
    staleTime: Infinity,
  });
}

export function useTracksByIds(ids: string[]) {
  const { data: allTracks } = useTracks();
  if (!allTracks) return [];
  const byId = new Map(allTracks.map((t) => [t.id, t]));
  return ids.map((id) => byId.get(id)).filter((t): t is Track => Boolean(t));
}
