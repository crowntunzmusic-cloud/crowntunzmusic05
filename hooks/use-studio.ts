'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { GeneratedLyrics, OwnershipType, PlatformSettings, TrackTier, DownloadType, UserProfile, HelpTicket, TrackSubmission } from '@/lib/types';

export const studioKeys = {
  all: ['studio'] as const,
  lyrics: () => [...studioKeys.all, 'lyrics'] as const,
  settings: () => [...studioKeys.all, 'platform_settings'] as const,
  myUploads: () => [...studioKeys.all, 'my_uploads'] as const,
  tickets: () => [...studioKeys.all, 'help_tickets'] as const,
  submissions: () => [...studioKeys.all, 'track_submissions'] as const,
};

// ---------------------------------------------------------------------------
// Lyrics
// ---------------------------------------------------------------------------

async function fetchLyrics(): Promise<GeneratedLyrics[]> {
  const { data, error } = await supabase
    .from('generated_lyrics')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as GeneratedLyrics[]) ?? [];
}

export function useLyrics() {
  return useQuery<GeneratedLyrics[], Error>({
    queryKey: studioKeys.lyrics(),
    queryFn: async () => {
      try {
        return await fetchLyrics();
      } catch (err) {
        console.warn('[lyrics] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as GeneratedLyrics[],
  });
}

export interface LyricInput {
  title: string;
  genre: string;
  mood: string;
  structure: string;
  theme: string;
}

// Deterministic lyric generation from the user's inputs — no external API needed.
// Builds structured lyrics (verse/chorus/bridge) from a word bank keyed by mood + genre.
const WORD_BANK: Record<string, string[]> = {
  romantic: ['heartbeat', 'whisper', 'forever', 'closer', 'embrace', 'midnight', 'tender', 'forever yours'],
  motivational: ['rise', 'conquer', 'pavement', 'stars', 'burning', 'never back down', 'grinding', 'echoes'],
  melancholic: ['shadows', 'fading', 'raindrops', 'silence', 'memories', 'echo', 'drifting', 'yesterday'],
  energetic: ['lightning', 'blazing', 'pounding', 'electric', 'velocity', 'firing', 'ignite', 'thunder'],
  chill: ['breeze', 'sunset', 'floating', 'mellow', 'coastline', 'amber', 'sipping', 'wandering'],
  dark: ['hollow', 'abyss', 'shattered', 'whispers in the dark', 'crawling', 'venom', 'no escape', 'falling'],
};

const RHYME_PAIRS: Record<string, [string, string][]> = {
  romantic: [['hand', 'understand'], ['you', 'new'], ['dawn', 'belong'], ['heart', 'apart']],
  motivational: [['stars', 'bars'], ['earned', 'burned'], ['ear', 'steer'], ['fakes', 'breaks']],
  melancholic: [['rain', 'pain'], ['silence', 'violence'], ['away', 'stay'], ['gone', 'drawn']],
  energetic: [['light', 'night'], ['fire', 'higher'], ['beat', 'heat'], ['sound', 'ground']],
  chill: [['breeze', 'ease'], ['amber', 'remember'], ['shore', 'more'], ['sky', 'fly']],
  dark: [['abyss', 'miss'], ['dark', 'spark'], ['fall', 'crawl'], ['screaming', 'dreaming']],
};

export function generateLyrics(input: LyricInput): string {
  const words = WORD_BANK[input.mood] ?? WORD_BANK.romantic;
  const rhymes = RHYME_PAIRS[input.mood] ?? RHYME_PAIRS.romantic;
  const pick = (i: number) => words[i % words.length];
  const rhyme = (i: number) => rhymes[i % rhymes.length];

  const verse1 = [
    `I feel the ${pick(0)} calling out your name`,
    `Every ${pick(1)} brings me back again`,
    `We trace the lines of the ${pick(2)} we chose`,
    `A story only we could ever ${rhyme(0)[1]}`,
  ];

  const verse2 = [
    `Walking through the ${pick(3)} of the night`,
    `You are my compass, you are my ${rhyme(1)[0]}`,
    `Every ${pick(4)} whispers stay a while`,
    `I see the answer in your ${rhyme(2)[1]}`,
  ];

  const chorus = [
    `Oh, ${input.theme.toLowerCase()}, take me higher`,
    `We are the ${pick(5)} chasing the ${rhyme(1)[1]}`,
    `Hold on tight, we will never ${rhyme(0)[1]}`,
    `${input.theme}, ${input.theme} — set my heart on fire`,
  ];

  const bridge = [
    `When the ${pick(6)} fades and the night grows cold`,
    `I will remember the ${pick(7)} that we hold`,
    `No ${rhyme(3)[0]}, no ending we can't ${rhyme(0)[1]}`,
    `Just ${input.theme.toLowerCase()} running through my soul`,
  ];

  const stamp = `[Verse 1]\n${verse1.join('\n')}\n\n[Chorus]\n${chorus.join('\n')}\n\n[Verse 2]\n${verse2.join('\n')}\n\n[Chorus]\n${chorus.join('\n')}\n\n[Bridge]\n${bridge.join('\n')}\n\n[Outro]\n${input.theme}… ${input.theme}… fading out`;

  return stamp;
}

export function useSaveLyrics() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lyrics: GeneratedLyrics) => {
      const { data, error } = await supabase
        .from('generated_lyrics')
        .insert({
          title: lyrics.title,
          genre: lyrics.genre,
          mood: lyrics.mood,
          structure: lyrics.structure,
          body: lyrics.body,
          author: lyrics.author,
        })
        .select()
        .single();
      if (error) throw error;
      return data as GeneratedLyrics;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studioKeys.lyrics() });
    },
  });
}

