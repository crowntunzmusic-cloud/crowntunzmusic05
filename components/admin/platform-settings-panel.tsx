'use client';

import { useState, useEffect } from 'react';
import { UploadCloud, FileCheck2, CalendarDays, Sliders, Save, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { usePlatformSettings, useUpdatePlatformSettings } from '@/hooks/use-studio';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { PlatformSettings } from '@/lib/types';

export function AdminPlatformSettingsPanel() {
  const { data: settings, isLoading } = usePlatformSettings();
  const updateMutation = useUpdatePlatformSettings();
  const { toast } = useToast();

  const [draft, setDraft] = useState<PlatformSettings | null>(null);

  useEffect(() => {
    if (settings && !draft) setDraft(settings);
  }, [settings, draft]);

  const patch = (p: Partial<PlatformSettings>) => {
    setDraft((prev) => (prev ? { ...prev, ...p } : prev));
  };

  const hasChanges = draft && settings ? JSON.stringify(draft) !== JSON.stringify(settings) : false;

  const handleSave = () => {
    if (!draft) return;
    updateMutation.mutate(
      {
        uploads_enabled: draft.uploads_enabled,
        submit_track_approval: draft.submit_track_approval,
        monthly_upload_limit: draft.monthly_upload_limit,
        free_beats_global_distribution: draft.free_beats_global_distribution,
        lyrics_tool_enabled: draft.lyrics_tool_enabled,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Platform settings saved',
            description: 'Changes take effect immediately across all user accounts.',
          });
        },
        onError: () => {
          toast({ title: 'Save failed', description: 'Could not update settings.', variant: 'destructive' });
        },
      },
    );
  };

  if (isLoading || !draft) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/30 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-foreground">
            <Sliders className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Account controls</p>
            <p className="text-xs text-muted-foreground">
              These settings apply to every user profile across the platform.
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending} className="gap-2">
          {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
        <SettingRow
          icon={UploadCloud}
          title="Enable track uploads"
          description="When off, all users are blocked from uploading new tracks or beats. Existing uploads remain visible."
        >
          <Switch
            checked={draft.uploads_enabled}
            onCheckedChange={(v) => patch({ uploads_enabled: v })}
            aria-label="Toggle uploads"
          />
        </SettingRow>

        <Separator />

        <SettingRow
          icon={FileCheck2}
          title="Submit-track approval"
          description="When on, all new uploads enter a pending review state and are only published after an admin approves them."
        >
          <Switch
            checked={draft.submit_track_approval}
            onCheckedChange={(v) => patch({ submit_track_approval: v })}
            aria-label="Toggle submit approval"
          />
        </SettingRow>

        <Separator />

        <SettingRow
          icon={CalendarDays}
          title="Monthly upload limit"
          description="Maximum number of tracks a user can upload per calendar month. Set to 0 for unlimited."
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={1000}
              value={draft.monthly_upload_limit}
              onChange={(e) => patch({ monthly_upload_limit: parseInt(e.target.value || '0', 10) })}
              className="w-24 text-center tabular-nums"
            />
            <span className="text-sm text-muted-foreground">tracks / month</span>
          </div>
        </SettingRow>

        <Separator />

        <SettingRow
          icon={UploadCloud}
          title="Free beats — global distribution"
          description="When off (default), free beats are distributed only within the Crowntunz platform. Turn on to allow free beats on external stores."
        >
          <Switch
            checked={draft.free_beats_global_distribution}
            onCheckedChange={(v) => patch({ free_beats_global_distribution: v })}
            aria-label="Toggle free beats global distribution"
          />
        </SettingRow>

        <Separator />

        <SettingRow
          icon={FileCheck2}
          title="Lyrics songwriter tool"
          description="Master switch for the lyrics generator tool available in user studio pages."
        >
          <Switch
            checked={draft.lyrics_tool_enabled}
            onCheckedChange={(v) => patch({ lyrics_tool_enabled: v })}
            aria-label="Toggle lyrics tool"
          />
        </SettingRow>
      </div>

      {hasChanges && (
        <p className="flex items-center gap-1.5 text-xs text-amber-400">
          <Save className="h-3.5 w-3.5" />
          You have unsaved changes. Click Save to apply them.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Last updated{' '}
        {new Date(settings?.updated_at ?? Date.now()).toLocaleString([], {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
        {settings?.updated_by ? ` by ${settings.updated_by}` : ''}.
      </p>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof UploadCloud;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-secondary/20">
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground')}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="max-w-md text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
