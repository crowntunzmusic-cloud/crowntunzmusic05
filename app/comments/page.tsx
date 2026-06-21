'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, Pin, Trash2, Send } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/producer/primitives';
import { useComments, useAddComment, useDeleteComment } from '@/hooks/use-producer';
import { useToast } from '@/hooks/use-toast';
import { useTracks } from '@/hooks/use-tracks';
import { FeatureGate } from '@/components/admin/feature-gate';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function CommentsPage() {
  const { data: comments, isLoading } = useComments();
  const { data: catalog } = useTracks();
  const { toast } = useToast();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [body, setBody] = useState('');
  const [trackId, setTrackId] = useState('');
  const [pinned, setPinned] = useState<Set<string>>(new Set());

  const trackMap = useMemo(
    () => new Map((catalog ?? []).map((t) => [t.id, t])),
    [catalog],
  );

  const sortedComments = useMemo(() => {
    const list = comments ?? [];
    return [...list].sort((a, b) => {
      const aPin = pinned.has(a.id) ? 0 : 1;
      const bPin = pinned.has(b.id) ? 0 : 1;
      if (aPin !== bPin) return aPin - bPin;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [comments, pinned]);

  const submitComment = () => {
    if (!trackId) {
      toast({
        variant: 'destructive',
        title: 'Select a track',
        description: 'Choose which track this comment is for.',
      });
      return;
    }
    if (!body.trim()) {
      toast({
        variant: 'destructive',
        title: 'Empty comment',
        description: 'Write something before posting.',
      });
      return;
    }
    addComment.mutate(
      { trackId, author: 'Crowntunz Music', body: body.trim() },
      {
        onSuccess: () => {
          setBody('');
          toast({ title: 'Comment posted', description: 'Your feedback is live.' });
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: 'Something went wrong',
            description: 'Could not post your comment. Please try again.',
          });
        },
      },
    );
  };

  const togglePin = (id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const firstTrackId = (catalog ?? [])[0]?.id ?? '';
  const activeTrackId = trackId || firstTrackId;

  return (
    <FeatureGate featureKey="comments">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Comments"
        description="Listener feedback across your tracks."
        icon={MessageSquare}
      />

      <div className="rounded-xl bg-card/60 p-4">
        <div className="space-y-3">
          <select
            value={activeTrackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="" disabled>
              Select a track…
            </option>
            {(catalog ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} — {t.artist}
              </option>
            ))}
          </select>
          <Textarea
            placeholder="Write a comment…"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              className="gap-1.5"
              disabled={addComment.isPending || !body.trim() || !activeTrackId}
              onClick={submitComment}
            >
              <Send className="h-3.5 w-3.5" />
              Post comment
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : (comments ?? []).length === 0 ? (
        <EmptyState icon={MessageSquare} title="No comments yet" description="Feedback from listeners will appear here." />
      ) : (
        <ul className="space-y-2">
          {sortedComments.map((c) => {
            const track = trackMap.get(c.track_id);
            const initials = c.author
              .split(/[\s_]+/)
              .map((p) => p[0]?.toUpperCase() ?? '')
              .slice(0, 2)
              .join('');
            const isPinned = pinned.has(c.id);
            return (
              <li
                key={c.id}
                className={cn(
                  'flex items-start gap-3 rounded-xl bg-card/60 p-3 transition-colors hover:bg-card',
                  isPinned && 'ring-1 ring-primary/40',
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-secondary text-xs">
                    {initials || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{c.author}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {track && (
                    <p className="truncate text-xs text-primary hover:underline">
                      on {track.title}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                </div>
                <div className="hidden gap-1 sm:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-7 text-xs', isPinned && 'text-primary')}
                    onClick={() => togglePin(c.id)}
                  >
                    <Pin className="h-3.5 w-3.5" />
                    {isPinned ? 'Pinned' : 'Pin'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    disabled={deleteComment.isPending}
                    onClick={() =>
                      deleteComment.mutate(c.id, {
                        onSuccess: () => {
                          toast({ title: 'Comment deleted' });
                        },
                        onError: () => {
                          toast({
                            variant: 'destructive',
                            title: 'Something went wrong',
                            description: 'Could not delete comment.',
                          });
                        },
                      })
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
    </FeatureGate>
  );
}
