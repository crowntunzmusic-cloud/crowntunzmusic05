-- Add notification preferences + avatar URL to user_profiles for the Settings page.
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS notification_prefs jsonb NOT NULL DEFAULT '{"plays": true, "comments": true, "revenue": true, "followers": false, "weekly": true}'::jsonb;