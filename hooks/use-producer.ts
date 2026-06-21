'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useTracks } from '@/hooks/use-tracks';
import type {
  AnalyticsEvent,
  AppNotification,
  Beat,
  Collaboration,
  Comment,
  DistributionDeal,
  Follower,
  Message,
  Promotion,
  RevenueLine,
  Track,
  Upload,
} from '@/lib/types';

export const producerKeys = {
  all: ['producer'] as const,
  beats: () => [...producerKeys.all, 'beats'] as const,
  uploads: () => [...producerKeys.all, 'uploads'] as const,
  analytics: () => [...producerKeys.all, 'analytics'] as const,
  revenue: () => [...producerKeys.all, 'revenue'] as const,
  comments: () => [...producerKeys.all, 'comments'] as const,
  messages: () => [...producerKeys.all, 'messages'] as const,
  collaborations: () => [...producerKeys.all, 'collaborations'] as const,
  promotions: () => [...producerKeys.all, 'promotions'] as const,
  distribution: () => [...producerKeys.all, 'distribution'] as const,
  followers: () => [...producerKeys.all, 'followers'] as const,
  notifications: () => [...producerKeys.all, 'notifications'] as const,
};

async function fetchAll<T>(table: string, orderCol: string): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(orderCol, { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data as T[]) ?? [];
}

