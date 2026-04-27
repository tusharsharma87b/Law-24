import React from 'react';
import type { LucideIcon } from 'lucide-react-native';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Gavel,
  Globe,
  Home,
  Languages,
  MapPin,
  MessageSquare,
  MoreVertical,
  Plus,
  Phone,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  Video,
  Wallet,
  X,
} from 'lucide-react-native';
import { IconWrapper } from './IconWrapper';

export type AppIconName =
  | 'home'
  | 'lawyers'
  | 'cases'
  | 'documents'
  | 'profile'
  | 'rating'
  | 'time'
  | 'success'
  | 'chat'
  | 'call'
  | 'video'
  | 'search'
  | 'close'
  | 'back'
  | 'forward'
  | 'verified'
  | 'calendar'
  | 'sparkles'
  | 'wallet'
  | 'bell'
  | 'map-pin'
  | 'language'
  | 'globe'
  | 'more'
  | 'filter'
  | 'scale'
  | 'gavel'
  | 'plus';

const ICONS: Record<AppIconName, LucideIcon> = {
  home: Home,
  lawyers: Users,
  cases: BriefcaseBusiness,
  documents: FileText,
  profile: UserRound,
  rating: Star,
  time: Clock3,
  success: CheckCircle2,
  chat: MessageSquare,
  call: Phone,
  video: Video,
  search: Search,
  close: X,
  back: ChevronLeft,
  forward: ChevronRight,
  verified: ShieldCheck,
  calendar: CalendarDays,
  sparkles: Sparkles,
  wallet: Wallet,
  bell: Bell,
  'map-pin': MapPin,
  language: Languages,
  globe: Globe,
  more: MoreVertical,
  filter: Filter,
  scale: Scale,
  gavel: Gavel,
  plus: Plus,
};

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  boxed?: boolean;
};

export function AppIcon({ name, size = 20, color = '#FFFFFF', strokeWidth = 1.9, boxed = false }: Props) {
  const Icon = ICONS[name];
  if (boxed) {
    return (
      <IconWrapper>
        <Icon size={size} color={color} strokeWidth={strokeWidth} />
      </IconWrapper>
    );
  }
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}

