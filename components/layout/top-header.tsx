'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CrowntunzLogo } from '@/components/branding/logo';

export function TopHeader() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      startTransition(() => router.push('/search'));
    } else {
      startTransition(() => router.push(`/search?q=${encodeURIComponent(trimmed)}`));
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-background/70 px-3 py-3 backdrop-blur-xl md:gap-3 md:px-6">
      <div className="hidden items-center gap-1 md:flex">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/40 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-black/40 text-muted-foreground hover:text-foreground"
          onClick={() => router.forward()}
          aria-label="Go forward"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <Link href="/" className="shrink-0 md:hidden">
        <CrowntunzLogo showText={false} size={28} />
      </Link>

      <form onSubmit={submitSearch} className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs, artists, albums"
          className="rounded-full border-transparent bg-secondary/80 pl-10 pr-4"
          aria-label="Search"
        />
      </form>

      <div className="ml-auto flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
          asChild
        >
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-full p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Open profile menu"
              disabled={isPending}
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Crowntunz Music</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/songs" className="cursor-pointer">My Songs</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">Super Admin</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/help" className="cursor-pointer">Help Center</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/logout" className="cursor-pointer text-destructive">Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
