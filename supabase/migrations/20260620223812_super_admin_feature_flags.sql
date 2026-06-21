-- Super admin layer for Pulse: user management + platform-wide feature flags + audit log.

-- User profiles: extends the auth user concept with a role + disable flag.
-- Mirrors Supabase auth.users via a text id so the demo can run without real auth.
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text,
  role text NOT NULL DEFAULT 'listener' CHECK (role IN ('listener','producer','admin','super_admin')),
  is_disabled boolean NOT NULL DEFAULT false,
  avatar_url text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz
);

-- Feature flags: super admin can flip these to enable/disable platform features.
-- `feature_key` maps 1:1 to the keys used by the FeatureFlagProvider in the client.
CREATE TABLE IF NOT EXISTS feature_flags (
  feature_key text PRIMARY KEY,
  label text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  is_enabled boolean NOT NULL DEFAULT true,
  updated_by text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log: every admin mutation (user disable/enable, feature toggle) is recorded.
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  target_label text,
  detail jsonb,
  performed_by text NOT NULL DEFAULT 'super_admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- All three are readable by anyone for this demo (in production, lock to admin role).
CREATE POLICY "profiles_public_read" ON user_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "flags_public_read" ON feature_flags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "audit_public_read" ON admin_audit_log FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS profiles_role_idx ON user_profiles (role);
CREATE INDEX IF NOT EXISTS profiles_disabled_idx ON user_profiles (is_disabled);
CREATE INDEX IF NOT EXISTS flags_category_idx ON feature_flags (category);
CREATE INDEX IF NOT EXISTS audit_created_idx ON admin_audit_log (created_at DESC);
