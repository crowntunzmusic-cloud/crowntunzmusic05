'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useFeatureFlagsQuery } from '@/hooks/use-admin';
import type { FeatureFlag } from '@/lib/types';

interface FeatureFlagContextValue {
  flags: FeatureFlag[];
  isEnabled: (key: string) => boolean;
  isLoading: boolean;
  isAdmin: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue>({
  flags: [],
  isEnabled: () => true,
  isLoading: false,
  isAdmin: true,
});

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const { data: flags, isLoading } = useFeatureFlagsQuery();

  const value = useMemo<FeatureFlagContextValue>(() => {
    const flagMap = new Map((flags ?? []).map((f) => [f.feature_key, f.is_enabled]));
    return {
      flags: flags ?? [],
      isEnabled: (key: string) => flagMap.get(key) ?? true,
      isLoading,
      // Demo: this build has no real auth, so the session is treated as a super_admin.
      isAdmin: true,
    };
  }, [flags, isLoading]);

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext);
}
