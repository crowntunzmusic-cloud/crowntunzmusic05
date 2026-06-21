import {
  LayoutDashboard,
  Library,
  Drum,
  Music2,
  UploadCloud,
  BarChart3,
  DollarSign,
  ListMusic,
  Users,
  Mail,
  MessageSquare,
  Megaphone,
  Share2,
  Handshake,
  Bell,
  Settings,
  LifeBuoy,
  LogOut,
  Home,
  Search,
  Radio,
  ShieldCheck,
  PenLine,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  featureKey?: string;
  adminOnly?: boolean;
}

export interface NavGroup {
  heading: string;
  items: NavItem[];
}

export const browseNav: NavItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/stations', label: 'Radio', icon: Radio, featureKey: 'radio' },
];

export const producerNav: NavGroup[] = [
  {
    heading: 'Account',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/beats', label: 'Beats', icon: Drum, featureKey: 'beats' },
      { href: '/songs', label: 'Songs', icon: Music2, featureKey: 'songs' },
      { href: '/uploads', label: 'Uploads', icon: UploadCloud, featureKey: 'uploads' },
      { href: '/lyrics', label: 'Lyrics Writer', icon: PenLine, featureKey: 'lyrics' },
    ],
  },
  {
    heading: 'Growth',
    items: [
      { href: '/analytics', label: 'Analytics / Insights', icon: BarChart3, featureKey: 'analytics' },
      { href: '/revenue', label: 'Revenue', icon: DollarSign, featureKey: 'revenue' },
      { href: '/followers', label: 'Followers', icon: Users, featureKey: 'followers' },
      { href: '/promotions', label: 'Promotions', icon: Megaphone, featureKey: 'promotions' },
      { href: '/distribution', label: 'Distribution', icon: Share2, featureKey: 'distribution' },
    ],
  },
  {
    heading: 'Engagement',
    items: [
      { href: '/playlists', label: 'Playlists', icon: ListMusic, featureKey: 'playlists' },
      { href: '/messages', label: 'Messages', icon: Mail, featureKey: 'messages' },
      { href: '/comments', label: 'Comments', icon: MessageSquare, featureKey: 'comments' },
      { href: '/collaborations', label: 'Collaborations', icon: Handshake, featureKey: 'collaborations' },
      { href: '/notifications', label: 'Notifications', icon: Bell, featureKey: 'notifications' },
    ],
  },
  {
    heading: 'Administration',
    items: [
      { href: '/admin', label: 'Super Admin', icon: ShieldCheck, adminOnly: true },
    ],
  },
  {
    heading: 'Account settings',
    items: [
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/help', label: 'Help Center', icon: LifeBuoy },
      { href: '/logout', label: 'Logout', icon: LogOut },
    ],
  },
];
