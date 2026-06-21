-- Production completion: liked tracks, follows, track submissions, help tickets.

-- Liked tracks: many-to-many between user (by email) and track.
CREATE TABLE IF NOT EXISTS liked_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_email, track_id)
);

-- Track submissions: when submit-approval is on, uploaded tracks enter this queue.
CREATE TABLE IF NOT EXISTS track_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitted_by text NOT NULL DEFAULT 'Pulse Studio',
  reviewed_by text,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Help tickets: submitted from the Help Center.
CREATE TABLE IF NOT EXISTS help_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  body text NOT NULL,
  submitted_by text NOT NULL DEFAULT 'Pulse Studio',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE liked_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "liked_public_read" ON liked_tracks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "liked_auth_write" ON liked_tracks FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "liked_auth_delete" ON liked_tracks FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "submissions_public_read" ON track_submissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "submissions_auth_write" ON track_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "submissions_auth_update" ON track_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "tickets_public_read" ON help_tickets FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tickets_auth_write" ON help_tickets FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS liked_user_idx ON liked_tracks (user_email);
CREATE INDEX IF NOT EXISTS submissions_status_idx ON track_submissions (status);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON help_tickets (status);

-- Allow notifications to be updated (mark as read).
CREATE POLICY "notifications_auth_update" ON notifications
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);