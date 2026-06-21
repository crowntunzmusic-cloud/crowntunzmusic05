'use client';

import { useMemo, useState } from 'react';
import { Mail, Send, CornerDownRight, ChevronLeft } from 'lucide-react';
import { PageHeader, EmptyState } from '@/components/producer/primitives';
import { useMessages } from '@/hooks/use-producer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';
import { FeatureGate } from '@/components/admin/feature-gate';

function threadsFrom(messages: Message[]) {
  const map = new Map<string, Message[]>();
  for (const m of [...messages].reverse()) {
    const existing = map.get(m.thread_id);
    if (existing) existing.push(m);
    else map.set(m.thread_id, [m]);
  }
  return Array.from(map.entries()).map(([id, msgs]) => {
    const last = msgs[msgs.length - 1];
    const otherParty =
      msgs[0].sender === 'Crowntunz Music' ? msgs[0].recipient : msgs[0].sender;
    return { id, messages: msgs, last, otherParty };
  });
}

export default function MessagesPage() {
  const { data: messages, isLoading } = useMessages();
  const threads = useMemo(() => threadsFrom(messages), [messages]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const activeThread = threads.find((t) => t.id === activeId) ?? threads[0];

  return (
    <FeatureGate featureKey="messages">
    <div className="space-y-4 pb-4 animate-fade-in">
      <PageHeader
        title="Messages"
        description="Conversations with collaborators and listeners."
        icon={Mail}
      />

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-secondary/40" />
      ) : threads.length === 0 ? (
        <EmptyState icon={Mail} title="No messages yet" description="Conversations will appear here." />
      ) : (
        <div className="grid h-[65vh] grid-cols-1 gap-3 md:grid-cols-[280px_1fr]">
          <aside className={cn('overflow-hidden rounded-xl border border-border/60 bg-card/40', activeThread && 'hidden md:block')}>
            <ScrollArea className="h-full">
              <ul>
                {threads.map((thread) => {
                  const initials = thread.otherParty
                    .split(/[\s_]+/)
                    .map((p) => p[0]?.toUpperCase() ?? '')
                    .slice(0, 2)
                    .join('');
                  const unread =
                    thread.messages.some((m) => !m.read_at && m.recipient === 'Crowntunz Music');
                  return (
                    <li key={thread.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(thread.id)}
                        className={cn(
                          'flex w-full items-center gap-3 border-b border-border/40 px-3 py-3 text-left transition-colors hover:bg-secondary/50',
                          activeThread?.id === thread.id && 'bg-secondary/70',
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-secondary text-xs">
                            {initials || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-medium">{thread.otherParty}</p>
                            {unread && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {thread.last.body}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </aside>

          {activeThread && (
            <section className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 md:block">
              <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="-ml-1 rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
                  aria-label="Back to conversations"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{activeThread.otherParty}</p>
                  <p className="text-xs text-muted-foreground">{activeThread.messages.length} messages</p>
                </div>
              </header>
              <ScrollArea className="flex-1 px-4 py-3">
                <ul className="space-y-3">
                  {activeThread.messages.map((m) => {
                    const mine = m.sender === 'Crowntunz Music';
                    return (
                      <li
                        key={m.id}
                        className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}
                      >
                        <div
                          className={cn(
                            'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                            mine
                              ? 'rounded-br-sm bg-primary text-primary-foreground'
                              : 'rounded-bl-sm bg-secondary text-foreground',
                          )}
                        >
                          {m.body}
                        </div>
                        <span className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(m.created_at).toLocaleString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
              <footer className="border-t border-border/60 p-3">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Reply to ${activeThread.otherParty}…`}
                    rows={1}
                    className="resize-none"
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    disabled={!draft.trim()}
                    onClick={() => setDraft('')}
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CornerDownRight className="h-3 w-3" />
                  Replies are demo-only in this build.
                </p>
              </footer>
            </section>
          )}
        </div>
      )}
    </div>
    </FeatureGate>
  );
}
