'use client';

import { useMemo } from 'react';
import {
  UploadCloud,
  Play,
  Globe,
  Lock,
  Download,
  DollarSign,
  Ban,
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from 'lucide-react';
import { FeatureGate } from '@/components/admin/feature-gate';
import { PageHeader, EmptyState, StatusBadge } from '@/components/producer/primitives';
import { TierBadge, OwnershipBadge } from '@/components/producer/primitives';
import { UploadTrackDialog } from '@/components/studio/upload-track-dialog';
import { useMyUploads, usePlatformSettings } from '@/hooks/use-studio';
import { useAudioPlayer } from '@/hooks/use-audio-player';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { DownloadType, Track } from '@/lib/types';

const downloadMeta: Record<DownloadType, { label: string; icon: typeof Download }> = {
  free_download: { label: 'Free download', icon: Download },
  paid_purchase: { label: 'Paid purchase', icon: DollarSign },
  streaming_only: { label: 'Streaming only', icon: Lock },
};

export default function UploadsPage() {
  return (
    <FeatureGate featureKey="uploads">
      <UploadsContent />
    </FeatureGate>
  );
}

function UploadsContent() {
  const { data: tracks, isLoading } = useMyUploads();
  const { data: settings } = usePlatformSettings();
  const playTrack = useAudioPlayer((s) => s.playTrack);

  const uploadsEnabled = settings?.uploads_enabled ?? true;
  const submitApproval = settings?.submit_track_approval ?? false;
  const monthlyLimit = settings?.monthly_upload_limit ?? 10;

  // Count uploads this month for the limit display.
  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return (tracks ?? []).filter((t) => {
      if (!t.created_at) return false;
      const d = new Date(t.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [tracks]);

  const limitReached = uploadsEnabled && thisMonthCount >= monthlyLimit && monthlyLimit > 0;

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Uploads"
        description="Submit free beats, premium tracks, and full-owned records."
        icon={UploadCloud}
        action={
          <UploadTrackDialog
            trigger={
              <Button variant="default" className="gap-2" disabled={!uploadsEnabled || limitReached}>
                <UploadCloud className="h-4 w-4" />
                Upload track
              </Button>
            }
          />
        }
      />

      {/* Platform settings banner */}
      {settings && !uploadsEnabled && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <Ban className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Uploads are currently disabled</p>
            <p className="text-xs opacity-90">
              An administrator has turned off new uploads across the platform. You can still browse your existing catalog.
            </p>
          </div>
        </div>
      )}

      {settings && uploadsEnabled && submitApproval && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-400">
          <Clock3 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Submit-track approval is on</p>
            <p className="text-xs opacity-90">
              New uploads enter a pending review queue and will be published after an administrator approves them.
            </p>
          </div>
        </div>
      )}

      {/* Upload quota + distribution rules */}
      {uploadsEnabled && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-card/60 p-4">
            <p className="text-xs text-muted-foreground">Uploads this month</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">
              {thisMonthCount}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/ {monthlyLimit}</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn('h-full rounded-full transition-all', limitReached ? 'bg-destructive' : 'bg-primary')}
                style={{ width: `${Math.min(100, (thisMonthCount / monthlyLimit) * 100)}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl bg-card/60 p-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Free beats
            </p>
            <p className="mt-1 text-sm font-medium">Platform-only distribution</p>
            <p className="text-xs text-muted-foreground">Not eligible for global stores.</p>
          </div>
          <div className="rounded-xl bg-card/60 p-4">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5" /> Full-owned tracks
            </p>
            <p className="mt-1 text-sm font-medium">Global distribution eligible</p>
            <p className="text-xs text-muted-foreground">Spotify, Apple Music, and more.</p>
          </div>
        </div>
      )}

      {limitReached && uploadsEnabled && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p>
            You have reached your monthly upload limit of {monthlyLimit} tracks. New uploads will be available next month,
            or an administrator can raise the limit.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : (tracks ?? []).length === 0 ? (
        <EmptyState
          icon={UploadCloud}
          title="No uploads yet"
          description={uploadsEnabled ? 'Upload your first track or beat to get started.' : 'Uploads are disabled.'}
          action={
            uploadsEnabled && !limitReached ? (
              <UploadTrackDialog
                trigger={
                  <Button className="gap-2">
                    <UploadCloud className="h-4 w-4" />
                    Upload track
                  </Button>
                }
              />
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {(tracks ?? []).map((track) => (
            <UploadRow
              key={track.id}
              track={track}
              submitApproval={submitApproval}
              onPlay={() => playTrack(track)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UploadRow({
  track,
  submitApproval,
  onPlay,
}: {
  track: Track;
  submitApproval: boolean;
  onPlay: () => void;
}) {
  const DownloadIcon = downloadMeta[track.download_type ?? 'free_download'].icon;
  const isFreeBeat = track.ownership_type === 'beat_license' && track.tier === 'free';
  const distributionEligible = track.distribution_eligible ?? !isFreeBeat;

  // When submit-approval is on, show tracks as "pending review" until published.
  const status = submitApproval ? 'pending' : 'published';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-card/60 p-3 transition-colors hover:bg-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={track.cover_art_url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold">{track.title}</p>
          <OwnershipBadge type={track.ownership_type ?? 'full'} />
          {track.tier && <TierBadge tier={track.tier} />}
          <StatusBadge status={status} />
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {track.artist}
          {track.genre ? ` · ${track.genre}` : ''}
          {track.bpm ? ` · ${track.bpm} BPM` : ''}
          {' · '}
          {formatTime(track.duration_seconds ?? 0)}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <DownloadIcon className="h-3 w-3" />
            {downloadMeta[track.download_type ?? 'free_download'].label}
          </span>
          {track.download_type === 'paid_purchase' && track.price_cents ? (
            <span className="font-medium text-primary">${(track.price_cents / 100).toFixed(2)}</span>
          ) : null}
          <span className="flex items-center gap-1">
            {distributionEligible ? (
              <>
                <Globe className="h-3 w-3" />
                Global distribution
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Platform only
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label={`Play ${track.title}`}
          onClick={onPlay}
        >
          <Play className="h-4 w-4" />
        </Button>
        {status === 'published' ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
