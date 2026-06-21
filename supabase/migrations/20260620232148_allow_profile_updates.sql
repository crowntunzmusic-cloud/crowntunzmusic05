-- Allow settings page to update user_profiles (no real auth in demo).
CREATE POLICY "profiles_auth_write" ON user_profiles
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "profiles_auth_update" ON user_profiles
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);