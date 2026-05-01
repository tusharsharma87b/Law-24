/**
 * Lawyer Search Suggestions Engine
 *
 * Covers:
 *  - Legal jargon (IPC sections, Acts, legal terminology)
 *  - Layman English phrases
 *  - Hindi (Devanagari + Romanized / Hinglish)
 *  - Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Punjabi
 *  - Lawyer name completion (dynamic, from directory)
 */
import type { DirectoryCategory, DirectoryLawyer } from './lawyersDirectory';

export type SuggestionType = 'trending' | 'category' | 'lawyer' | 'jargon' | 'vernacular';

export type SearchSuggestion = {
  id: string;
  display: string;    // Shown in the suggestion row (may include script)
  query: string;      // Written into the TextInput on tap
  sub?: string;       // Secondary line (category / language label)
  type: SuggestionType;
  category?: DirectoryCategory;
  icon: string;       // MaterialIcons name
};

// ─── Trending (shown when input is empty) ─────────────────────────────────────

const TRENDING: SearchSuggestion[] = [
  { id: 't1', display: 'Divorce lawyer', query: 'divorce', sub: 'Family Law', type: 'trending', category: 'family', icon: 'trending-up' },
  { id: 't2', display: 'FIR / Police case', query: 'fir police', sub: 'Criminal Law', type: 'trending', category: 'criminal', icon: 'trending-up' },
  { id: 't3', display: 'Salary not paid', query: 'salary not paid', sub: 'Employment Law', type: 'trending', category: 'employment', icon: 'trending-up' },
  { id: 't4', display: 'Property dispute', query: 'property dispute', sub: 'Property Law', type: 'trending', category: 'property', icon: 'trending-up' },
  { id: 't5', display: 'Cheque bounce Section 138', query: 'cheque bounce', sub: 'Civil / NI Act', type: 'trending', category: 'civil', icon: 'trending-up' },
  { id: 't6', display: 'RERA complaint builder', query: 'RERA complaint', sub: 'Property Law', type: 'trending', category: 'property', icon: 'trending-up' },
  { id: 't7', display: 'Online fraud / Cyber crime', query: 'cyber fraud', sub: 'Cyber Law', type: 'trending', category: 'cyber', icon: 'trending-up' },
];

// ─── Category Labels ───────────────────────────────────────────────────────────

const CATEGORY_SUGGESTIONS: SearchSuggestion[] = [
  { id: 'c1', display: 'Criminal lawyer', query: 'criminal', sub: 'Criminal Law', type: 'category', category: 'criminal', icon: 'gavel' },
  { id: 'c2', display: 'Family & divorce lawyer', query: 'family', sub: 'Family Law', type: 'category', category: 'family', icon: 'family-restroom' },
  { id: 'c3', display: 'Property lawyer', query: 'property', sub: 'Property Law', type: 'category', category: 'property', icon: 'home' },
  { id: 'c4', display: 'Employment / labour lawyer', query: 'employment', sub: 'Employment Law', type: 'category', category: 'employment', icon: 'work' },
  { id: 'c5', display: 'Civil lawyer', query: 'civil', sub: 'Civil Law', type: 'category', category: 'civil', icon: 'balance' },
  { id: 'c6', display: 'Corporate / company lawyer', query: 'corporate', sub: 'Corporate Law', type: 'category', category: 'corporate', icon: 'business' },
  { id: 'c7', display: 'Cyber crime lawyer', query: 'cyber', sub: 'Cyber Law', type: 'category', category: 'cyber', icon: 'security' },
  { id: 'c8', display: 'Tax / GST lawyer', query: 'tax', sub: 'Tax Law', type: 'category', category: 'tax', icon: 'receipt' },
  { id: 'c9', display: 'High Court advocate', query: 'high court', sub: 'High Court', type: 'category', icon: 'account-balance' },
  { id: 'c10', display: 'Supreme Court advocate', query: 'supreme court', sub: 'Supreme Court of India', type: 'category', icon: 'account-balance' },
  { id: 'c11', display: 'Consumer complaint lawyer', query: 'consumer complaint', sub: 'Consumer Protection', type: 'category', category: 'civil', icon: 'shopping-cart' },
  { id: 'c12', display: 'Bail application lawyer', query: 'bail', sub: 'Criminal Law', type: 'category', category: 'criminal', icon: 'security' },
];

