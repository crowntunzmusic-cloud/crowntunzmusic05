'use client';

import { useMemo, useState } from 'react';
import { Search, Ban, CheckCircle2, ShieldCheck, Crown, Music2, Headphones } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminUsers, useToggleUserDisabled } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

const roleStyles: Record<UserRole, { label: string; icon: typeof Crown; color: string }> = {
  super_admin: { label: 'Super Admin', icon: ShieldCheck, color: 'bg-violet-500/15 text-violet-400' },
  admin: { label: 'Admin', icon: ShieldCheck, color: 'bg-blue-500/15 text-blue-400' },
  producer: { label: 'Producer', icon: Music2, color: 'bg-primary/15 text-primary' },
  listener: { label: 'Listener', icon: Headphones, color: 'bg-secondary text-muted-foreground' },
};

export function AdminUsersPanel() {
  const { data: users, isLoading } = useAdminUsers();
  const toggle = useToggleUserDisabled();
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  const filtered = useMemo(() => {
    const list = users ?? [];
    let out = list;
    if (roleFilter !== 'all') out = out.filter((u) => u.role === roleFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.display_name ?? '').toLowerCase().includes(q),
      );
    }
    return out;
  }, [users, query, roleFilter]);

  const handleToggle = (user: { id: string; display_name?: string | null; email: string; is_disabled: boolean }) => {
    const next = !user.is_disabled;
    toggle.mutate(
      { id: user.id, disabled: next },
      {
        onSuccess: () => {
          toast({
            title: next ? 'User disabled' : 'User enabled',
            description: `${user.display_name ?? user.email} is now ${next ? 'disabled' : 'active'}.`,
          });
        },
        onError: () => {
          toast({
            title: 'Action failed',
            description: 'Could not update user status. Please try again.',
            variant: 'destructive',
          });
        },
      },
    );
  };

  const totalUsers = (users ?? []).length;
  const disabledCount = (users ?? []).filter((u) => u.is_disabled).length;
  const producerCount = (users ?? []).filter((u) => u.role === 'producer').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl bg-card/60 p-2.5 sm:p-3">
          <p className="text-xl font-bold tabular-nums sm:text-2xl">{totalUsers}</p>
          <p className="text-xs text-muted-foreground">Total users</p>
        </div>
        <div className="rounded-xl bg-card/60 p-2.5 sm:p-3">
          <p className="text-xl font-bold tabular-nums sm:text-2xl">{producerCount}</p>
          <p className="text-xs text-muted-foreground">Producers</p>
        </div>
        <div className="rounded-xl bg-card/60 p-2.5 sm:p-3">
          <p className="text-xl font-bold tabular-nums text-destructive sm:text-2xl">{disabledCount}</p>
          <p className="text-xs text-muted-foreground">Disabled</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="rounded-full bg-secondary/60 pl-10"
          />
        </div>
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
          {(['all', 'super_admin', 'producer', 'listener'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors',
                roleFilter === r
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground',
              )}
            >
              {r === 'all' ? 'All roles' : r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/60 px-4 py-2 text-[11px] uppercase tracking-wide text-muted-foreground md:grid-cols-[2fr_1fr_1fr_auto]">
          <span>User</span>
          <span className="hidden md:block">Role</span>
          <span className="hidden md:block">Last seen</span>
          <span>Status</span>
        </div>
        {isLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">No users match your filters.</p>
        ) : (
          <ul className="divide-y divide-border/40">
            {filtered.map((user) => {
              const role = roleStyles[user.role];
              const RoleIcon = role.icon;
              const initials = (user.display_name ?? user.email)
                .split(/[\s@._]+/)
                .map((p) => p[0]?.toUpperCase() ?? '')
                .slice(0, 2)
                .join('');
              return (
                <li
                  key={user.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/30 md:grid-cols-[2fr_1fr_1fr_auto]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {user.avatar_url && <AvatarImage src={user.avatar_url} alt="" />}
                      <AvatarFallback className="bg-secondary text-xs">{initials || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={cn('truncate text-sm font-medium', user.is_disabled && 'text-muted-foreground line-through')}>
                        {user.display_name ?? user.email}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <span className="hidden md:block">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                        role.color,
                      )}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {role.label}
                    </span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground md:block">
                    {user.last_seen_at
                      ? new Date(user.last_seen_at).toLocaleDateString()
                      : 'Never'}
                  </span>
                  <div className="flex items-center gap-3">
                    {user.is_disabled ? (
                      <Ban className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    <Switch
                      checked={!user.is_disabled}
                      onCheckedChange={() => handleToggle(user)}
                      disabled={user.role === 'super_admin' || toggle.isPending}
                      aria-label={user.is_disabled ? 'Enable user' : 'Disable user'}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Super admins cannot be disabled. Toggling a user records an entry in the audit log.
      </p>
    </div>
  );
}
