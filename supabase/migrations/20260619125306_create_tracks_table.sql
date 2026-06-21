-- Tracks table for the audio streaming app
CREATE TABLE IF NOT EXISTS tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  album text,
  audio_url text NOT NULL,
  cover_art_url text NOT NULL,
  duration_seconds integer,
  genre text,
  release_year integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed a baseline tracks catalog (public domain / SoundHelix samples + Pexels cover art)
INSERT INTO tracks (id, title, artist, album, audio_url, cover_art_url, duration_seconds, genre, release_year) VALUES
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a01', 'Midnight Drive', 'Lunar Echo', 'Neon Horizons', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600', 372, 'Synthwave', 2023),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a02', 'Velvet Skyline', 'Lunar Echo', 'Neon Horizons', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.pexels.com/photos/206359/pexels-photo-206359.jpeg?auto=compress&cs=tinysrgb&w=600', 426, 'Synthwave', 2023),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a03', 'Glass Horizons', 'Aria Vance', 'Solace', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.pexels.com/photos/242491/pexels-photo-242491.jpeg?auto=compress&cs=tinysrgb&w=600', 348, 'Ambient', 2022),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a04', 'Tidal Memory', 'Aria Vance', 'Solace', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://images.pexels.com/photos/325461/pexels-photo-325461.jpeg?auto=compress&cs=tinysrgb&w=600', 405, 'Ambient', 2022),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a05', 'Concrete Bloom', 'The Static Hour', 'Iron Lung', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=600', 391, 'Post-Rock', 2024),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a06', 'Northern Frame', 'The Static Hour', 'Iron Lung', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=600', 419, 'Post-Rock', 2024),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a07', 'Soft Architecture', 'Mara Linde', 'Quiet Geometry', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=600', 367, 'Downtempo', 2023),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a08', 'Paper Lantern', 'Mara Linde', 'Quiet Geometry', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://images.pexels.com/photos/258382/pexels-photo-258382.jpeg?auto=compress&cs=tinysrgb&w=600', 385, 'Downtempo', 2023),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a09', 'Cobalt Hours', 'Kestrel', 'Long Way Home', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://images.pexels.com/photos/373562/pexels-photo-373562.jpeg?auto=compress&cs=tinysrgb&w=600', 401, 'Indie', 2024),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a10', 'Salt & Static', 'Kestrel', 'Long Way Home', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'https://images.pexels.com/photos/485798/pexels-photo-485798.jpeg?auto=compress&cs=tinysrgb&w=600', 415, 'Indie', 2024),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a11', 'Paper Engines', 'Folio', 'Margin Notes', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 'https://images.pexels.com/photos/1626481/pexels-photo-1626481.jpeg?auto=compress&cs=tinysrgb&w=600', 395, 'Folk', 2022),
  ('c10a3f9a-1b2c-4d3e-8a9f-1c2d3e4f5a12', 'Bright Avenues', 'Folio', 'Margin Notes', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 'https://images.pexels.com/photos/210887/pexels-photo-210887.jpeg?auto=compress&cs=tinysrgb&w=600', 425, 'Folk', 2022)
ON CONFLICT (id) DO NOTHING;

-- RLS: catalog is read by anyone; writes are admin-only via service role
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tracks_public_read" ON tracks FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "tracks_admin_insert" ON tracks FOR INSERT
  TO authenticated WITH CHECK (false);

CREATE POLICY "tracks_admin_update" ON tracks FOR UPDATE
  TO authenticated USING (false) WITH CHECK (false);

CREATE POLICY "tracks_admin_delete" ON tracks FOR DELETE
  TO authenticated USING (false);

CREATE INDEX IF NOT EXISTS tracks_genre_idx ON tracks (genre);
CREATE INDEX IF NOT EXISTS tracks_artist_idx ON tracks (artist);
