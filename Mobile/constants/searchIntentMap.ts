/**
 * Search intent map — layman query → DirectoryCategory
 *
 * Supports English, Hindi, and Hinglish phrases.
 * Keys are lowercase and matched as substrings of the user's query.
 * Order matters: more specific phrases first, generic words last.
 */
import type { DirectoryCategory } from './lawyersDirectory';

export const SEARCH_INTENT_MAP: Record<string, DirectoryCategory> = {
  // ── Family ──────────────────────────────────────────────────────────────────
  'shaadi todna': 'family',
  'shaadi toot': 'family',
  'divorce lena': 'family',
  'talaaq': 'family',
  'talaq': 'family',
  'child custody': 'family',
  'bachche ki custody': 'family',
  'guzara bhatta': 'family',
  'domestic violence': 'family',
  'pati ne maara': 'family',
  'wife ne chhoda': 'family',
  'husband ne chhoda': 'family',
  'alimony': 'family',
  'maintenance': 'family',
  'divorce': 'family',
  'custody': 'family',
  'matrimonial': 'family',
  'marriage': 'family',
  'nikah': 'family',

  // ── Employment ──────────────────────────────────────────────────────────────
  'salary nahi mila': 'employment',
  'salary nahi aayi': 'employment',
  'salary rok li': 'employment',
  'naukri gayi': 'employment',
  'job se nikala': 'employment',
  'wrongful termination': 'employment',
  'notice period': 'employment',
  'sexual harassment': 'employment',
  'office harassment': 'employment',
  'posh act': 'employment',
  'layoff': 'employment',
  'retrenchment': 'employment',
  'labour court': 'employment',
  'salary': 'employment',
  'fired': 'employment',
  'termination': 'employment',
  'workplace': 'employment',
  'job': 'employment',

  // ── Criminal ────────────────────────────────────────────────────────────────
  'fir darj': 'criminal',
  'fir cancel': 'criminal',
  'police ne pakad': 'criminal',
  'anticipatory bail': 'criminal',
  'bail mili nahi': 'criminal',
  'arrest hua': 'criminal',
  'cheating case': 'criminal',
  'dhokha': 'criminal',
  'theft ka case': 'criminal',
  'murder case': 'criminal',
  'assault': 'criminal',
  'fir': 'criminal',
  'bail': 'criminal',
  'arrest': 'criminal',
  'police': 'criminal',
  'theft': 'criminal',
  'criminal': 'criminal',

  // ── Property ────────────────────────────────────────────────────────────────
  'ghar se nikaala': 'property',
  'ghar jhagda': 'property',
  'property ka vivaad': 'property',
  'zameen vivad': 'property',
  'landlord ne lock': 'property',
  'rent nahi diya': 'property',
  'builder ne dhoka': 'property',
  'rera complaint': 'property',
  'property dispute': 'property',
  'tenant': 'property',
  'landlord': 'property',
  'property': 'property',
  'rent': 'property',
  'rera': 'property',
  'flat': 'property',
  'plot': 'property',
  'house': 'property',

  // ── Corporate / Banking ─────────────────────────────────────────────────────
  'loan nahi mila': 'corporate',
  'emi band': 'corporate',
  'emi nahi bhari': 'corporate',
  'bank ne account band': 'corporate',
  'cheque bounce': 'corporate',
  'sarfaesi': 'corporate',
  'npa': 'corporate',
  'loan waivers': 'corporate',
  'startup legal': 'corporate',
  'company law': 'corporate',
  'loan': 'corporate',
  'emi': 'corporate',
  'bank': 'corporate',
  'banking': 'corporate',
  'company': 'corporate',

  // ── Civil / Consumer ────────────────────────────────────────────────────────
  'consumer forum': 'civil',
  'product defective': 'civil',
  'refund nahi diya': 'civil',
  'online fraud': 'civil',
  'amazon refund': 'civil',
  'flipkart complaint': 'civil',
  'insurance rejected': 'civil',
  'accident claim': 'civil',
  'cheque': 'civil',
  'fraud': 'civil',
  'refund': 'civil',
  'consumer': 'civil',
  'scam': 'civil',

  // ── Tax ─────────────────────────────────────────────────────────────────────
  'income tax notice': 'tax',
  'gst notice': 'tax',
  'tax raid': 'tax',
  'itr filing': 'tax',
  'tax': 'tax',
  'gst': 'tax',
  'itr': 'tax',

  // ── Cyber ────────────────────────────────────────────────────────────────────
  'online stalking': 'cyber',
  'account hacked': 'cyber',
  'data theft': 'cyber',
  'social media fraud': 'cyber',
  'phishing': 'cyber',
  'hacking': 'cyber',
  'cyber crime': 'cyber',
  'cyber': 'cyber',
};

/**
 * Resolves a raw user query to a DirectoryCategory.
 * Tries longer / more-specific phrases first (map is ordered above).
 * Returns null when no match → route to AI chat instead.
 */
export function resolveSearchIntent(raw: string): DirectoryCategory | null {
  const q = raw.trim().toLowerCase();
  if (!q) return null;
  for (const [keyword, category] of Object.entries(SEARCH_INTENT_MAP)) {
    if (q.includes(keyword)) return category;
  }
  return null;
}

/** Suggestions shown below the search bar as tappable chips */
export type SearchSuggestion = {
  id: string;
  label: string;
  query: string;
};

export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { id: 'salary', label: '💼 Salary not paid', query: 'salary nahi mila' },
  { id: 'fir', label: '🚔 FIR / Police issue', query: 'fir darj karna hai' },
  { id: 'divorce', label: '💔 Divorce help', query: 'divorce lena hai' },
  { id: 'property', label: '🏠 Property dispute', query: 'property jhagda' },
  { id: 'loan', label: '🏦 Loan / EMI problem', query: 'loan emi problem' },
  { id: 'fraud', label: '⚠️ Online fraud / Scam', query: 'online fraud hua' },
];

/** Rotating placeholder hints in the search bar */
export const SEARCH_PLACEHOLDERS = [
  'Describe your problem (Hindi / English)…',
  'e.g. salary nahi mili…',
  'e.g. divorce mein help chahiye…',
  'e.g. police ne FIR kiya…',
  'e.g. property ka vivaad hai…',
  'e.g. loan EMI issue…',
];
