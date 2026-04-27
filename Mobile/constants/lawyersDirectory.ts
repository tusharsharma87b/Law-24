/**
 * Lawyers directory — structured mock data & filter/sort helpers.
 * Swap DIRECTORY_LAWYERS with GET /lawyers + pagination when ready.
 * Real-time "online" status can be pushed via WebSocket into this shape.
 */
import { MOCK_LAWYERS, type Lawyer } from './mockData';

// ─── Category ────────────────────────────────────────────────────────────────

export type DirectoryCategory =
  | 'criminal'
  | 'family'
  | 'property'
  | 'employment'
  | 'civil'
  | 'corporate'
  | 'cyber'
  | 'tax';

export const DIRECTORY_FILTER_KEYS: DirectoryCategory[] = [
  'criminal',
  'family',
  'property',
  'employment',
  'civil',
  'corporate',
  'cyber',
  'tax',
];

export const DIRECTORY_CATEGORY_LABEL: Record<DirectoryCategory, string> = {
  criminal: 'Criminal',
  family: 'Family',
  property: 'Property',
  employment: 'Employment',
  civil: 'Civil',
  corporate: 'Corporate',
  cyber: 'Cyber',
  tax: 'Tax',
};

// ─── Court Type ───────────────────────────────────────────────────────────────

export type CourtType = 'district' | 'high' | 'supreme';

export const COURT_TYPE_LABEL: Record<CourtType, string> = {
  district: 'District Court',
  high: 'High Court',
  supreme: 'Supreme Court',
};

// ─── Keyword Map (layman → category) ─────────────────────────────────────────

export const KEYWORD_MAP: Record<string, DirectoryCategory> = {
  // ── Family ──────────────────────────────────────────────────────────────────
  divorce: 'family', custody: 'family', maintenance: 'family',
  alimony: 'family', marriage: 'family', matrimonial: 'family',
  wife: 'family', husband: 'family', dowry: 'family',
  'domestic violence': 'family', dv: 'family',
  // IPC sections → family
  '498a': 'family', '498': 'family', 'section 498': 'family',
  'hma': 'family', 'hindu marriage': 'family',
  'section 9': 'family',  // restitution of conjugal rights
  'section 13': 'family', // divorce grounds
  'section 24': 'family', // maintenance pending suit
  'section 125': 'family', // CrPC maintenance

  // ── Employment ──────────────────────────────────────────────────────────────
  salary: 'employment', job: 'employment', fired: 'employment',
  termination: 'employment', workplace: 'employment', layoff: 'employment',
  hr: 'employment', posh: 'employment', harass: 'employment',
  'industrial dispute': 'employment', labour: 'employment',

  // ── Criminal ────────────────────────────────────────────────────────────────
  fir: 'criminal', bail: 'criminal', arrest: 'criminal',
  police: 'criminal', theft: 'criminal', assault: 'criminal',
  criminal: 'criminal', murder: 'criminal', rape: 'criminal',
  ndps: 'criminal', narco: 'criminal',
  // IPC sections → criminal
  '302': 'criminal', '376': 'criminal', '420': 'criminal',
  '307': 'criminal', '354': 'criminal', '379': 'criminal',
  '406': 'criminal', '323': 'criminal', '341': 'criminal',
  'section 302': 'criminal', 'section 376': 'criminal',
  'section 420': 'criminal', 'section 406': 'criminal',
  'anticipatory': 'criminal', 'habeas corpus': 'criminal',
  'pocso': 'criminal', 'pmla': 'criminal',

  // ── Civil / Consumer ────────────────────────────────────────────────────────
  fraud: 'civil', consumer: 'civil', cheque: 'civil',
  refund: 'civil', scam: 'civil', complaint: 'civil',
  defective: 'civil', ncdrc: 'civil', 'consumer forum': 'civil',
  'section 138': 'civil', '138': 'civil', 'ni act': 'civil',
  'insurance': 'civil', 'accident claim': 'civil',

  // ── Property ────────────────────────────────────────────────────────────────
  property: 'property', rent: 'property', landlord: 'property',
  tenant: 'property', rera: 'property', plot: 'property',
  flat: 'property', house: 'property', injunction: 'property',
  eviction: 'property', possession: 'property',

  // ── Corporate / Banking ─────────────────────────────────────────────────────
  loan: 'corporate', bank: 'corporate', banking: 'corporate',
  company: 'corporate', startup: 'corporate',
  sarfaesi: 'corporate', npa: 'corporate', emi: 'corporate',
  cheque_bounce: 'civil',

  // ── Tax ─────────────────────────────────────────────────────────────────────
  tax: 'tax', gst: 'tax', itr: 'tax', tds: 'tax',
  'income tax': 'tax', 'tax notice': 'tax',

  // ── Cyber ────────────────────────────────────────────────────────────────────
  cyber: 'cyber', hacking: 'cyber', phishing: 'cyber',
  stalking: 'cyber', online: 'cyber', 'it act': 'cyber',
  '66c': 'cyber', '66d': 'cyber',
};

// ─── Lawyer Model ─────────────────────────────────────────────────────────────

