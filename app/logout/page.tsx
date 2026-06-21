'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAudioPlayer } from '@/hooks/use-audio-player';

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    try {
      void useAudioPlayer.getState().pause();
    } catch (err) {
      console.warn('[logout] audio stop failed', err);
    }
    try {
      void supabase.auth.signOut();
    } catch (err) {
      console.warn('[logout] signOut failed', err);
    }
    const timer = setTimeout(() => router.replace('/'), 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center animate-fade-in">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
        <LogOut className="h-6 w-6" />
      </span>
      <div>
        <p className="text-lg font-semibold">Signed out</p>
        <p className="text-sm text-muted-foreground">Redirecting you home…</p>
      </div>
    </div>
  );
}
