'use client';

import { useState } from 'react';
import { useAudioEngine } from '@/hooks/use-audio-engine';
import { PlayerBar } from '@/components/player/player-bar';
import { NowPlayingPanel } from '@/components/player/now-playing-panel';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { TopHeader } from '@/components/layout/top-header';

export function AppShell({ children }: { children: React.ReactNode }) {
  useAudioEngine();
  const [nowPlayingOpen, setNowPlayingOpen] = useState(true);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <div className="flex min-h-0 flex-1 gap-2 p-2 pb-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-card/40">
          <TopHeader />
          <main className="min-h-0 flex-1 overflow-y-auto scrollbar-thin px-3 pb-player-safe md:px-6 md:pb-nav-safe">
            {children}
          </main>
        </div>
        <NowPlayingPanel open={nowPlayingOpen} onClose={() => setNowPlayingOpen(false)} />
      </div>
      <PlayerBar
        nowPlayingOpen={nowPlayingOpen}
        onToggleNowPlaying={() => setNowPlayingOpen((v) => !v)}
      />
      <BottomNav />
    </div>
  );
}