export type DirectoryLawyer = {
  id: string;
  profileId: string;
  name: string;
  category: DirectoryCategory;
  specialization: string;
  city: string;
  state: string;
  rating: number;
  reviews: number;
  pricePerMin: number;
  online: boolean;
  responseTime: string;
  responseTimeMinutes: number;
  languages: string[];
  experience: number;
  verified: boolean;
  initials: string;
  avatarColor: string;
  courtType: CourtType;
  queue: number;
  lastSeen: string | null;
};

export type LawyerAvailability = {
  isOnline: boolean;
  queue: number;
  lastSeen: string | null;
};

export const LAWYER_AVAILABILITY: Record<string, LawyerAvailability> = {
  'LAW-001': { isOnline: false, queue: 0, lastSeen: '2 hrs ago' },
  'LAW-002': { isOnline: false, queue: 0, lastSeen: '30 mins ago' },
  'LAW-003': { isOnline: true, queue: 3, lastSeen: null },
  'LAW-004': { isOnline: true, queue: 0, lastSeen: null },
};

export function getLawyerAvailability(profileId: string): LawyerAvailability {
  return LAWYER_AVAILABILITY[profileId] ?? { isOnline: false, queue: 0, lastSeen: '1 hr ago' };
}

// ─── Filter & Sort Types ──────────────────────────────────────────────────────

export type LocationFilter = 'all' | 'Delhi' | 'Mumbai' | 'Bangalore';
export type RatingFilter = 'any' | '4.0' | '4.5';
export type PriceFilter = 'any' | 'under20' | 'under50' | '20to50' | 'above50';
export type SortKey = 'rating' | 'price' | 'response' | 'experience';

export type DirectoryFilters = {
  /** Multi-select: empty array = show all categories (like "All") */
  categories: DirectoryCategory[];
  search: string;
  location: LocationFilter;
  onlineOnly: boolean;
  rating: RatingFilter;
  price: PriceFilter;
  courtType: CourtType | 'all';
  sort: SortKey;
};

export const DEFAULT_DIRECTORY_FILTERS: DirectoryFilters = {
  categories: [],
  search: '',
  location: 'all',
  onlineOnly: false,
  rating: 'any',
  price: 'any',
  courtType: 'all',
  sort: 'rating',
};

// ─── Inference Helpers ────────────────────────────────────────────────────────

function inferDirectoryCategory(l: Lawyer): DirectoryCategory {
  const b = `${l.specializations.join(' ')} ${l.designation}`.toLowerCase();
  if (b.includes('criminal') || b.includes('bail') || b.includes('ndps')) return 'criminal';
  if (b.includes('family') || b.includes('divorce') || b.includes('custody') || b.includes('matrimonial')) {
    return 'family';
  }
  if (b.includes('property') || b.includes('rera') || b.includes('landlord') || b.includes('tenant')) {
    return 'property';
  }
  if (b.includes('tax') || b.includes('gst') || b.includes('income tax')) return 'tax';
  if (b.includes('cyber') || b.includes('it act')) return 'cyber';
  if (b.includes('corporate') || b.includes('company') || b.includes('posh') || b.includes('labour')) {
    return 'corporate';
  }
  if (b.includes('consumer') || b.includes('cheque') || b.includes('banking') || b.includes('sarfaesi')) {
    return 'civil';
  }
  if (b.includes('employment') || b.includes('termination') || b.includes('salary')) return 'employment';
  return 'civil';
}

function inferCourtType(l: Lawyer): CourtType {
  const names = l.courts.map((c) => c.name.toLowerCase());
  if (names.some((n) => n.includes('supreme'))) return 'supreme';
  if (names.some((n) => n.includes('high court'))) return 'high';
  return 'district';
}

function lawyerToDirectoryRow(
  l: Lawyer,
  rowId: string,
  category: DirectoryCategory,
  courtType: CourtType,
  city?: string,
  state?: string,
): DirectoryLawyer {
  const availability = getLawyerAvailability(l.id);
  const online = availability.isOnline;
  const queue = availability.queue;
  const lastSeen = availability.lastSeen;

  const mins = l.responseTimeMinutes;
  return {
    id: rowId,
    profileId: l.id,
    name: l.name.replace(/^Adv\.\s*/, ''),
    category,
    specialization: l.specializations[0] ?? l.designation,
    city: city ?? l.city,
    state: state ?? l.state,
    rating: l.rating.average,
    reviews: l.rating.totalReviews,
    pricePerMin: l.fees.chatPerMinuteInr,
    online,
    responseTime: `${mins} min${mins !== 1 ? 's' : ''}`,
    responseTimeMinutes: mins,
    languages: l.languages.slice(0, 3),
    experience: l.experienceYears,
    verified: l.verified,
    initials: l.initials,
    avatarColor: l.avatarColor,
    courtType,
    queue,
    lastSeen,
  };
}

