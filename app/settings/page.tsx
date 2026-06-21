'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Bell, Shield, Palette, Loader2, Camera } from 'lucide-react';
import { PageHeader, SectionCard, EmptyState } from '@/components/producer/primitives';
import { useUserProfile, useUpdateProfile } from '@/hooks/use-studio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/types';

const ROLE_LABELS: Record<UserRole, string> = {
  listener: 'Listener',
  producer: 'Producer',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const NOTIFICATION_KEYS = ['plays', 'comments', 'revenue', 'followers', 'weekly'] as const;

const NOTIFICATION_META: Record<
  (typeof NOTIFICATION_KEYS)[number],
  { title: string; desc: string }
> = {
  plays: { title: 'Play milestones', desc: 'Get notified at 1K, 10K, 100K plays' },
  comments: { title: 'New comments', desc: 'When listeners leave feedback' },
  revenue: { title: 'Revenue', desc: 'Payouts and earning milestones' },
  followers: { title: 'New followers', desc: 'Each time someone follows you' },
  weekly: { title: 'Weekly digest', desc: 'A summary delivered every Monday' },
};

const SAMPLE_AVATARS = [
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=200',
];

export default function SettingsPage() {
  const { data: profile, isLoading } = useUserProfile();
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [genre, setGenre] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? 'Crowntunz Music');
      setEmail(profile.email ?? 'studio@crowntunz.fm');
      setHandle('crowntunz-music');
      setGenre('Synthwave');
      setAvatarUrl(profile.avatar_url ?? '');
      setNotifPrefs(profile.notification_prefs ?? {
        plays: true, comments: true, revenue: true, followers: false, weekly: true,
      });
    }
  }, [profile]);

  const handleAvatarPick = () => {
    const next = SAMPLE_AVATARS[Math.floor(Math.random() * SAMPLE_AVATARS.length)];
    setAvatarUrl(next);
  };

  const saveProfile = () => {
    updateMutation.mutate(
      {
        display_name: displayName,
        email,
        avatar_url: avatarUrl,
        notification_prefs: notifPrefs,
      },
      {
        onSuccess: () => {
          toast({ title: 'Settings saved', description: 'Your profile has been updated.' });
        },
        onError: () => {
          toast({ title: 'Save failed', description: 'Could not update profile.', variant: 'destructive' });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 pb-4 animate-fade-in">
        <PageHeader title="Settings" description="Manage your producer account." icon={Settings} />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 pb-4 animate-fade-in">
        <PageHeader title="Settings" description="Manage your producer account." icon={Settings} />
        <EmptyState
          icon={Settings}
          title="Profile not loaded"
          description="Could not load your profile from the database. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Settings"
        description="Manage your producer account."
        icon={Settings}
        action={
          <Button onClick={saveProfile} disabled={updateMutation.isPending} className="gap-2">
            {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        }
      />

      <SectionCard title="Profile" description="Public-facing artist identity">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20 border-2 border-border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {displayName.charAt(0).toUpperCase() || 'P'}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="secondary"
              size="icon"
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
              onClick={handleAvatarPick}
              aria-label="Change avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
              {ROLE_LABELS[profile.role]}
            </span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="handle">Handle</Label>
            <Input
              id="handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genre">Primary genre</Label>
            <Input
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Notifications" description="What you hear about, and when">
        <ul className="space-y-1">
          {NOTIFICATION_KEYS.map((key, idx) => {
            const meta = NOTIFICATION_META[key];
            const checked = notifPrefs[key] ?? false;
            return (
              <li key={key}>
                <div className="flex items-center justify-between gap-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{meta.title}</p>
                    <p className="text-xs text-muted-foreground">{meta.desc}</p>
                  </div>
                  <Switch
                    checked={checked}
                    onCheckedChange={(v) =>
                      setNotifPrefs((prev) => ({ ...prev, [key]: v }))
                    }
                    aria-label={`Toggle ${meta.title}`}
                  />
                </div>
                {idx < NOTIFICATION_KEYS.length - 1 && <Separator />}
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <SectionCard title="Security & data" description="Account protection">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Change password
          </Button>
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            Two-factor auth
          </Button>
          <Button variant="outline" className="gap-2">
            <Palette className="h-4 w-4" />
            Export data
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Account" description="Profile visibility">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary">
              <User className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() =>
              toast({
                title: 'Account deletion',
                description: 'This action requires admin approval in this build.',
                variant: 'destructive',
              })
            }
          >
            Delete account
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}
