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

This project is configured for seamless deployment to Netlify via GitHub. The included configuration files ensure builds pass without errors:

- **`netlify.toml`** — build command, publish directory, Node version, security headers, and caching rules
- **`.github/workflows/ci.yml`** — runs type-check + build on every push/PR (catches issues before deploy)
- **`.github/workflows/deploy.yml`** — builds and deploys to Netlify on every push to `main`
- **`.github/workflows/preview.yml`** — creates a preview deployment for each pull request
- **`.env.example`** — complete list of required environment variables

### Option A: Netlify Git Connect (simplest)

1. Push your code to a GitHub repository (`git init && git remote add origin <repo-url> && git push -u origin main`)
2. Log in to [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Select your GitHub repo — Netlify auto-detects Next.js and reads `netlify.toml`
4. Add the [environment variables](#environment-variables-for-production) listed below
5. Click **Deploy** — every subsequent `git push` to `main` triggers a new deploy

### Option B: GitHub Actions CI/CD (recommended for teams)

This gives you build verification, preview deploys on PRs, and production deploys on merge.

1. Push your code to GitHub
2. In your GitHub repo, go to **Settings → Secrets and Variables → Actions**
3. Add these **repository secrets**:

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |
| `NEXT_PUBLIC_CLOUDFLARE_R2_URL` | R2 public bucket URL |
| `NETLIFY_AUTH_TOKEN` | Netlify personal access token (User Settings → Applications) |
| `NETLIFY_SITE_ID` | Netlify site API ID (Site Settings → General → Site Details) |

4. Go to [Netlify](https://app.netlify.com) → create a new empty site (or let the first deploy create it)
5. Copy the **Site ID** from Site Settings → General → Site Details → API ID → add as `NETLIFY_SITE_ID` secret
6. Push to `main` — the deploy workflow runs automatically and your site goes live

**What the workflows do:**

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR to `main`, `master` | Installs deps, type-checks, builds — fails PRs that don't compile |
| `deploy.yml` | Push to `main`, `master` | Builds + deploys to Netlify production (requires Netlify secrets) |
| `preview.yml` | PR opened/synced/reopened | Deploys a preview URL for review (requires Netlify secrets) |

If you don't set the `NETLIFY_AUTH_TOKEN` / `NETLIFY_SITE_ID` secrets, the deploy/preview workflows skip gracefully and only CI runs.

### Environment variables for production

Set these in Netlify Dashboard → Site Settings → Environment Variables, or as GitHub repository secrets:

| Variable | Scope | Required | Description |
|----------|-------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Yes | Supabase anon public key |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Server | Yes | Supabase service role key (admin operations) |
| `NEXT_PUBLIC_CLOUDFLARE_R2_URL` | Public | Yes | R2 public bucket URL for serving media |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Server | For uploads | Cloudflare account ID |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Server | For uploads | R2 access key |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Server | For uploads | R2 secret key |
| `CLOUDFLARE_R2_BUCKET_NAME` | Server | For uploads | R2 bucket name (`crowntunz-music`) |

> **Build note:** Only `NEXT_PUBLIC_*` variables are needed at build time. The server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_R2_*`, `SUPABASE_DB_URL`) are only needed at runtime for API routes and edge functions. If they're missing, the build still succeeds — features that need them fall back gracefully.

### Troubleshooting build errors

- **`EAGAIN: resource temporarily unavailable, readdir`** — transient filesystem error, re-run the build
- **Missing env var errors** — ensure all `NEXT_PUBLIC_*` vars are set in Netlify/GitHub before building
- **`npm ci` fails** — the workflow uses `--legacy-peer-deps`; if installing locally, run `npm install --legacy-peer-deps`
- **Build passes but site won't load** — check that Supabase URL and anon key are correct (the build doesn't validate them, but the runtime needs them)

### Vercel (alternative)

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
