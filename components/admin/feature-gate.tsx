'use client';

import { Lock } from 'lucide-react';
import { useFeatureFlags } from '@/components/providers/feature-flag-provider';

export function FeatureGate({
  featureKey,
  children,
  fallback,
}: {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isEnabled, isLoading } = useFeatureFlags();

  if (isLoading) {
    return null;
  }

  if (!isEnabled(featureKey)) {
    return (
      <>{fallback ?? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center animate-fade-in">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-semibold">This feature is currently disabled</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              An administrator has turned off this part of the platform. Please check back later.
            </p>
          </div>
        </div>
      )}</>
    );
  }

  return <>{children}</>;
}