// ---------------------------------------------------------------------------
// Platform settings (admin-controlled)
// ---------------------------------------------------------------------------

async function fetchSettings(): Promise<PlatformSettings | null> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .maybeSingle();
  if (error) throw error;
  return (data as PlatformSettings) ?? null;
}

export function usePlatformSettings() {
  return useQuery<PlatformSettings | null, Error>({
    queryKey: studioKeys.settings(),
    queryFn: async () => {
      try {
        return await fetchSettings();
      } catch (err) {
        console.warn('[platform_settings] fetch failed', err);
        return null;
      }
    },
    staleTime: 1000 * 15,
  });
}

export function useUpdatePlatformSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<PlatformSettings>) => {
      const { data, error } = await supabase
        .from('platform_settings')
        .update({ ...patch, updated_by: 'super_admin', updated_at: new Date().toISOString() })
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .select()
        .single();
      if (error) throw error;
      return data as PlatformSettings;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studioKeys.settings() });
    },
  });
}

// ---------------------------------------------------------------------------
// Track upload (with tier / ownership / download metadata)
// ---------------------------------------------------------------------------

export interface UploadTrackInput {
  title: string;
  artist: string;
  audio_url: string;
  cover_art_url: string;
  genre?: string;
  duration_seconds?: number;
  ownership_type: OwnershipType;
  tier: TrackTier;
  download_type: DownloadType;
  price_cents: number;
  distribution_eligible: boolean;
}

export function useUploadTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadTrackInput) => {
      // Free beats distributed only within the platform.
      const isFreeBeat =
        input.ownership_type === 'beat_license' &&
        input.tier === 'free';
      const distributionEligible = isFreeBeat ? false : input.distribution_eligible;

      const { data, error } = await supabase
        .from('tracks')
        .insert({
          title: input.title,
          artist: input.artist,
          audio_url: input.audio_url,
          cover_art_url: input.cover_art_url,
          genre: input.genre,
          duration_seconds: input.duration_seconds,
          ownership_type: input.ownership_type,
          tier: input.tier,
          download_type: input.download_type,
          price_cents: input.price_cents,
          distribution_eligible: distributionEligible,
          is_beat: input.ownership_type === 'beat_license',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studioKeys.myUploads() });
    },
  });
}

// ---------------------------------------------------------------------------
// Producer profile (read/update from user_profiles by email)
// ---------------------------------------------------------------------------

const PRODUCER_EMAIL = 'studio@crowntunz.fm';

async function fetchProfile(): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', PRODUCER_EMAIL)
    .maybeSingle();
  if (error) throw error;
  return (data as UserProfile) ?? null;
}

export function useUserProfile() {
  return useQuery<UserProfile | null, Error>({
    queryKey: [...studioKeys.all, 'profile'] as const,
    queryFn: async () => {
      try {
        return await fetchProfile();
      } catch (err) {
        console.warn('[profile] fetch failed', err);
        return null;
      }
    },
  });
}

export interface ProfilePatch {
  display_name?: string;
  email?: string;
  avatar_url?: string;
  notification_prefs?: Record<string, boolean>;
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: ProfilePatch) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(patch)
        .eq('email', PRODUCER_EMAIL)
        .select()
        .single();
      if (error) throw error;
      return data as UserProfile;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [...studioKeys.all, 'profile'] });
    },
  });
}

// ---------------------------------------------------------------------------
// My uploads — tracks this producer has uploaded (newest first)
// ---------------------------------------------------------------------------

export function useMyUploads(limit = 50) {
  return useQuery({
    queryKey: studioKeys.myUploads(),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return data ?? [];
      } catch (err) {
        console.warn('[my_uploads] fetch failed', err);
        return [];
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Help tickets
// ---------------------------------------------------------------------------

export function useHelpTickets() {
  return useQuery<HelpTicket[], Error>({
    queryKey: studioKeys.tickets(),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('help_tickets')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data as HelpTicket[]) ?? [];
      } catch (err) {
        console.warn('[help_tickets] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as HelpTicket[],
  });
}

export function useSubmitHelpTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { subject: string; category: string; body: string }) => {
      const { data, error } = await supabase
        .from('help_tickets')
        .insert({ ...input, submitted_by: 'Crowntunz Music' })
        .select()
        .single();
      if (error) throw error;
      return data as HelpTicket;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studioKeys.tickets() });
    },
  });
}

// ---------------------------------------------------------------------------
// Track submissions (admin review queue)
// ---------------------------------------------------------------------------

export function useTrackSubmissions() {
  return useQuery<TrackSubmission[], Error>({
    queryKey: studioKeys.submissions(),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('track_submissions')
          .select('*, tracks:track_id(title,artist,cover_art_url)')
          .order('created_at', { ascending: false });
        if (error) throw error;
        return (data as TrackSubmission[]) ?? [];
      } catch (err) {
        console.warn('[track_submissions] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as TrackSubmission[],
  });
}

export function useReviewSubmission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: 'approved' | 'rejected'; notes?: string }) => {
      const { error } = await supabase
        .from('track_submissions')
        .update({ status, notes, reviewed_by: 'super_admin', reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: studioKeys.submissions() });
    },
  });
}
