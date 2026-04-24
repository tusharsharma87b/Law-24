/**
 * Lawyer discovery — structured for UI + future API.
 * Derived from MOCK_LAWYERS; category is normalized to PRD filter set.
 */
import { MOCK_LAWYERS, type Lawyer } from './mockData';

export type DiscoveryCategory = 'criminal' | 'family' | 'property' | 'employment';

export const DISCOVERY_CATEGORY_KEYS: DiscoveryCategory[] = [
  'criminal',
  'family',
  'property',
  'employment',
];

export const DISCOVERY_CATEGORY_LABEL: Record<DiscoveryCategory, string> = {
  criminal: 'Criminal',
  family: 'Family',
  property: 'Property',
  employment: 'Employment',
};

/** Maps home Legal Categories ids → discovery filter (single source for deep links). */
export const HOME_CATEGORY_TO_DISCOVERY: Record<string, DiscoveryCategory> = {
  criminal: 'criminal',
  family: 'family',
  property: 'property',
  employment: 'employment',
  consumer: 'employment',
  banking: 'employment',
  civil: 'property',
  cyber: 'criminal',
  tax: 'employment',
  corporate: 'employment',
  immigration: 'employment',
  medical: 'employment',
};

export type DiscoveryLawyer = {
  id: string;
  profileId: string;
  name: string;
  category: DiscoveryCategory;
  categoryLabel: string;
  rating: number;
  price: number;
  online: boolean;
  responseTime: string;
  initials: string;
  avatarColor: string;
  verified: boolean;
};

function inferDiscoveryCategory(l: Lawyer): DiscoveryCategory {
  const blob = `${l.specializations.join(' ')} ${l.designation}`.toLowerCase();
  if (blob.includes('criminal') || blob.includes('bail') || blob.includes('ndps')) return 'criminal';
  if (
    blob.includes('family') ||
    blob.includes('divorce') ||
    blob.includes('custody') ||
    blob.includes('matrimonial')
  ) {
    return 'family';
  }
  if (blob.includes('property') || blob.includes('rera') || blob.includes('landlord') || blob.includes('tenant')) {
    return 'property';
  }
  return 'employment';
}

function categoryDisplayLabel(cat: DiscoveryCategory): string {
  switch (cat) {
    case 'criminal':
      return 'Criminal Law';
    case 'family':
      return 'Family Law';
    case 'property':
      return 'Property Law';
    case 'employment':
      return 'Employment Law';
    default:
      return 'Legal';
  }
}

export function lawyerToDiscovery(l: Lawyer): DiscoveryLawyer {
  const category = inferDiscoveryCategory(l);
  const mins = l.isOnline ? Math.min(2, Math.max(1, l.responseTimeMinutes)) : Math.max(1, l.responseTimeMinutes);
  return {
    id: l.id,
    profileId: l.id,
    name: l.name.replace(/^Adv\.\s*/, ''),
    category,
    categoryLabel: categoryDisplayLabel(category),
    rating: l.rating.average,
    price: l.fees.chatPerMinuteInr,
    online: l.isOnline,
    responseTime: `${mins} mins`,
    initials: l.initials,
    avatarColor: l.avatarColor,
    verified: l.verified,
  };
}

export const DISCOVERY_LAWYERS: DiscoveryLawyer[] = MOCK_LAWYERS.map(lawyerToDiscovery);

export function parseCategoryParam(raw: string | undefined): DiscoveryCategory | null {
  if (!raw) return null;
  const k = raw.toLowerCase() as DiscoveryCategory;
  return DISCOVERY_CATEGORY_KEYS.includes(k) ? k : null;
}
