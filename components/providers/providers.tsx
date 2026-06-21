'use client';

import { ThemeProvider } from 'next-themes';
import { QueryProvider } from '@/components/providers/query-provider';
import { FeatureFlagProvider } from '@/components/providers/feature-flag-provider';
import { AppShell } from '@/components/layout/app-shell';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryProvider>
        <FeatureFlagProvider>
          <AppShell>{children}</AppShell>
        </FeatureFlagProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
