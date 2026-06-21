'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LifeBuoy, ChevronRight, BookOpen, Radio, CreditCard, Bug, Send, Loader2 } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/producer/primitives';
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
import { useToast } from '@/hooks/use-toast';
import { useSubmitHelpTicket, useHelpTickets } from '@/hooks/use-studio';
import type { HelpTicket } from '@/lib/types';

const faqs = [
  {
    q: 'How do I upload a new track?',
    a: 'Go to Uploads, drop your audio file, add artwork and metadata, then publish. The track appears in Songs and becomes eligible for distribution.',
  },
  {
    q: 'When do I get paid?',
    a: 'Revenue from streams, downloads, and beat licenses is aggregated monthly. Payouts process on the 1st of each month once you cross the $10 threshold.',
  },
  {
    q: 'How do I license a beat?',
    a: 'Open the Beats page, pick an instrumental, and tap License. A non-exclusive agreement is generated instantly; exclusive rights are negotiated per-track.',
  },
  {
    q: 'Can I distribute to stores?',
    a: 'Yes. On the Distribution page, choose a track and select the stores (Spotify, Apple Music, TikTok, etc.). Delivery takes 1–3 business days to go live.',
  },
  {
    q: 'How are plays counted?',
    a: 'A play is counted when a listener streams 30 seconds or more. Skips before that threshold do not register as plays but are tracked for analytics.',
  },
];

const resources = [
  { label: 'Getting started guide', icon: BookOpen, href: '/dashboard' },
  { label: 'Distribution & royalties', icon: Radio, href: '/distribution' },
  { label: 'Billing & payouts', icon: CreditCard, href: '/analytics' },
  { label: 'Report a problem', icon: Bug, href: '/uploads' },
];

export default function HelpCenterPage() {
  const { toast } = useToast();
  const { data: tickets = [] } = useHelpTickets();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [body, setBody] = useState('');
  const submitTicket = useSubmitHelpTicket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    submitTicket.mutate(
      { subject: subject.trim(), category, body: body.trim() },
      {
        onSuccess: () => {
          toast({ title: 'Ticket submitted', description: 'We will get back to you within one business day.' });
          setSubject('');
          setCategory('general');
          setBody('');
        },
        onError: () => {
          toast({ title: 'Could not submit ticket', description: 'Please try again in a moment.', variant: 'destructive' });
        },
      },
    );
  };

  return (
    <div className="space-y-6 pb-4 animate-fade-in">
      <PageHeader
        title="Help Center"
        description="Guides, answers, and ways to reach us."
        icon={LifeBuoy}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {resources.map((r) => {
          const Icon = r.icon;
          return (
            <Link
              key={r.label}
              href={r.href}
              className="group flex items-center gap-3 rounded-xl bg-card/60 p-4 transition-colors hover:bg-card"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-sm font-medium">{r.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>

      <SectionCard title="Frequently asked" description="Quick answers to common questions">
        <ul className="divide-y divide-border/60">
          {faqs.map((faq) => (
            <li key={faq.q} className="py-3">
              <p className="text-sm font-semibold text-foreground">{faq.q}</p>
              <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Submit a ticket" description="Tell us what's going on and we'll follow up">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief summary of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="distribution">Distribution</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="account">Account</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              placeholder="Describe your issue or question in detail"
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={submitTicket.isPending} className="gap-2">
            {submitTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit ticket
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Still need help?" description="Our team responds within one business day">
        <div className="flex flex-wrap gap-2">
          <a
            href="mailto:support@pulse.fm"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Email support
          </a>
          <Link
            href="/messages"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Open a conversation
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Your tickets" description="Tickets you've submitted">
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground">You haven't submitted any tickets yet.</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {tickets.map((t: HelpTicket) => (
              <li key={t.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{t.subject}</p>
                  <span className="text-xs text-muted-foreground">{t.category}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.body}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
