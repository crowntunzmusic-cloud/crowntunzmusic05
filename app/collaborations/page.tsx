'use client';

import { useState } from 'react';
import { Handshake, UserPlus, Calendar } from 'lucide-react';
import { PageHeader, EmptyState, StatusBadge } from '@/components/producer/primitives';
import {
  useCollaborations,
  useInviteCollaboration,
  useUpdateCollaborationStatus,
} from '@/hooks/use-producer';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { FeatureGate } from '@/components/admin/feature-gate';

export default function CollaborationsPage() {
  const { data: collabs, isLoading } = useCollaborations();
  const { toast } = useToast();
  const inviteCollaboration = useInviteCollaboration();
  const updateCollaborationStatus = useUpdateCollaborationStatus();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({ collaborator: '', title: '', role: '' });

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    inviteCollaboration.mutate(
      { title: form.title, collaborator: form.collaborator, role: form.role },
      {
        onSuccess: () => {
          toast({ title: 'Invitation sent' });
          setForm({ collaborator: '', title: '', role: '' });
          setInviteOpen(false);
        },
        onError: (err) =>
          toast({
            title: 'Failed to invite',
            description: err.message,
            variant: 'destructive',
          }),
      },
    );
  }

  function handleStatus(id: string, status: 'active' | 'declined') {
    updateCollaborationStatus.mutate(
      { id, status },
      {
        onSuccess: () =>
          toast({
            title: status === 'active' ? 'Collaboration accepted' : 'Collaboration declined',
          }),
        onError: (err) =>
          toast({
            title: 'Failed to update collaboration',
            description: err.message,
            variant: 'destructive',
          }),
      },
    );
  }

  return (
    <FeatureGate featureKey="collaborations">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Collaborations"
        description="Joint work, invites, and shared projects."
        icon={Handshake}
        action={
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Invite a collaborator</DialogTitle>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="collaborator">Collaborator name</Label>
                  <Input
                    id="collaborator"
                    value={form.collaborator}
                    onChange={(e) => setForm((f) => ({ ...f, collaborator: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Project title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    placeholder="e.g. vocalist, producer"
                  />
                </div>
                <Button type="submit" disabled={inviteCollaboration.isPending} className="w-full">
                  {inviteCollaboration.isPending ? 'Sending…' : 'Send invite'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : (collabs ?? []).length === 0 ? (
        <EmptyState
          icon={Handshake}
          title="No collaborations"
          description="Invite a collaborator to start a shared project."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(collabs ?? []).map((c) => {
            const initials = c.collaborator
              .split(/[\s_]+/)
              .map((p) => p[0]?.toUpperCase() ?? '')
              .slice(0, 2)
              .join('');
            return (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-xl bg-card/60 p-3 transition-colors hover:bg-card"
              >
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="bg-secondary text-xs">{initials || '?'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    with {c.collaborator}
                    {c.role ? ` · ${c.role}` : ''}
                  </p>
                  <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {(c.status === 'invited' || c.status === 'pending') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updateCollaborationStatus.isPending}
                        onClick={() => handleStatus(c.id, 'active')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updateCollaborationStatus.isPending}
                        onClick={() => handleStatus(c.id, 'declined')}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    Open
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
