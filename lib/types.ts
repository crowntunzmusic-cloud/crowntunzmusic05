export type RepeatMode = 'off' | 'all' | 'single';

export type OwnershipType = 'full' | 'beat_license';
export type TrackTier = 'free' | 'premium';
export type DownloadType = 'free_download' | 'paid_purchase' | 'streaming_only';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  audio_url: string;
  cover_art_url: string;
  duration_seconds?: number;
  genre?: string;
  release_year?: number;
  created_at?: string;
  is_beat?: boolean;
  bpm?: number | null;
  key_signature?: string | null;
  license?: string | null;
  owner_id?: string | null;
  ownership_type?: OwnershipType;
  tier?: TrackTier;
  download_type?: DownloadType;
  price_cents?: number;
  distribution_eligible?: boolean;
}

export interface Beat {
  id: string;
  track_id: string;
  producer: string;
  price_cents: number;
  genre?: string | null;
  is_exclusive: boolean;
  plays: number;
  created_at?: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  cover_art_url: string;
  release_year?: number;
  tracks: Track[];
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  cover_art_url: string;
  track_ids: string[];
}

export type RepeatModeValue = RepeatMode;

export interface Upload {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_art_url: string;
  duration_seconds?: number | null;
  genre?: string | null;
  status: 'pending' | 'processing' | 'published' | 'failed';
  created_at?: string;
}

export type AnalyticsEventType = 'play' | 'complete' | 'skip' | 'like';

export interface AnalyticsEvent {
  id: string;
  track_id: string | null;
  event_type: AnalyticsEventType;
  country?: string | null;
  device?: string | null;
  occurred_at: string;
}

export interface RevenueLine {
  id: string;
  track_id: string | null;
  source: string;
  amount_cents: number;
  currency: string;
  occurred_at: string;
}

export interface Comment {
  id: string;
  track_id: string;
  author: string;
  body: string;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender: string;
  recipient: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Collaboration {
  id: string;
  title: string;
  collaborator: string;
  role?: string | null;
  status: 'pending' | 'active' | 'invited' | 'completed' | 'declined';
  created_at: string;
}

export interface Promotion {
  id: string;
  track_id: string | null;
  name: string;
  budget_cents: number;
  impressions: number;
  clicks: number;
  status: 'scheduled' | 'active' | 'completed' | 'paused';
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface DistributionDeal {
  id: string;
  track_id: string | null;
  store: string;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  delivered_at: string | null;
  created_at: string;
}

export interface Follower {
  id: string;
  handle: string;
  display_name?: string | null;
  avatar_url?: string | null;
  followed_at: string;
}

export interface AppNotification {
  id: string;
  category: 'message' | 'revenue' | 'follower' | 'comment' | 'promotion' | 'distribution' | 'system';
  title: string;
  body?: string | null;
  read_at: string | null;
  created_at: string;
}

export type UserRole = 'listener' | 'producer' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string | null;
  role: UserRole;
  is_disabled: boolean;
  avatar_url?: string | null;
  notification_prefs?: Record<string, boolean>;
  joined_at: string;
  last_seen_at?: string | null;
}

export type FeatureFlagCategory = 'core' | 'browse' | 'account' | 'growth' | 'engagement';

export interface FeatureFlag {
  feature_key: string;
  label: string;
  description?: string | null;
  category: FeatureFlagCategory;
  is_enabled: boolean;
  updated_by?: string | null;
  updated_at: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  target_label?: string | null;
  detail?: Record<string, unknown> | null;
  performed_by: string;
  created_at: string;
}

export interface GeneratedLyrics {
  id: string;
  title: string;
  genre?: string | null;
  mood?: string | null;
  structure?: string | null;
  body: string;
  author: string;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  uploads_enabled: boolean;
  submit_track_approval: boolean;
  monthly_upload_limit: number;
  free_beats_global_distribution: boolean;
  lyrics_tool_enabled: boolean;
  updated_by?: string | null;
  updated_at: string;
}

export interface HelpTicket {
  id: string;
  subject: string;
  category: string;
  body: string;
  submitted_by: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
}

export interface TrackSubmission {
  id: string;
  track_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  notes?: string | null;
  created_at: string;
  tracks?: { title: string; artist: string; cover_art_url: string };
}
