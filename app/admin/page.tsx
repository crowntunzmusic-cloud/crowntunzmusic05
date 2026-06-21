'use client';

import { ShieldCheck, LayoutGrid, Users, ToggleRight, History, Sliders, Inbox } from 'lucide-react';
import { PageHeader } from '@/components/producer/primitives';
import { AdminOverview } from '@/components/admin/overview-panel';
import { AdminUsersPanel } from '@/components/admin/users-panel';
import { AdminFeaturesPanel } from '@/components/admin/features-panel';
import { AdminAuditPanel } from '@/components/admin/audit-panel';
import { AdminPlatformSettingsPanel } from '@/components/admin/platform-settings-panel';
import { AdminSubmissionsPanel } from '@/components/admin/submissions-panel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function AdminPage() {
  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Super Admin"
        description="Manage users and control platform features."
        icon={ShieldCheck}
      />

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-2 md:w-fit md:grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <ToggleRight className="h-4 w-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Sliders className="h-4 w-4" />
            <span className="hidden sm:inline">Controls</span>
          </TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Review</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Audit Log</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <AdminOverview />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <AdminUsersPanel />
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <AdminFeaturesPanel />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <AdminPlatformSettingsPanel />
        </TabsContent>

        <TabsContent value="submissions" className="mt-4">
          <AdminSubmissionsPanel />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AdminAuditPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
