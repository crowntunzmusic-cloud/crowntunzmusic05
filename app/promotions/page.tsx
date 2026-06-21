'use client';

import { useMemo, useState } from 'react';
import { Megaphone, Plus, MousePointerClick, Eye, Trash2 } from 'lucide-react';
import { PageHeader, EmptyState, StatusBadge, StatCard } from '@/components/producer/primitives';
import {
  usePromotions,
  useCreatePromotion,
  useUpdatePromotionStatus,
  useDeletePromotion,
} from '@/hooks/use-producer';
import { useToast } from '@/hooks/use-toast';
import { useTracks } from '@/hooks/use-tracks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Promotion } from '@/lib/types';
import { FeatureGate } from '@/components/admin/feature-gate';

export default function PromotionsPage() {
  const { data: promos, isLoading } = usePromotions();
  const { data: catalog } = useTracks();
  const { toast } = useToast();
  const createPromotion = useCreatePromotion();
  const updatePromotionStatus = useUpdatePromotionStatus();
  const deletePromotion = useDeletePromotion();
  const trackMap = useMemo(
    () => new Map((catalog ?? []).map((t) => [t.id, t])),
    [catalog],
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    budget: '',
    trackId: '',
    startsAt: '',
    endsAt: '',
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createPromotion.mutate(
      {
        track_id: form.trackId || null,
        name: form.name,
        budget_cents: Math.round(Number(form.budget) * 100),
        starts_at: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        ends_at: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      },
      {
        onSuccess: () => {
          toast({ title: 'Campaign created' });
          setForm({ name: '', budget: '', trackId: '', startsAt: '', endsAt: '' });
          setCreateOpen(false);
        },
        onError: (err) =>
          toast({
            title: 'Failed to create campaign',
            description: err.message,
            variant: 'destructive',
          }),
      },
    );
  }

  function handleStatusToggle(id: string, current: Promotion['status']) {
    const next: Promotion['status'] = current === 'active' ? 'paused' : 'active';
    updatePromotionStatus.mutate(
      { id, status: next },
      {
        onSuccess: () =>
          toast({ title: next === 'active' ? 'Campaign resumed' : 'Campaign paused' }),
        onError: (err) =>
          toast({
            title: 'Failed to update campaign',
            description: err.message,
            variant: 'destructive',
          }),
      },
    );
  }

  function handleDelete(id: string) {
    deletePromotion.mutate(id, {
      onSuccess: () => toast({ title: 'Campaign deleted' }),
      onError: (err) =>
        toast({
          title: 'Failed to delete campaign',
          description: err.message,
          variant: 'destructive',
        }),
    });
  }

  const totalBudget = (promos ?? []).reduce((s, p) => s + p.budget_cents, 0);
  const totalImpressions = (promos ?? []).reduce((s, p) => s + p.impressions, 0);
  const totalClicks = (promos ?? []).reduce((s, p) => s + p.clicks, 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <FeatureGate featureKey="promotions">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Promotions"
        description="Marketing campaigns across your catalog."
        icon={Megaphone}
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <Plus className="h-4 w-4" />
                New campaign
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>New campaign</DialogTitle>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="promo-name">Campaign name</Label>
                  <Input
                    id="promo-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promo-budget">Budget (USD)</Label>
                  <Input
                    id="promo-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Track</Label>
                  <Select
                    value={form.trackId}
                    onValueChange={(v) => setForm((f) => ({ ...f, trackId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a track" />
                    </SelectTrigger>
                    <SelectContent>
                      {(catalog ?? []).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="promo-start">Start date</Label>
                    <Input
                      id="promo-start"
                      type="date"
                      value={form.startsAt}
                      onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo-end">End date</Label>
                    <Input
                      id="promo-end"
                      type="date"
                      value={form.endsAt}
                      onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={createPromotion.isPending} className="w-full">
                  {createPromotion.isPending ? 'Creating…' : 'Create campaign'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-secondary/40" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Total budget" value={`$${(totalBudget / 100).toFixed(2)}`} icon={Megaphone} />
          <StatCard label="Impressions" value={totalImpressions.toLocaleString()} icon={Eye} />
          <StatCard label="Click-through rate" value={`${ctr.toFixed(1)}%`} icon={MousePointerClick} />
        </div>
      )}

      {(promos ?? []).length === 0 && !isLoading ? (
        <EmptyState
          icon={Megaphone}
          title="No campaigns running"
          description="Create a promotion to boost a track to new listeners."
        />
      ) : (
        <div className="space-y-2">
          {(promos ?? []).map((p) => {
            const track = p.track_id ? trackMap.get(p.track_id) : undefined;
            const spentPct =
              p.budget_cents > 0
                ? Math.min(100, (p.clicks * 12 / p.budget_cents) * 100)
                : 0;
            return (
              <div
                key={p.id}
                className="rounded-xl bg-card/60 p-4 transition-colors hover:bg-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {track ? `for ${track.title}` : 'No track linked'}
                      {p.starts_at && ` · ${new Date(p.starts_at).toLocaleDateString()}`}
                      {p.ends_at ? ` → ${new Date(p.ends_at).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={updatePromotionStatus.isPending}
                      onClick={() => handleStatusToggle(p.id, p.status)}
                    >
                      {p.status === 'active' ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletePromotion.isPending}
                      onClick={() => handleDelete(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-4 text-right text-xs">
                      <div>
                        <p className="font-semibold tabular-nums">{p.impressions.toLocaleString()}</p>
                        <p className="text-muted-foreground">impressions</p>
                      </div>
                      <div>
                        <p className="font-semibold tabular-nums">{p.clicks.toLocaleString()}</p>
                        <p className="text-muted-foreground">clicks</p>
                      </div>
                      <div>
                        <p className="font-semibold tabular-nums text-primary">
                          ${(p.budget_cents / 100).toFixed(0)}
                        </p>
                        <p className="text-muted-foreground">budget</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(2, spentPct)}%` }}
                  />
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