function buildDirectoryLawyers(): DirectoryLawyer[] {
  const rows: DirectoryLawyer[] = [];
  const cityPairs: { city: string; state: string }[] = [
    { city: 'New Delhi', state: 'Delhi' },
    { city: 'Mumbai', state: 'Maharashtra' },
    { city: 'Bengaluru', state: 'Karnataka' },
    { city: 'Hyderabad', state: 'Telangana' },
    { city: 'Kochi', state: 'Kerala' },
  ];

  MOCK_LAWYERS.forEach((l, i) => {
    const cat = inferDirectoryCategory(l);
    const court = inferCourtType(l);
    rows.push(lawyerToDirectoryRow(l, l.id, cat, court));
    const alt = cityPairs[i % cityPairs.length];
    if (alt.city !== l.city) {
      rows.push(lawyerToDirectoryRow(l, `${l.id}-alt`, cat, court, alt.city, alt.state));
    }
  });

  return rows;
}

/** Mock directory — replace with fetchLawyers() + cursor-based pagination. */
export const DIRECTORY_LAWYERS: DirectoryLawyer[] = buildDirectoryLawyers();

/** IDs considered "active cases" mock (subset). */
export const WORKING_ON_PROFILE_IDS = ['LAW-001', 'LAW-002', 'LAW-003'];

// ─── Param Parsing ────────────────────────────────────────────────────────────

export function parseDirectoryCategoryParam(raw: string | undefined): DirectoryCategory | null {
  if (!raw) return null;
  const k = raw.toLowerCase() as DirectoryCategory;
  return DIRECTORY_FILTER_KEYS.includes(k) ? k : null;
}

// ─── Filter ───────────────────────────────────────────────────────────────────

function matchesLocation(l: DirectoryLawyer, location: LocationFilter): boolean {
  if (location === 'all') return true;
  const c = l.city.toLowerCase();
  if (location === 'Delhi') return c.includes('delhi');
  if (location === 'Mumbai') return c.includes('mumbai');
  if (location === 'Bangalore') return c.includes('bengalur') || c.includes('bangalore');
  return true;
}

function matchesSearch(l: DirectoryLawyer, q: string): boolean {
  if (!q) return true;

  // Direct string match across key fields
  if (
    l.name.toLowerCase().includes(q) ||
    l.specialization.toLowerCase().includes(q) ||
    l.city.toLowerCase().includes(q) ||
    l.state.toLowerCase().includes(q) ||
    DIRECTORY_CATEGORY_LABEL[l.category].toLowerCase().includes(q)
  ) {
    return true;
  }

  // Exact keyword / jargon match (e.g. "498a" → family)
  const exactMapped = KEYWORD_MAP[q];
  if (exactMapped && l.category === exactMapped) return true;

  // Partial keyword scan — any keyword contained in query maps to a category
  for (const [kw, cat] of Object.entries(KEYWORD_MAP)) {
    if (q.includes(kw) && l.category === cat) return true;
  }

  // Word-level scan — any individual word in the query maps to a category
  // Handles "Section 498A IPC" → checks "section", "498a", "ipc"
  const words = q.replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter((w) => w.length >= 2);
  for (const word of words) {
    const wordMapped = KEYWORD_MAP[word];
    if (wordMapped && l.category === wordMapped) return true;
    for (const [kw, cat] of Object.entries(KEYWORD_MAP)) {
      if (word.includes(kw) && l.category === cat) return true;
    }
  }

  return false;
}

function matchesRating(l: DirectoryLawyer, rating: RatingFilter): boolean {
  if (rating === 'any') return true;
  if (rating === '4.5') return l.rating >= 4.5;
  if (rating === '4.0') return l.rating >= 4.0;
  return true;
}

function matchesPrice(l: DirectoryLawyer, price: PriceFilter): boolean {
  if (price === 'any') return true;
  if (price === 'under20') return l.pricePerMin < 20;
  if (price === 'under50') return l.pricePerMin <= 50;
  if (price === '20to50') return l.pricePerMin >= 20 && l.pricePerMin <= 50;
  if (price === 'above50') return l.pricePerMin > 50;
  return true;
}

export function filterDirectoryLawyers(
  lawyers: DirectoryLawyer[],
  f: DirectoryFilters,
): DirectoryLawyer[] {
  const q = f.search.trim().toLowerCase();
  return lawyers
    // Multi-category: empty = all; otherwise OR-match any selected category
    .filter((l) => f.categories.length === 0 || f.categories.includes(l.category))
    .filter((l) => matchesLocation(l, f.location))
    .filter((l) => !f.onlineOnly || l.online)
    .filter((l) => matchesRating(l, f.rating))
    .filter((l) => matchesPrice(l, f.price))
    .filter((l) => f.courtType === 'all' || l.courtType === f.courtType)
    .filter((l) => matchesSearch(l, q));
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

export function sortDirectoryLawyers(lawyers: DirectoryLawyer[], sort: SortKey): DirectoryLawyer[] {
  const copy = [...lawyers];
  switch (sort) {
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case 'price':
      return copy.sort((a, b) => a.pricePerMin - b.pricePerMin);
    case 'response':
      return copy.sort((a, b) => a.responseTimeMinutes - b.responseTimeMinutes);
    case 'experience':
      return copy.sort((a, b) => b.experience - a.experience);
    default:
      return copy;
  }
}
