'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { usePlaylists } from '@/hooks/use-tracks';
import { useCreatePlaylist } from '@/hooks/use-producer';
import { useToast } from '@/hooks/use-toast';
import { useFeatureFlags } from '@/components/providers/feature-flag-provider';
import { browseNav, producerNav } from '@/lib/nav';
import type { NavItem } from '@/lib/nav';
import { CrowntunzLogo } from '@/components/branding/logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListMusic } from 'lucide-react';

function useVisibleNav() {
  const { isEnabled, isAdmin } = useFeatureFlags();
  const filter = (item: NavItem) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.featureKey && !isEnabled(item.featureKey)) return false;
    return true;
  };
  return {
    browseNav: browseNav.filter(filter),
    producerNav: producerNav
      .map((group) => ({ ...group, items: group.items.filter(filter) }))
      .filter((group) => group.items.length > 0),
  };
}

const COVER_POOL = [
  'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1370545/pexels-photo-1370545.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1644888/pexels-photo-1644888.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1762973/pexels-photo-1762973.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: playlists } = usePlaylists();
  const { browseNav: visibleBrowse, producerNav: visibleProducer } = useVisibleNav();
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createMutation = useCreatePlaylist();
  const { toast } = useToast();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    const coverArt = COVER_POOL[Math.floor(Math.random() * COVER_POOL.length)];
    createMutation.mutate(
      { title: title.trim(), description: description.trim() || 'A Crowntunz Music playlist', cover_art_url: coverArt },
      {
        onSuccess: (pl) => {
          toast({ title: 'Playlist created', description: pl.title });
          setCreateOpen(false);
          setTitle('');
          setDescription('');
          router.push(`/playlist/${pl.id}`);
        },
        onError: () => {
          toast({ title: 'Could not create playlist', variant: 'destructive' });
        },
      },
    );
  };

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col gap-2 p-2">
      <Link href="/" className="flex items-center justify-center rounded-xl bg-sidebar/80 px-3 py-4 backdrop-blur transition-opacity hover:opacity-80">
        <CrowntunzLogo size={36} />
      </Link>
      <nav className="rounded-xl bg-sidebar/80 p-3 backdrop-blur">
        <ul className="space-y-1">
          {visibleBrowse.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-sidebar/80 p-3 backdrop-blur">
        <ScrollArea className="flex-1 pr-1" type="auto">
          <div className="space-y-5 px-1">
            {visibleProducer.map((group) => (
              <div key={group.heading} className="space-y-1">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                  {group.heading}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      (item.href !== '/' && pathname.startsWith(item.href + '/'));
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            active
                              ? 'bg-secondary font-medium text-foreground'
                              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="rounded-xl bg-sidebar/80 p-3 backdrop-blur">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <ListMusic className="h-4 w-4" />
            Playlists
          </span>
          <button
            type="button"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Create playlist"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <ScrollArea className="max-h-32 pr-1">
          <ul className="space-y-0.5">
            <li>
              <Link
                href="/collection/tracks"
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary/60"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                  <Heart className="h-3.5 w-3.5" />
                </span>
                <span className="truncate font-medium text-foreground">Liked Songs</span>
              </Link>
            </li>
            {playlists?.slice(0, 8).map((pl) => (
              <li key={pl.id}>
                <Link
                  href={`/playlist/${pl.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-secondary/60"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pl.cover_art_url}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-md object-cover"
                  />
                  <span className="truncate text-foreground">{pl.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a playlist</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pl-title">Title</Label>
              <Input
                id="pl-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My awesome playlist"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pl-desc">Description</Label>
              <Textarea
                id="pl-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give your playlist a description"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
