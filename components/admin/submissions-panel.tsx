'use client';

import { Check, X, Clock3, Music2, Inbox } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/producer/primitives';
import { useTrackSubmissions, useReviewSubmission } from '@/hooks/use-studio';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-destructive/15 text-destructive',
};

export function AdminSubmissionsPanel() {
  const { data: submissions, isLoading } = useTrackSubmissions();
  const reviewMutation = useReviewSubmission();
  const { toast } = useToast();

  const handleReview = (id: string, status: 'approved' | 'rejected') => {
    reviewMutation.mutate(
      { id, status },
      {
        onSuccess: () => {
          toast({
            title: status === 'approved' ? 'Submission approved' : 'Submission rejected',
            description: status === 'approved'
              ? 'The track is now published and visible.'
              : 'The track submission has been rejected.',
          });
        },
        onError: () => {
          toast({ title: 'Action failed', description: 'Could not review submission.', variant: 'destructive' });
        },
      },
    );
  };

  const pendingCount = (submissions ?? []).filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-3">
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          <Inbox className="h-4 w-4 shrink-0" />
          <span>{pendingCount} submission{pendingCount > 1 ? 's' : ''} awaiting review.</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (submissions ?? []).length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No submissions"
          description="When submit-track approval is enabled, new uploads will appear here for review."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
          <ul className="divide-y divide-border/40">
            {(submissions ?? []).map((sub) => {
              const track = sub.tracks;
              return (
                <li key={sub.id} className="flex items-center gap-3 px-4 py-3">
                  {track ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={track.cover_art_url} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-secondary">
                      <Music2 className="h-5 w-5 text-muted-foreground" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{track?.title ?? 'Unknown track'}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {track?.artist ?? 'Unknown'} · submitted by {sub.submitted_by}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {new Date(sub.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {sub.reviewed_at && ` · reviewed ${new Date(sub.reviewed_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', statusColors[sub.status])}>
                    {sub.status}
                  </span>
                  {sub.status === 'pending' && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
                        onClick={() => handleReview(sub.id, 'approved')}
                        disabled={reviewMutation.isPending}
                        aria-label="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleReview(sub.id, 'rejected')}
                        disabled={reviewMutation.isPending}
                        aria-label="Reject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {sub.status !== 'pending' && (
                    <Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
