'use client';

import { useState } from 'react';
import { UploadCloud, Loader2, Lock, Globe, Download, DollarSign, Music2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useUploadTrack } from '@/hooks/use-studio';
import type { OwnershipType, TrackTier, DownloadType } from '@/lib/types';
import { cn } from '@/lib/utils';

const SAMPLE_AUDIO = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
];
const SAMPLE_COVERS = [
  'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3864633/pexels-photo-3864633.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1238941/pexels-photo-1238941.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export function UploadTrackDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('Crowntunz Music');
  const [genre, setGenre] = useState('');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('full');
  const [tier, setTier] = useState<TrackTier>('free');
  const [downloadType, setDownloadType] = useState<DownloadType>('free_download');
  const [priceCents, setPriceCents] = useState(0);
  const uploadMutation = useUploadTrack();
  const { toast } = useToast();

  // Determine distribution eligibility from the rules the admin controls.
  const isFreeBeat = ownershipType === 'beat_license' && tier === 'free';
  const distributionEligible = !isFreeBeat;

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Give your track a name first.', variant: 'destructive' });
      return;
    }
    const audioUrl = SAMPLE_AUDIO[Math.floor(Math.random() * SAMPLE_AUDIO.length)];
    const coverArtUrl = SAMPLE_COVERS[Math.floor(Math.random() * SAMPLE_COVERS.length)];

    uploadMutation.mutate(
      {
        title: title.trim(),
        artist: artist.trim() || 'Crowntunz Music',
        audio_url: audioUrl,
        cover_art_url: coverArtUrl,
        genre: genre.trim() || undefined,
        ownership_type: ownershipType,
        tier,
        download_type: downloadType,
        price_cents: tier === 'premium' && downloadType === 'paid_purchase' ? priceCents : 0,
        distribution_eligible: distributionEligible,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Track uploaded',
            description: isFreeBeat
              ? 'Your free beat is live on the platform only — not eligible for global distribution.'
              : 'Your track is uploaded and eligible for global distribution.',
          });
          setOpen(false);
          setTitle('');
          setGenre('');
        },
        onError: () => {
          toast({ title: 'Upload failed', description: 'Something went wrong.', variant: 'destructive' });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5" />
            Upload a track
          </DialogTitle>
          <DialogDescription>
            Choose ownership and pricing. Free beats stay on the platform; full-owned tracks can go global.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="up-title">Track title</Label>
              <Input id="up-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song or beat name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="up-artist">Artist name</Label>
              <Input id="up-artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="up-genre">Genre (optional)</Label>
            <Input id="up-genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Hip-Hop, Pop, Lo-fi…" />
          </div>

          {/* Ownership type */}
          <div className="space-y-2">
            <Label>Ownership type</Label>
            <RadioGroup
              value={ownershipType}
              onValueChange={(v) => setOwnershipType(v as OwnershipType)}
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              <label className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                ownershipType === 'full' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
              )}>
                <RadioGroupItem value="full" className="mt-0.5" />
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <Music2 className="h-3.5 w-3.5" /> Full ownership
                  </p>
                  <p className="text-xs text-muted-foreground">You own all rights. Eligible for global distribution.</p>
                </div>
              </label>
              <label className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                ownershipType === 'beat_license' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
              )}>
                <RadioGroupItem value="beat_license" className="mt-0.5" />
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium">
                    <DollarSign className="h-3.5 w-3.5" /> Beat license
                  </p>
                  <p className="text-xs text-muted-foreground">Instrumental beat licensed to others. Free beats stay on-platform.</p>
                </div>
              </label>
            </RadioGroup>
          </div>

          {/* Tier */}
          <div className="space-y-2">
            <Label>Tier</Label>
            <RadioGroup
              value={tier}
              onValueChange={(v) => setTier(v as TrackTier)}
              className="grid grid-cols-2 gap-2"
            >
              <label className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors',
                tier === 'free' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
              )}>
                <RadioGroupItem value="free" />
                Free
              </label>
              <label className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors',
                tier === 'premium' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
              )}>
                <RadioGroupItem value="premium" />
                Premium
              </label>
            </RadioGroup>
          </div>

          {/* Download type */}
          <div className="space-y-2">
            <Label>Download & purchase</Label>
            <RadioGroup
              value={downloadType}
              onValueChange={(v) => setDownloadType(v as DownloadType)}
              className="space-y-2"
            >
              <label className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-sm transition-colors',
                downloadType === 'free_download' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
              )}>
                <RadioGroupItem value="free_download" />
                <span className="flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Free download</span>
              </label>
              <label className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-sm transition-colors',
                downloadType === 'paid_purchase' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
                tier !== 'premium' && 'opacity-50 pointer-events-none',
              )}>
                <RadioGroupItem value="paid_purchase" disabled={tier !== 'premium'} />
                <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Paid purchase</span>
              </label>
              <label className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 text-sm transition-colors',
                downloadType === 'streaming_only' ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary/50',
              )}>
                <RadioGroupItem value="streaming_only" />
                <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Streaming only (no download)</span>
              </label>
            </RadioGroup>
          </div>

          {/* Price (only for paid purchase) */}
          {tier === 'premium' && downloadType === 'paid_purchase' && (
            <div className="space-y-2">
              <Label htmlFor="up-price">Price (USD)</Label>
              <Input
                id="up-price"
                type="number"
                min={0}
                step={0.5}
                value={priceCents / 100}
                onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value || '0') * 100))}
                placeholder="2.99"
              />
            </div>
          )}

          {/* Distribution eligibility summary */}
          <div className={cn(
            'flex items-start gap-2 rounded-lg border p-3 text-xs',
            distributionEligible
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-400',
          )}>
            {distributionEligible ? (
              <Globe className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>
              {distributionEligible
                ? 'This track is eligible for global distribution to Spotify, Apple Music, and more.'
                : 'Free beats are distributed only within the Crowntunz platform — not eligible for global distribution.'}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploadMutation.isPending} className="gap-2">
            {uploadMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploadMutation.isPending ? 'Uploading…' : 'Upload track'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
