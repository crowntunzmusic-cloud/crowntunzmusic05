'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ListMusic, Plus } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/producer/primitives';
import { usePlaylists } from '@/hooks/use-tracks';
import { useCreatePlaylist } from '@/hooks/use-producer';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import { FeatureGate } from '@/components/admin/feature-gate';

const PEXELS_COVERS = [
  'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2015156/pexels-photo-2015156.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4517/pexels-photo-4517.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2466895/pexels-photo-2466895.jpeg?auto=compress&cs=tinysrgb&w=600',
];

export default function PlaylistsPage() {
  const { data: playlists } = usePlaylists();
  const list = playlists ?? [];
  const { toast } = useToast();
  const createPlaylist = useCreatePlaylist();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
  };

  const submitPlaylist = () => {
    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Title required',
        description: 'Give your playlist a name.',
      });
      return;
    }
    const cover_art_url =
      PEXELS_COVERS[Math.floor(Math.random() * PEXELS_COVERS.length)];
    createPlaylist.mutate(
      { title: title.trim(), description: description.trim(), cover_art_url },
      {
        onSuccess: () => {
          toast({ title: 'Playlist created', description: `"${title.trim()}" is ready.` });
          resetForm();
          setOpen(false);
        },
        onError: () => {
          toast({
            variant: 'destructive',
            title: 'Something went wrong',
            description: 'Could not create playlist. Please try again.',
          });
        },
      },
    );
  };

  return (
    <FeatureGate featureKey="playlists">
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Playlists"
        description="Curated collections you manage."
        icon={ListMusic}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                <Plus className="h-4 w-4" />
                New playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogTitle>Create a playlist</DialogTitle>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="pl-title">Title</Label>
                  <Input
                    id="pl-title"
                    placeholder="My new playlist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pl-desc">Description</Label>
                  <Textarea
                    id="pl-desc"
                    placeholder="What's this playlist about?"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    disabled={createPlaylist.isPending || !title.trim()}
                    onClick={submitPlaylist}
                  >
                    {createPlaylist.isPending ? 'Creating…' : 'Create playlist'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {list.length === 0 ? (
        <EmptyState icon={ListMusic} title="No playlists" description="Create one to group tracks." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((pl) => (
            <Link
              key={pl.id}
              href={`/playlist/${pl.id}`}
              className="group flex flex-col gap-3 rounded-lg bg-card/60 p-3 transition-all duration-300 hover:bg-card hover:shadow-lg hover:shadow-black/30 hover:-translate-y-1"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pl.cover_art_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">{pl.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {pl.track_ids.length} tracks
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
