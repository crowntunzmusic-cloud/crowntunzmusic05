'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlaylists } from '@/hooks/use-tracks';
import { useFeatureFlags } from '@/components/providers/feature-flag-provider';
import { browseNav, producerNav } from '@/lib/nav';
import type { NavItem } from '@/lib/nav';
import { cn } from '@/lib/utils';
import { CrowntunzLogo } from '@/components/branding/logo';
import { useState } from 'react';

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

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: playlists } = usePlaylists();
  const { browseNav: visibleBrowse, producerNav: visibleProducer } = useVisibleNav();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-foreground md:hidden"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-border bg-sidebar p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex items-center justify-center px-4 py-4">
          <Link href="/" onClick={() => setOpen(false)}>
            <CrowntunzLogo size={32} />
          </Link>
        </div>
        <ScrollArea className="h-full">
          <nav className="border-b border-border p-4">
            <ul className="space-y-1">
              {visibleBrowse.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="space-y-5 p-3">
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
                          onClick={() => setOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            active
                              ? 'bg-secondary font-medium text-foreground'
                              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Playlists
            </p>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/collection/tracks"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-secondary/60"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-primary to-chart-4 text-primary-foreground">
                    <Heart className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium">Liked Songs</span>
                </Link>
              </li>
              {playlists?.map((pl) => (
                <li key={pl.id}>
                  <Link
                    href={`/playlist/${pl.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-secondary/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pl.cover_art_url}
                      alt=""
                      className="h-8 w-8 rounded-md object-cover"
                    />
                    <span className="truncate font-medium">{pl.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
