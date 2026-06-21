-- Lyrics songwriter + track upload tiers + admin platform-controls layer.

-- Extend tracks with ownership + tier info so free beats vs full-owned tracks
-- carry different distribution rules.
ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS ownership_type text NOT NULL DEFAULT 'full'
    CHECK (ownership_type IN ('full', 'beat_license')),
  ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free'
    CHECK (tier IN ('free', 'premium')),
  ADD COLUMN IF NOT EXISTS download_type text NOT NULL DEFAULT 'free_download'
    CHECK (download_type IN ('free_download', 'paid_purchase', 'streaming_only')),
  ADD COLUMN IF NOT EXISTS price_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS distribution_eligible boolean NOT NULL DEFAULT true;

-- Generated lyrics saved by the songwriter tool.
CREATE TABLE IF NOT EXISTS generated_lyrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  genre text,
  mood text,
  structure text,
  body text NOT NULL,
  author text NOT NULL DEFAULT 'Pulse Studio',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Platform-wide settings the super admin controls from the admin dashboard.
-- A single-row table holding the global knobs.
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploads_enabled boolean NOT NULL DEFAULT true,
  submit_track_approval boolean NOT NULL DEFAULT false,
  monthly_upload_limit integer NOT NULL DEFAULT 10,
  free_beats_global_distribution boolean NOT NULL DEFAULT false,
  lyrics_tool_enabled boolean NOT NULL DEFAULT true,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert the single default row (id fixed for easy lookups).
INSERT INTO platform_settings (id, uploads_enabled, submit_track_approval, monthly_upload_limit)
VALUES ('00000000-0000-0000-0000-000000000001', true, false, 10)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE generated_lyrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lyrics_public_read" ON generated_lyrics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "lyrics_auth_write" ON generated_lyrics FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "settings_public_read" ON platform_settings FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS lyrics_created_idx ON generated_lyrics (created_at DESC);