// ─── Legal Jargon (English) ───────────────────────────────────────────────────

const LEGAL_JARGON: SearchSuggestion[] = [
  // IPC Sections
  { id: 'j1', display: 'Section 498A IPC', query: 'Section 498A', sub: 'Dowry / Domestic violence', type: 'jargon', category: 'family', icon: 'gavel' },
  { id: 'j2', display: 'Section 138 NI Act', query: 'Section 138', sub: 'Cheque bounce', type: 'jargon', category: 'civil', icon: 'gavel' },
  { id: 'j3', display: 'Section 420 IPC', query: 'Section 420', sub: 'Cheating / Fraud', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j4', display: 'Section 302 IPC', query: 'Section 302', sub: 'Murder case', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j5', display: 'Section 376 IPC', query: 'Section 376', sub: 'Sexual assault / Rape', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j6', display: 'Section 354 IPC', query: 'Section 354', sub: 'Outraging modesty', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j7', display: 'Section 379 IPC', query: 'Section 379', sub: 'Theft', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j8', display: 'Section 406 IPC', query: 'Section 406', sub: 'Criminal breach of trust', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j9', display: 'Section 323 IPC', query: 'Section 323', sub: 'Assault / Hurt', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j10', display: 'Section 341 CrPC', query: 'Section 341', sub: 'Wrongful restraint', type: 'jargon', category: 'criminal', icon: 'gavel' },

  // Petitions & Applications
  { id: 'j11', display: 'Anticipatory bail (ABC)', query: 'anticipatory bail', sub: 'Criminal / Arrest protection', type: 'jargon', category: 'criminal', icon: 'security' },
  { id: 'j12', display: 'Regular bail application', query: 'bail application', sub: 'Criminal Law', type: 'jargon', category: 'criminal', icon: 'security' },
  { id: 'j13', display: 'Habeas corpus petition', query: 'habeas corpus', sub: 'Unlawful detention', type: 'jargon', category: 'criminal', icon: 'account-balance' },
  { id: 'j14', display: 'Interim injunction', query: 'interim injunction', sub: 'Civil / Property stay order', type: 'jargon', category: 'property', icon: 'pause' },
  { id: 'j15', display: 'Maintenance petition', query: 'maintenance petition', sub: 'Family Law', type: 'jargon', category: 'family', icon: 'family-restroom' },
  { id: 'j16', display: 'Writ petition Article 226', query: 'writ petition', sub: 'High Court / Fundamental rights', type: 'jargon', category: 'civil', icon: 'account-balance' },
  { id: 'j17', display: 'Restitution of conjugal rights', query: 'conjugal rights', sub: 'Family / HMA Section 9', type: 'jargon', category: 'family', icon: 'family-restroom' },
  { id: 'j18', display: 'Mutual consent divorce', query: 'mutual consent divorce', sub: 'Family Law', type: 'jargon', category: 'family', icon: 'family-restroom' },
  { id: 'j19', display: 'Child custody petition', query: 'child custody', sub: 'Family Law', type: 'jargon', category: 'family', icon: 'family-restroom' },

  // Acts & Laws
  { id: 'j20', display: 'RERA complaint', query: 'RERA', sub: 'Real estate / Builder dispute', type: 'jargon', category: 'property', icon: 'home' },
  { id: 'j21', display: 'NDPS Act case', query: 'NDPS Act', sub: 'Drug offences / Narcotics', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j22', display: 'IT Act Section 66C', query: 'IT Act 66C', sub: 'Identity theft / Cyber', type: 'jargon', category: 'cyber', icon: 'security' },
  { id: 'j23', display: 'POCSO Act', query: 'POCSO', sub: 'Child sexual abuse', type: 'jargon', category: 'criminal', icon: 'gavel' },
  { id: 'j24', display: 'Domestic Violence Act', query: 'domestic violence', sub: 'PWDVA / Family', type: 'jargon', category: 'family', icon: 'family-restroom' },
  { id: 'j25', display: 'SARFAESI notice', query: 'SARFAESI', sub: 'Banking / Property recovery', type: 'jargon', category: 'corporate', icon: 'account-balance' },
  { id: 'j26', display: 'GST notice / Assessment', query: 'GST notice', sub: 'Tax Law', type: 'jargon', category: 'tax', icon: 'receipt' },
  { id: 'j27', display: 'Income Tax notice', query: 'income tax notice', sub: 'Tax Law', type: 'jargon', category: 'tax', icon: 'receipt' },
  { id: 'j28', display: 'POSH Act complaint', query: 'POSH Act', sub: 'Workplace harassment', type: 'jargon', category: 'employment', icon: 'work' },
  { id: 'j29', display: 'Consumer forum NCDRC', query: 'consumer forum', sub: 'Consumer Protection Act', type: 'jargon', category: 'civil', icon: 'shopping-cart' },
  { id: 'j30', display: 'PMLA money laundering', query: 'money laundering PMLA', sub: 'Financial crime', type: 'jargon', category: 'criminal', icon: 'gavel' },
];

// ─── Vernacular (Indian languages) ────────────────────────────────────────────

const VERNACULAR: SearchSuggestion[] = [
  // ── HINDI (Devanagari + Romanized) ──────────────────────────────────────────
  { id: 'hi1', display: 'तलाक चाहिए', query: 'talaq', sub: 'Divorce — Hindi', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'hi2', display: 'गुजारा भत्ता', query: 'guzara bhatta', sub: 'Alimony/Maintenance — Hindi', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'hi3', display: 'तनख्वाह नहीं मिली', query: 'tankhwah nahi mili', sub: 'Salary not paid — Hindi', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'hi4', display: 'नौकरी से निकाला', query: 'naukri se nikala', sub: 'Job termination — Hindi', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'hi5', display: 'FIR दर्ज करनी है', query: 'FIR darj', sub: 'File FIR — Hindi', type: 'vernacular', category: 'criminal', icon: 'translate' },
  { id: 'hi6', display: 'ज़मीन विवाद', query: 'zameen vivad', sub: 'Land dispute — Hindi', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'hi7', display: 'घर का झगड़ा', query: 'ghar ka jhagda', sub: 'Property dispute — Hindi', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'hi8', display: 'बेल मिलनी चाहिए', query: 'bail chahiye', sub: 'Bail required — Hindi', type: 'vernacular', category: 'criminal', icon: 'translate' },
  { id: 'hi9', display: 'धोखाधड़ी हुई', query: 'dhokhadhadi', sub: 'Fraud/Cheating — Hindi', type: 'vernacular', category: 'criminal', icon: 'translate' },
  { id: 'hi10', display: 'किरायेदार मामला', query: 'kiraya vivad', sub: 'Rent dispute — Hindi', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'hi11', display: 'लोन की परेशानी', query: 'loan pareshani', sub: 'Loan problem — Hindi', type: 'vernacular', category: 'corporate', icon: 'translate' },
  { id: 'hi12', display: 'साइबर ठगी', query: 'cyber thagi', sub: 'Cyber fraud — Hindi', type: 'vernacular', category: 'cyber', icon: 'translate' },

  // ── MARATHI ─────────────────────────────────────────────────────────────────
  { id: 'mr1', display: 'घटस्फोट हवा', query: 'ghatasphot', sub: 'Divorce — Marathi', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'mr2', display: 'पगार मिळाला नाही', query: 'pagar nahi', sub: 'Salary issue — Marathi', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'mr3', display: 'जमीन वाद', query: 'jamin vad', sub: 'Land dispute — Marathi', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'mr4', display: 'नोकरीवरून काढले', query: 'nokri geli', sub: 'Job termination — Marathi', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'mr5', display: 'फसवणूक झाली', query: 'fasvanuk', sub: 'Fraud — Marathi', type: 'vernacular', category: 'criminal', icon: 'translate' },

  // ── TAMIL ────────────────────────────────────────────────────────────────────
  { id: 'ta1', display: 'மணவிலக்கு வழக்கு', query: 'manavilakku', sub: 'Divorce case — Tamil', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'ta2', display: 'சம்பளம் கிடைக்கவில்லை', query: 'sambalam kidaikkavillai', sub: 'Salary not received — Tamil', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'ta3', display: 'நிலம் சர்ச்சை', query: 'nilam sarchai', sub: 'Land dispute — Tamil', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'ta4', display: 'FIR பதிவு', query: 'FIR pativu', sub: 'File FIR — Tamil', type: 'vernacular', category: 'criminal', icon: 'translate' },
  { id: 'ta5', display: 'ஜாமீன் வழக்கு', query: 'jamin vakkil', sub: 'Bail case — Tamil', type: 'vernacular', category: 'criminal', icon: 'translate' },

  // ── TELUGU ───────────────────────────────────────────────────────────────────
  { id: 'te1', display: 'విడాకుల కేసు', query: 'vidaakulu', sub: 'Divorce — Telugu', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'te2', display: 'జీతం రాలేదు', query: 'jeetam raaledu', sub: 'Salary issue — Telugu', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'te3', display: 'భూమి వివాదం', query: 'bhoomi vivadam', sub: 'Land dispute — Telugu', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'te4', display: 'బెయిల్ కోసం', query: 'bail kosam', sub: 'For bail — Telugu', type: 'vernacular', category: 'criminal', icon: 'translate' },

  // ── KANNADA ──────────────────────────────────────────────────────────────────
  { id: 'kn1', display: 'ವಿಚ್ಛೇದನ ಪ್ರಕರಣ', query: 'vicchedana', sub: 'Divorce — Kannada', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'kn2', display: 'ಸಂಬಳ ಸಿಕ್ಕಿಲ್ಲ', query: 'sambala sikkilla', sub: 'Salary issue — Kannada', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'kn3', display: 'ಭೂಮಿ ವಿವಾದ', query: 'bhoomi vivaada', sub: 'Land dispute — Kannada', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'kn4', display: 'ಜಾಮೀನು ಬೇಕು', query: 'jaaminu beku', sub: 'Need bail — Kannada', type: 'vernacular', category: 'criminal', icon: 'translate' },

  // ── MALAYALAM ────────────────────────────────────────────────────────────────
  { id: 'ml1', display: 'വിവാഹമോചനം', query: 'vivaahamochanam', sub: 'Divorce — Malayalam', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'ml2', display: 'ശമ്പളം കിട്ടിയില്ല', query: 'shambalam kittiyilla', sub: 'Salary not received — Malayalam', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'ml3', display: 'ഭൂമി തർക്കം', query: 'bhoomi tharkam', sub: 'Land dispute — Malayalam', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'ml4', display: 'ജാമ്യം വേണം', query: 'jaamyam venam', sub: 'Need bail — Malayalam', type: 'vernacular', category: 'criminal', icon: 'translate' },

  // ── BENGALI ──────────────────────────────────────────────────────────────────
  { id: 'bn1', display: 'তালাক দরকার', query: 'talak dorkar', sub: 'Divorce — Bengali', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'bn2', display: 'বেতন পাইনি', query: 'beton paini', sub: 'Salary not paid — Bengali', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'bn3', display: 'জমি বিবাদ', query: 'jomi bibaad', sub: 'Land dispute — Bengali', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'bn4', display: 'জামিন চাই', query: 'jaamin chai', sub: 'Need bail — Bengali', type: 'vernacular', category: 'criminal', icon: 'translate' },

  // ── GUJARATI ─────────────────────────────────────────────────────────────────
  { id: 'gu1', display: 'છૂટાછેડા જોઈએ', query: 'chhutachheda', sub: 'Divorce — Gujarati', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'gu2', display: 'પગાર ન મળ્યો', query: 'pagar na malyo', sub: 'Salary not received — Gujarati', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'gu3', display: 'જમીન વિવાદ', query: 'jamin vivad', sub: 'Land dispute — Gujarati', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'gu4', display: 'જામીન જોઈએ', query: 'jaamin joie', sub: 'Need bail — Gujarati', type: 'vernacular', category: 'criminal', icon: 'translate' },

  // ── PUNJABI ──────────────────────────────────────────────────────────────────
  { id: 'pu1', display: 'ਤਲਾਕ ਚਾਹੀਦਾ', query: 'talak chahida', sub: 'Divorce — Punjabi', type: 'vernacular', category: 'family', icon: 'translate' },
  { id: 'pu2', display: 'ਤਨਖਾਹ ਨਹੀਂ ਮਿਲੀ', query: 'tankha nahi mili', sub: 'Salary not paid — Punjabi', type: 'vernacular', category: 'employment', icon: 'translate' },
  { id: 'pu3', display: 'ਜ਼ਮੀਨ ਝਗੜਾ', query: 'zameen jhagda', sub: 'Land dispute — Punjabi', type: 'vernacular', category: 'property', icon: 'translate' },
  { id: 'pu4', display: 'ਜ਼ਮਾਨਤ ਚਾਹੀਦੀ', query: 'zamanat chahidi', sub: 'Need bail — Punjabi', type: 'vernacular', category: 'criminal', icon: 'translate' },
];

// ─── Full suggestion bank (static entries) ────────────────────────────────────

const ALL_STATIC: SearchSuggestion[] = [
  ...CATEGORY_SUGGESTIONS,
  ...LEGAL_JARGON,
  ...VERNACULAR,
];

// ─── Engine ───────────────────────────────────────────────────────────────────

/**
 * Returns up to `maxResults` suggestions for the given input.
 * Priority: lawyer names → jargon/category → vernacular → trending
 */
export function generateSuggestions(
  input: string,
  lawyers: DirectoryLawyer[] = [],
  maxResults = 7,
): SearchSuggestion[] {
  if (!Array.isArray(lawyers)) return [];
  const raw = input.trim();

  // Empty input → return trending
  if (!raw) return TRENDING;

  const q = raw.toLowerCase();
  const results: SearchSuggestion[] = [];
  const seen = new Set<string>();

  const add = (s: SearchSuggestion) => {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      results.push(s);
    }
  };

  // 1. Lawyer name matches (highest priority)
  lawyers
    .filter((l) => l.name.toLowerCase().includes(q))
    .slice(0, 3)
    .forEach((l) => {
      add({
        id: `name-${l.id}`,
        display: `Adv. ${l.name}`,
        query: l.name,
        sub: `${l.specialization} · ${l.city}`,
        type: 'lawyer',
        category: l.category,
        icon: 'person',
      });
    });

  // 2. Static entries: score by relevance
  const scored = ALL_STATIC.map((s) => {
    let score = 0;
    const displayL = s.display.toLowerCase();
    const queryL = s.query.toLowerCase();
    const subL = (s.sub ?? '').toLowerCase();

    // Exact starts-with gets highest score
    if (displayL.startsWith(q) || queryL.startsWith(q)) score += 10;
    // Contains in display or query
    if (displayL.includes(q) || queryL.includes(q)) score += 5;
    // Script match (e.g. user typed Devanagari)
    if (s.display.includes(raw)) score += 8;
    // Keyword in sub-label
    if (subL.includes(q)) score += 3;
    // Multi-word partial (any word of query matches)
    q.split(' ').forEach((word) => {
      if (word.length > 1 && (displayL.includes(word) || queryL.includes(word) || subL.includes(word))) {
        score += 2;
      }
    });

    return { s, score };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  // Jargon first, then category, then vernacular
  scored
    .filter(({ s }) => s.type === 'jargon')
    .slice(0, 3)
    .forEach(({ s }) => add(s));
  scored
    .filter(({ s }) => s.type === 'category')
    .slice(0, 2)
    .forEach(({ s }) => add(s));
  scored
    .filter(({ s }) => s.type === 'vernacular')
    .slice(0, 3)
    .forEach(({ s }) => add(s));

  // Fill remaining with any leftover scored matches
  if (results.length < maxResults) {
    scored.forEach(({ s }) => add(s));
  }

  // If nothing found, show partial trending
  if (results.length === 0) return TRENDING.slice(0, 5);

  return results.slice(0, maxResults);
}
