-- Producer/artist account schema for Pulse streaming app.
-- Adds an `is_beat` flag to tracks so beats reuse the existing audio pipeline,
-- plus dedicated tables for the producer dashboard entities.

-- Existing tracks table gains a producer-facing flag + owner link.
ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS is_beat boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS bpm integer,
  ADD COLUMN IF NOT EXISTS key_signature text,
  ADD COLUMN IF NOT EXISTS license text,
  ADD COLUMN IF NOT EXISTS owner_id uuid;

-- Beats: producer-priced instrumentals that can be purchased / licensed.
CREATE TABLE IF NOT EXISTS beats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  producer text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  genre text,
  is_exclusive boolean NOT NULL DEFAULT false,
  plays integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Uploads: producer's submitted work (audio + artwork metadata, pre-publish).
CREATE TABLE IF NOT EXISTS uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  audio_url text NOT NULL,
  cover_art_url text NOT NULL,
  duration_seconds integer,
  genre text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Analytics events: immutable stream of plays, completes, skips, likes.
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  country text,
  device text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- Revenue: per-transaction earnings lines for the producer.
CREATE TABLE IF NOT EXISTS revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE SET NULL,
  source text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

-- Comments: feedback left on tracks by listeners.
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  author text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Messages: direct conversations between producers and collaborators/listeners.
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender text NOT NULL,
  recipient text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Collaborations: joint work invitations/links between producers.
CREATE TABLE IF NOT EXISTS collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  collaborator text NOT NULL,
  role text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Promotions: marketing campaigns a producer runs on a track.
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE SET NULL,
  name text NOT NULL,
  budget_cents integer NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  clicks integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Distribution: third-party store/delivery deals for a track.
CREATE TABLE IF NOT EXISTS distribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES tracks(id) ON DELETE SET NULL,
  store text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Followers: producer's audience.
CREATE TABLE IF NOT EXISTS followers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL,
  display_name text,
  avatar_url text,
  followed_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications: inbox of system + social events.
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  body text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS everywhere (no-op if already enabled on tracks).
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Catalog + public analytics are read-only to anon/authenticated.
CREATE POLICY "beats_public_read" ON beats FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "uploads_public_read" ON uploads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "analytics_public_read" ON analytics_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "revenue_public_read" ON revenue FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "comments_public_read" ON comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "messages_public_read" ON messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "collabs_public_read" ON collaborations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "promos_public_read" ON promotions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "distribution_public_read" ON distribution FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "followers_public_read" ON followers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "notifications_public_read" ON notifications FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS beats_track_id_idx ON beats (track_id);
CREATE INDEX IF NOT EXISTS analytics_track_idx ON analytics_events (track_id);
CREATE INDEX IF NOT EXISTS analytics_type_idx ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_occurred_idx ON analytics_events (occurred_at);
CREATE INDEX IF NOT EXISTS revenue_track_idx ON revenue (track_id);
CREATE INDEX IF NOT EXISTS revenue_occurred_idx ON revenue (occurred_at);
CREATE INDEX IF NOT EXISTS comments_track_idx ON comments (track_id);
CREATE INDEX IF NOT EXISTS messages_thread_idx ON messages (thread_id);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON notifications (read_at);
