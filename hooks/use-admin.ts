'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { AuditEntry, FeatureFlag, UserProfile } from '@/lib/types';

export const adminKeys = {
  all: ['admin'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  flags: () => [...adminKeys.all, 'flags'] as const,
  audit: () => [...adminKeys.all, 'audit'] as const,
};

async function fetchProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('joined_at', { ascending: false });
  if (error) throw error;
  return (data as UserProfile[]) ?? [];
}

async function fetchFlags(): Promise<FeatureFlag[]> {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .order('category', { ascending: true });
  if (error) throw error;
  return (data as FeatureFlag[]) ?? [];
}

async function fetchAudit(): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data as AuditEntry[]) ?? [];
}

export function useAdminUsers() {
  return useQuery<UserProfile[], Error>({
    queryKey: adminKeys.users(),
    queryFn: async () => {
      try {
        return await fetchProfiles();
      } catch (err) {
        console.warn('[admin/users] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as UserProfile[],
  });
}

export function useFeatureFlagsQuery() {
  return useQuery<FeatureFlag[], Error>({
    queryKey: adminKeys.flags(),
    queryFn: async () => {
      try {
        return await fetchFlags();
      } catch (err) {
        console.warn('[admin/flags] fetch failed', err);
        return [];
      }
    },
    staleTime: 1000 * 30,
  });
}

export function useAuditLog() {
  return useQuery<AuditEntry[], Error>({
    queryKey: adminKeys.audit(),
    queryFn: async () => {
      try {
        return await fetchAudit();
      } catch (err) {
        console.warn('[admin/audit] fetch failed', err);
        return [];
      }
    },
    placeholderData: () => [] as AuditEntry[],
  });
}

async function toggleUserDisabled(id: string, disabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_disabled: disabled })
    .eq('id', id);
  if (error) throw error;

  await supabase.from('admin_audit_log').insert({
    action: disabled ? 'user.disable' : 'user.enable',
    target_type: 'user',
    target_id: id,
    detail: { is_disabled: disabled },
    performed_by: 'super_admin',
  });
}

export function useToggleUserDisabled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      toggleUserDisabled(id, disabled),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.users() });
      void qc.invalidateQueries({ queryKey: adminKeys.audit() });
    },
  });
}

async function setFeatureFlag(key: string, enabled: boolean): Promise<void> {
  const { error } = await supabase
    .from('feature_flags')
    .update({ is_enabled: enabled, updated_by: 'super_admin', updated_at: new Date().toISOString() })
    .eq('feature_key', key);
  if (error) throw error;

  await supabase.from('admin_audit_log').insert({
    action: 'feature.toggle',
    target_type: 'feature',
    target_id: key,
    detail: { is_enabled: enabled },
    performed_by: 'super_admin',
  });
}

export function useToggleFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
      setFeatureFlag(key, enabled),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.flags() });
      void qc.invalidateQueries({ queryKey: adminKeys.audit() });
    },
  });
}
