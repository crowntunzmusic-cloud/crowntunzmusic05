'use client';

import { useState } from 'react';
import { PenLine, Sparkles, Save, Copy, Clock, Trash2, Loader2 } from 'lucide-react';
import { PageHeader, EmptyState, SectionCard } from '@/components/producer/primitives';
import { FeatureGate } from '@/components/admin/feature-gate';
import { useLyrics, useSaveLyrics, generateLyrics } from '@/hooks/use-studio';
import { usePlatformSettings } from '@/hooks/use-studio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const GENRES = ['Pop', 'Hip-Hop', 'R&B', 'Country', 'Rock', 'EDM', 'Lo-fi', 'Afrobeat'];
const MOODS = ['romantic', 'motivational', 'melancholic', 'energetic', 'chill', 'dark'];
const STRUCTURES = ['verse-chorus', 'verse-bridge', 'hook-driven', 'ballad'];

export default function LyricsPage() {
  return (
    <FeatureGate featureKey="lyrics_tool">
      <LyricsContent />
    </FeatureGate>
  );
}

function LyricsContent() {
  const { data: savedLyrics, isLoading } = useLyrics();
  const { data: settings } = usePlatformSettings();
  const saveMutation = useSaveLyrics();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('romantic');
  const [structure, setStructure] = useState('verse-chorus');
  const [theme, setTheme] = useState('love and freedom');
  const [generated, setGenerated] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    const finalTitle = title.trim() || `${genre} · ${mood}`;
    setTimeout(() => {
      const lyrics = generateLyrics({
        title: finalTitle,
        genre,
        mood,
        structure,
        theme: theme.trim() || 'you and me',
      });
      setGenerated(lyrics);
      setGenerating(false);
    }, 600);
  };

  const handleSave = () => {
    if (!generated) return;
    const finalTitle = title.trim() || `${genre} · ${mood} · ${Date.now().toString().slice(-4)}`;
    saveMutation.mutate(
      {
        id: crypto.randomUUID(),
        title: finalTitle,
        genre,
        mood,
        structure,
        body: generated,
        author: 'Crowntunz Music',
        created_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast({ title: 'Lyrics saved', description: `"${finalTitle}" added to your library.` });
          setGenerated('');
          setTitle('');
        },
        onError: () => {
          toast({ title: 'Save failed', description: 'Could not save lyrics.', variant: 'destructive' });
        },
      },
    );
  };

  const handleCopy = () => {
    if (!generated) return;
    void navigator.clipboard.writeText(generated);
    toast({ title: 'Copied', description: 'Lyrics copied to your clipboard.' });
  };

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Lyrics Songwriter"
        description="Generate song lyrics in any genre, mood, or structure."
        icon={PenLine}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Generator inputs */}
        <SectionCard title="Lyric generator" description="Describe what you want — we will write the rest.">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lyric-title">Song title (optional)</Label>
              <Input
                id="lyric-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Leave blank to auto-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mood</Label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MOODS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Structure</Label>
                <Select value={structure} onValueChange={setStructure}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STRUCTURES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lyric-theme">Theme / keyword</Label>
                <Input
                  id="lyric-theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="e.g. heartbreak, rising up"
                />
              </div>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating ? 'Writing…' : 'Generate lyrics'}
            </Button>
          </div>
        </SectionCard>

        {/* Generated lyrics output */}
        <SectionCard
          title="Generated lyrics"
          description="Review, edit, and save to your library."
          action={
            generated && (
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
              </div>
            )
          }
        >
          {generating ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${60 + Math.random() * 35}%` }} />
              ))}
            </div>
          ) : generated ? (
            <Textarea
              value={generated}
              onChange={(e) => setGenerated(e.target.value)}
              rows={16}
              className="min-h-[300px] resize-none font-mono text-sm leading-relaxed"
            />
          ) : (
            <div className="grid min-h-[300px] place-items-center">
              <EmptyState
                icon={PenLine}
                title="No lyrics yet"
                description="Set your genre, mood, and theme — then hit Generate."
              />
            </div>
          )}
        </SectionCard>
      </div>

      {/* Saved lyrics library */}
      <SectionCard title="Your lyrics library" description="Saved drafts you can revisit anytime.">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (savedLyrics ?? []).length === 0 ? (
          <EmptyState
            icon={PenLine}
            title="Library is empty"
            description="Generated lyrics you save will appear here."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(savedLyrics ?? []).map((lyric) => (
              <div
                key={lyric.id}
                className="group rounded-xl bg-card/60 p-4 transition-colors hover:bg-card"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{lyric.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {lyric.genre && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                          {lyric.genre}
                        </span>
                      )}
                      {lyric.mood && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] capitalize text-primary">
                          {lyric.mood}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(lyric.created_at).toLocaleDateString()}
                  </span>
                </div>
                <ScrollArea className={cn('max-h-28')}>
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                    {lyric.body.slice(0, 200)}
                    {lyric.body.length > 200 ? '…' : ''}
                  </pre>
                </ScrollArea>
                <div className="mt-2 flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => {
                      void navigator.clipboard.writeText(lyric.body);
                      toast({ title: 'Copied', description: `"${lyric.title}" copied.` });
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground"
                    onClick={() =>
                      toast({ title: 'Delete coming soon', description: 'Lyrics deletion is not wired yet.' })
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {settings && !settings.lyrics_tool_enabled && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
          Note: an administrator has signalled this tool is being phased out — it remains available for now.
        </p>
      )}
    </div>
  );
}
