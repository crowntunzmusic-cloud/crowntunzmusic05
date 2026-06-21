import type { Album, Playlist, Track } from '@/lib/types';

const CLOUDFLARE_R2_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL;

export const ASSET_BASE_URL = CLOUDFLARE_R2_URL ?? '';

const art = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;

const audio = (n: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

/**
 * Isolated mock module used by the React Query layer when the Supabase
 * catalog is unreachable or for local development. The shape mirrors the
 * `tracks` table schema so both sources are interchangeable.
 */
export const mockTracks: Track[] = [
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a01',
    title: 'Midnight Drive',
    artist: 'Lunar Echo',
    album: 'Neon Horizons',
    audio_url: audio(1),
    cover_art_url: art(1763075),
    duration_seconds: 372,
    genre: 'Synthwave',
    release_year: 2023,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a02',
    title: 'Velvet Skyline',
    artist: 'Lunar Echo',
    album: 'Neon Horizons',
    audio_url: audio(2),
    cover_art_url: art(206359),
    duration_seconds: 426,
    genre: 'Synthwave',
    release_year: 2023,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a03',
    title: 'Glass Horizons',
    artist: 'Aria Vance',
    album: 'Solace',
    audio_url: audio(3),
    cover_art_url: art(242491),
    duration_seconds: 348,
    genre: 'Ambient',
    release_year: 2022,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a04',
    title: 'Tidal Memory',
    artist: 'Aria Vance',
    album: 'Solace',
    audio_url: audio(4),
    cover_art_url: art(325461),
    duration_seconds: 405,
    genre: 'Ambient',
    release_year: 2022,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a05',
    title: 'Concrete Bloom',
    artist: 'The Static Hour',
    album: 'Iron Lung',
    audio_url: audio(5),
    cover_art_url: art(1389429),
    duration_seconds: 391,
    genre: 'Post-Rock',
    release_year: 2024,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a06',
    title: 'Northern Frame',
    artist: 'The Static Hour',
    album: 'Iron Lung',
    audio_url: audio(6),
    cover_art_url: art(268533),
    duration_seconds: 419,
    genre: 'Post-Rock',
    release_year: 2024,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a07',
    title: 'Soft Architecture',
    artist: 'Mara Linde',
    album: 'Quiet Geometry',
    audio_url: audio(7),
    cover_art_url: art(164743),
    duration_seconds: 367,
    genre: 'Downtempo',
    release_year: 2023,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a08',
    title: 'Paper Lantern',
    artist: 'Mara Linde',
    album: 'Quiet Geometry',
    audio_url: audio(8),
    cover_art_url: art(258382),
    duration_seconds: 385,
    genre: 'Downtempo',
    release_year: 2023,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a09',
    title: 'Cobalt Hours',
    artist: 'Kestrel',
    album: 'Long Way Home',
    audio_url: audio(9),
    cover_art_url: art(373562),
    duration_seconds: 401,
    genre: 'Indie',
    release_year: 2024,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a10',
    title: 'Salt & Static',
    artist: 'Kestrel',
    album: 'Long Way Home',
    audio_url: audio(10),
    cover_art_url: art(485798),
    duration_seconds: 415,
    genre: 'Indie',
    release_year: 2024,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a11',
    title: 'Paper Engines',
    artist: 'Folio',
    album: 'Margin Notes',
    audio_url: audio(11),
    cover_art_url: art(1626481),
    duration_seconds: 395,
    genre: 'Folk',
    release_year: 2022,
  },
  {
    id: 'c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a12',
    title: 'Bright Avenues',
    artist: 'Folio',
    album: 'Margin Notes',
    audio_url: audio(12),
    cover_art_url: art(210887),
    duration_seconds: 425,
    genre: 'Folk',
    release_year: 2022,
  },
];

export const mockAlbums: Album[] = Array.from(
  mockTracks.reduce((map, track) => {
    if (!track.album) return map;
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
    return map;
  }, new Map<string, Album>()),
  ([, album]) => album,
);

export const mockPlaylists: Playlist[] = [
  {
    id: 'pl-focus-mornings',
    title: 'Focus Mornings',
    description: 'Gentle cues to ease into the day.',
    cover_art_url: art(164743),
    track_ids: mockTracks
      .filter((t) => t.genre === 'Downtempo' || t.genre === 'Ambient')
      .map((t) => t.id),
  },
  {
    id: 'pl-night-drive',
    title: 'Night Drive',
    description: 'Synthwave pulses for open roads after dark.',
    cover_art_url: art(1763075),
    track_ids: mockTracks.filter((t) => t.genre === 'Synthwave').map((t) => t.id),
  },
  {
    id: 'pl-deep-listening',
    title: 'Deep Listening',
    description: 'Post-rock and ambient slow burners.',
    cover_art_url: art(1389429),
    track_ids: mockTracks
      .filter((t) => t.genre === 'Post-Rock' || t.genre === 'Indie')
      .map((t) => t.id),
  },
];
