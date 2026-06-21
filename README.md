# Crowntunz Music — Music Streaming & Distribution Platform

A full-stack, production-ready music streaming and distribution platform built with Next.js 13, Supabase, Zustand, and React Query.

## Features

### Core streaming
- Full audio player with play/pause/skip/shuffle/repeat/seek/volume
- Persistent player bar across all routes (desktop + mobile)
- Queue management with "Up Next" drawer
- Like/heart tracks (persisted to Supabase)
- Browse by songs, beats, albums, stations, and playlists
- Search across tracks, artists, albums, and genres

### Producer / Creator tools
- **Lyrics Songwriter** — generate structured song lyrics by genre, mood, and theme
- **Track uploads** with tier system:
  - Free beats (platform-only distribution)
  - Premium tracks (eligible for global distribution)
  - Full ownership vs beat license
  - Free download, paid purchase, or streaming-only
- **Distribution** to Spotify, Apple Music, YouTube Music, Amazon Music, Tidal
- **Promotions** — create marketing campaigns, pause/resume, delete
- **Collaborations** — invite collaborators, accept/decline
- **Analytics** — plays, completes, skips, by country/device
- **Revenue** — earnings breakdown with CSV export
- **Comments** — leave feedback on tracks, pin, delete

### Super Admin dashboard (`/admin`)
- **Overview** — KPIs, platform health bars, recent activity
- **Users** — enable/disable users, search, filter by role
- **Features** — toggle 16 platform features on/off (instant nav gating)
- **Controls** — upload enable/disable, submit-track approval, monthly upload limit, free-beats distribution, lyrics tool toggle
- **Submissions** — approve/reject pending track uploads
- **Audit Log** — chronological record of all admin actions

### Mobile responsive
- Mobile bottom tab bar (Home, Search, Library, Account)
- Responsive player bar with mobile-optimized controls
- Safe-area support for notched devices
- Collapsible chat/messages on mobile
- Responsive grids across all pages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 13 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (audio) + React Query (server) |
| Backend | Supabase (PostgreSQL, RLS, Auth) |
| Storage | Cloudflare R2 (S3-compatible, media assets) |
| Icons | Lucide React |

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- A Supabase project (free tier works)

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Cloudflare R2
NEXT_PUBLIC_CLOUDFLARE_R2_URL=https://your-bucket.r2.dev
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=crowntunz-music
```

### 3. Database setup

Run the SQL migrations in order (found in `supabase/migrations/`) against your Supabase project via the Supabase Dashboard > SQL Editor, or via the Supabase MCP tools:

1. `20260619125306_create_tracks_table.sql` — core tracks table
2. `20260619140832_producer_account_schema.sql` — producer analytics/revenue/etc
3. `20260620223812_super_admin_feature_flags.sql` — admin users + feature flags + audit log
4. `20260620230514_lyrics_upload_tiers_admin_controls.sql` — lyrics + upload tiers + platform settings
5. `20260620232023_add_notification_prefs.sql` — notification preferences column
6. `20260620232148_allow_profile_updates.sql` — RLS for profile updates
7. `production_completion_schema.sql` — liked_tracks, track_submissions, help_tickets

### 4. Run the dev server

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Deployment

### Netlify (recommended)

This project includes `netlify.toml` with the correct build settings:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

1. Push your code to a Git repository
2. Connect the repo to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy — Netlify auto-detects Next.js

### Vercel

1. Push to Git
2. Import the repo in Vercel
3. Add environment variables
4. Deploy — Vercel auto-detects Next.js

### Environment variables for production

Set these in your hosting platform's environment variable settings:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `NEXT_PUBLIC_CLOUDFLARE_R2_URL` | Public R2 bucket URL for serving media |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Cloudflare account ID (server only) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 access key (server only) |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | R2 secret key (server only) |
| `CLOUDFLARE_R2_BUCKET_NAME` | R2 bucket name |

## Cloudflare R2 Storage

The platform connects to Cloudflare R2 for media asset storage (audio files, cover art, avatars).

### How it works

- `lib/r2.ts` provides the connection layer between the platform and R2
- `r2Url(key)` resolves R2 object keys to public URLs (client-side safe)
- `uploadToR2(key, body, contentType)` uploads files server-side via the S3-compatible API
- `r2Status` exposes connection diagnostics for admin panels
- Falls back gracefully — if R2 is not configured, external URLs pass through unchanged

### Setting up R2

1. Create a Cloudflare account and enable R2
2. Create a bucket (e.g. `crowntunz-music`)
3. Enable public access or set up a custom domain
4. Generate R2 API tokens (Account ID, Access Key ID, Secret Access Key)
5. Add the credentials to your `.env`:

```env
NEXT_PUBLIC_CLOUDFLARE_R2_URL=https://your-bucket.r2.dev
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=crowntunz-music
CLOUDFLARE_R2_REGION=auto
```

## Build

```bash
npm run build
```

## Project Structure

```
app/                    # Next.js App Router pages
  admin/                # Super admin dashboard
  analytics/            # Analytics & insights
  beats/                # Beats marketplace
  collection/tracks/    # Liked songs
  collaborations/       # Collaboration invites
  comments/             # Track comments
  dashboard/            # Producer dashboard
  distribution/         # Global distribution
  followers/            # Follower management
  help/                 # Help center + tickets
  library/              # Music library
  logout/               # Sign-out flow
  lyrics/               # Lyrics songwriter tool
  messages/             # Direct messages
  notifications/        # Notification inbox
  playlists/            # Playlist management
  promotions/           # Marketing campaigns
  revenue/              # Revenue & earnings
  search/               # Search
  settings/             # User settings (persists to DB)
  songs/                # Song catalog
  stations/             # Genre radio stations
  uploads/              # Track upload with tiers
components/              # Reusable React components
  admin/                # Admin panels
  branding/             # Crowntunz Music logo
  layout/               # Shell, sidebar, header, bottom nav
  player/               # Audio player bar
  producers/            # Charts, stats, primitives
  studio/               # Upload dialog
  tracks/               # Track cards and rows
  ui/                   # shadcn/ui primitives
hooks/                  # React hooks (audio, queries, mutations)
  use-admin.ts          # Admin mutations
  use-audio-engine.ts   # Audio element management
  use-audio-player.ts   # Zustand audio store
  use-producer.ts       # Producer data + mutations
  use-studio.ts         # Lyrics, uploads, settings, tickets
  use-tracks.ts         # Track catalog
  use-toast.ts          # Toast notifications
lib/                    # Shared utilities and types
  mock-data.ts          # Dev fallback data
  r2.ts                 # Cloudflare R2 storage connection + upload helper
  supabase.ts           # Supabase client
  types.ts              # TypeScript types
  utils.ts              # cn() helper
supabase/migrations/    # SQL migration files
```

## License

MIT