export function useBeats(): { data: Beat[]; isLoading: boolean } {
  const q = useQuery<Beat[], Error>({
    queryKey: producerKeys.beats(),
    queryFn: async () => {
      try {
        return await fetchAll<Beat>('beats', 'created_at');
      } catch (err) {
        console.warn('[beats] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as Beat[],
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}

export interface BeatWithTrack extends Beat {
  track?: Track;
}

export function useBeatsWithTracks() {
  const beats = useBeats();
  const tracks = useTracks();
  const trackMap = new Map((tracks.data ?? []).map((t) => [t.id, t]));
  const data: BeatWithTrack[] = (beats.data ?? []).map((b) => ({
    ...b,
    track: trackMap.get(b.track_id),
  }));
  return { data, isLoading: beats.isLoading || tracks.isLoading };
}

export function useUploads() {
  return useQuery<Upload[], Error>({
    queryKey: producerKeys.uploads(),
    queryFn: async () => {
      try {
        return await fetchAll<Upload>('uploads', 'created_at');
      } catch (err) {
        console.warn('[uploads] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as Upload[],
  });
}

export function useAnalytics() {
  return useQuery<AnalyticsEvent[], Error>({
    queryKey: producerKeys.analytics(),
    queryFn: async () => {
      try {
        return await fetchAll<AnalyticsEvent>('analytics_events', 'occurred_at');
      } catch (err) {
        console.warn('[analytics] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as AnalyticsEvent[],
  });
}

export function useRevenue() {
  return useQuery<RevenueLine[], Error>({
    queryKey: producerKeys.revenue(),
    queryFn: async () => {
      try {
        return await fetchAll<RevenueLine>('revenue', 'occurred_at');
      } catch (err) {
        console.warn('[revenue] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as RevenueLine[],
  });
}

export function useComments() {
  return useQuery<Comment[], Error>({
    queryKey: producerKeys.comments(),
    queryFn: async () => {
      try {
        return await fetchAll<Comment>('comments', 'created_at');
      } catch (err) {
        console.warn('[comments] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as Comment[],
  });
}

export function useMessages(): { data: Message[]; isLoading: boolean } {
  const q = useQuery<Message[], Error>({
    queryKey: producerKeys.messages(),
    queryFn: async () => {
      try {
        return await fetchAll<Message>('messages', 'created_at');
      } catch (err) {
        console.warn('[messages] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as Message[],
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}

export function useCollaborations() {
  return useQuery<Collaboration[], Error>({
    queryKey: producerKeys.collaborations(),
    queryFn: async () => {
      try {
        return await fetchAll<Collaboration>('collaborations', 'created_at');
      } catch (err) {
        console.warn('[collaborations] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as Collaboration[],
  });
}

export function usePromotions() {
  return useQuery<Promotion[], Error>({
    queryKey: producerKeys.promotions(),
    queryFn: async () => {
      try {
        return await fetchAll<Promotion>('promotions', 'created_at');
      } catch (err) {
        console.warn('[promotions] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as Promotion[],
  });
}

export function useDistribution() {
  return useQuery<DistributionDeal[], Error>({
    queryKey: producerKeys.distribution(),
    queryFn: async () => {
      try {
        return await fetchAll<DistributionDeal>('distribution', 'created_at');
      } catch (err) {
        console.warn('[distribution] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as DistributionDeal[],
  });
}

export function useFollowers() {
  return useQuery<Follower[], Error>({
    queryKey: producerKeys.followers(),
    queryFn: async () => {
      try {
        return await fetchAll<Follower>('followers', 'followed_at');
      } catch (err) {
        console.warn('[followers] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as Follower[],
  });
}

export function useNotifications(): { data: AppNotification[]; isLoading: boolean } {
  const q = useQuery<AppNotification[], Error>({
    queryKey: producerKeys.notifications(),
    queryFn: async () => {
      try {
        return await fetchAll<AppNotification>('notifications', 'created_at');
      } catch (err) {
        console.warn('[notifications] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as AppNotification[],
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}

/** Aggregated KPI rollups for the dashboard + analytics views. */
export function useDashboardStats() {
  const analytics = useAnalytics();
  const revenue = useRevenue();
  const followers = useFollowers();
  const comments = useComments();

  const events = analytics.data ?? [];
  const revenueLines = revenue.data ?? [];

  const plays = events.filter((e) => e.event_type === 'play').length;
  const completes = events.filter((e) => e.event_type === 'complete').length;
  const skips = events.filter((e) => e.event_type === 'skip').length;
  const likes = events.filter((e) => e.event_type === 'like').length;

  const totalRevenueCents = revenueLines.reduce((sum, r) => sum + r.amount_cents, 0);

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentPlays = events.filter(
    (e) => e.event_type === 'play' && new Date(e.occurred_at).getTime() >= sevenDaysAgo,
  ).length;

  const completionRate = plays > 0 ? (completes / plays) * 100 : 0;

  const revenueBySource = revenueLines.reduce<Record<string, number>>((acc, r) => {
    acc[r.source] = (acc[r.source] ?? 0) + r.amount_cents;
    return acc;
  }, {});

  const playsByDay = events
    .filter((e) => e.event_type === 'play')
    .reduce<Record<string, number>>((acc, e) => {
      const day = new Date(e.occurred_at).toISOString().slice(0, 10);
      acc[day] = (acc[day] ?? 0) + 1;
      return acc;
    }, {});

  return {
    plays,
    completes,
    skips,
    likes,
    completionRate,
    recentPlays,
    totalRevenueCents,
    followers: (followers.data ?? []).length,
    comments: (comments.data ?? []).length,
    revenueBySource,
    playsByDay,
    isLoading: analytics.isLoading || revenue.isLoading || followers.isLoading,
  };
}

// ---------------------------------------------------------------------------
// Mutations: likes, comments, notifications, promotions, distribution,
// collaborations, playlists, followers
// ---------------------------------------------------------------------------

const PRODUCER_EMAIL = 'studio@pulse.fm';

// --- Likes -----------------------------------------------------------------

export function useLikedTracks() {
  return useQuery<Track[], Error>({
    queryKey: ['liked_tracks'],
    queryFn: async () => {
      try {
        const { data: likes, error: e1 } = await supabase
          .from('liked_tracks')
          .select('track_id')
          .eq('user_email', PRODUCER_EMAIL);
        if (e1) throw e1;
        const ids = (likes ?? []).map((l) => l.track_id);
        if (ids.length === 0) return [];
        const { data: tracks, error: e2 } = await supabase
          .from('tracks')
          .select('*')
          .in('id', ids)
          .order('created_at', { ascending: false });
        if (e2) throw e2;
        return (tracks as Track[]) ?? [];
      } catch (err) {
        console.warn('[liked_tracks] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as Track[],
  });
}

export function useLikedTrackIds() {
  return useQuery<Set<string>, Error>({
    queryKey: ['liked_track_ids'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('liked_tracks')
          .select('track_id')
          .eq('user_email', PRODUCER_EMAIL);
        if (error) throw error;
        return new Set((data ?? []).map((l) => l.track_id));
      } catch (err) {
        console.warn('[liked_track_ids] fetch failed', err);
        return new Set<string>();
      }
    },
    staleTime: 1000 * 10,
  });
}

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trackId, liked }: { trackId: string; liked: boolean }) => {
      if (liked) {
        const { error } = await supabase
          .from('liked_tracks')
          .delete()
          .eq('user_email', PRODUCER_EMAIL)
          .eq('track_id', trackId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('liked_tracks')
          .insert({ user_email: PRODUCER_EMAIL, track_id: trackId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['liked_tracks'] });
      void qc.invalidateQueries({ queryKey: ['liked_track_ids'] });
    },
  });
}

// --- Comments --------------------------------------------------------------

export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trackId, author, body }: { trackId: string; author: string; body: string }) => {
      const { data, error } = await supabase
        .from('comments')
        .insert({ track_id: trackId, author, body })
        .select()
        .single();
      if (error) throw error;
      return data as Comment;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('comments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['comments'] });
    },
  });
}

// --- Notifications ---------------------------------------------------------

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .is('read_at', null);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// --- Promotions ------------------------------------------------------------

export function useCreatePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      track_id: string | null;
      name: string;
      budget_cents: number;
      starts_at: string | null;
      ends_at: string | null;
    }) => {
      const { data, error } = await supabase
        .from('promotions')
        .insert({ ...input, status: 'active', impressions: 0, clicks: 0 })
        .select()
        .single();
      if (error) throw error;
      return data as Promotion;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

export function useUpdatePromotionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Promotion['status'] }) => {
      const { error } = await supabase.from('promotions').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

export function useDeletePromotion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('promotions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}

// --- Distribution ----------------------------------------------------------

export function useDistributeTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ trackId, store }: { trackId: string; store: string }) => {
      const { data, error } = await supabase
        .from('distribution')
        .insert({ track_id: trackId, store, status: 'processing' })
        .select()
        .single();
      if (error) throw error;
      return data as DistributionDeal;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['distribution'] });
    },
  });
}

export function useRetryDistribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('distribution')
        .update({ status: 'processing' })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['distribution'] });
    },
  });
}

// --- Collaborations --------------------------------------------------------

export function useInviteCollaboration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; collaborator: string; role: string }) => {
      const { data, error } = await supabase
        .from('collaborations')
        .insert({ title: input.title, collaborator: input.collaborator, role: input.role, status: 'invited' })
        .select()
        .single();
      if (error) throw error;
      return data as Collaboration;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['collaborations'] });
    },
  });
}

export function useUpdateCollaborationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Collaboration['status'] }) => {
      const { error } = await supabase.from('collaborations').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['collaborations'] });
    },
  });
}

// --- Playlists -------------------------------------------------------------

export function useCreatePlaylist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; description: string; cover_art_url: string }) => {
      const { data, error } = await supabase
        .from('playlists')
        .insert({ ...input, track_ids: [] })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}

// --- Followers -------------------------------------------------------------

export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, followed }: { id: string; followed: boolean }) => {
      if (followed) {
        const { error } = await supabase.from('followers').delete().eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('followers')
          .insert({ handle: 'new-fan', display_name: 'New Fan' })
          .select()
          .single();
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['followers'] });
    },
  });
}
