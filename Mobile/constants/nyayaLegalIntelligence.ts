/**
 * Nyaya AI — India-focused legal intelligence (mock / guidance layer).
 * Not legal advice. For education and orientation only.
 */
import type { Lawyer } from './mockData';
import { MOCK_LAWYERS } from './mockData';

export type NyayaCaseCategory =
  | 'employment'
  | 'matrimonial'
  | 'property'
  | 'criminal'
  | 'consumer'
  | 'general';

export type NyayaLawRef = {
  /** Statute / section label */
  act: string;
  /** One-line plain explanation */
  plainEnglish: string;
};

export type NyayaLawyerTier = 'Budget' | 'Experienced' | 'Premium';

export type NyayaLawyerCard = {
  id: string;
  name: string;
  tier: NyayaLawyerTier;
  experienceYears: number;
  specialization: string;
  rating: number;
  city: string;
  state: string;
  feeLabel: string;
};

/** Maps category → up to 3 Indian statutes (section-wise accuracy per product spec). */
export const INDIA_LAWS_BY_CATEGORY: Record<NyayaCaseCategory, NyayaLawRef[]> = {
  employment: [
    {
      act: 'Payment of Wages Act, 1936',
      plainEnglish: 'Employers must pay wages on time and cannot make unfair deductions without a proper process.',
    },
    {
      act: 'Industrial Disputes Act, 1947',
      plainEnglish: 'Covers disputes like termination and lay-off; many workers approach Labour Courts / Tribunals under this law.',
    },
    {
      act: 'Shops & Establishment Act (state law)',
      plainEnglish: 'Your state’s Act often sets notice periods, working hours, and closure rules for shops and offices.',
    },
  ],
  matrimonial: [
    {
      act: 'Section 125 CrPC (maintenance)',
      plainEnglish: 'A magistrate can order monthly maintenance if a person neglects to maintain spouse, children, or parents who cannot maintain themselves.',
    },
    {
      act: 'Section 498A IPC (cruelty) — where applicable',
      plainEnglish: 'Criminal cruelty toward a married woman by husband or relatives is a serious offence; facts must be examined carefully with a lawyer.',
    },
    {
      act: 'Hindu Marriage Act, 1955 (or personal law)',
      plainEnglish: 'Governs marriage, divorce, and judicial separation for Hindus; other communities may follow different personal laws.',
    },
  ],
  property: [
    {
      act: 'Transfer of Property Act, 1882',
      plainEnglish: 'Core law on sale, mortgage, lease, and gift of immovable property — often central in title and possession fights.',
    },
    {
      act: 'Indian Easements Act, 1882',
      plainEnglish: 'Rights of way, light, air, and drainage over another’s land — relevant in boundary and access disputes.',
    },
    {
      act: 'Civil Procedure Code (CPC), 1908',
      plainEnglish: 'Procedure for civil suits — injunctions, possession, and execution are filed following CPC rules.',
    },
  ],
  criminal: [
    {
      act: 'IPC — cheating & criminal breach of trust (e.g. Sections 415–420)',
      plainEnglish: 'Covers dishonest inducement and cheating; police investigation and charge-sheet follow CrPC.',
    },
    {
      act: 'CrPC — FIR, arrest, bail, trial',
      plainEnglish: 'Criminal Procedure Code governs how FIRs are registered, how bail works, and how courts try offences.',
    },
    {
      act: 'Bharatiya Nyaya Sanhita (BNS) — replacing IPC over time',
      plainEnglish: 'New codes are rolling out; your lawyer will check which statute applies to the date of the incident.',
    },
  ],
  consumer: [
    {
      act: 'Consumer Protection Act, 2019',
      plainEnglish: 'District / State / National Commissions hear complaints on defective goods, deficient services, and unfair trade.',
    },
    {
      act: 'E-commerce rules & CPA remedies',
      plainEnglish: 'You may seek refund, replacement, or compensation depending on facts and evidence (invoices, chats, photos).',
    },
    {
      act: 'Contract Act principles (in parallel)',
      plainEnglish: 'Breach of warranty / service contract arguments often support consumer claims alongside the CPA.',
    },
  ],
  general: [
    {
      act: 'Constitution of India — Articles on justice & remedies',
      plainEnglish: 'Fundamental rights and legal remedies shape how courts protect citizens; specific Acts apply based on your issue.',
    },
    {
      act: 'Limitation Act, 1963',
      plainEnglish: 'Most civil and some criminal remedies have strict time limits — delay can bar relief.',
    },
    {
      act: 'Indian Evidence Act / Bharatiya Sakshya Adhiniyam',
      plainEnglish: 'What you can prove in court depends on admissible documents, witnesses, and electronic records.',
    },
  ],
};

export type NyayaIntelResponse = {
  issue_title: string;
  category_label: string;
  case_type_key: NyayaCaseCategory;
  prediction_range: string;
  case_understanding: string;
  legal_mapping: NyayaLawRef[];
  recommended_actions: string[];
  time_sensitivity: string;
  notice_template_id: string | null;
  disclaimer: string;
  lawyer_cards: NyayaLawyerCard[];
};

const SCENARIO_IDS = [
  'salary_not_received',
  'divorce_maintenance',
  'property_dispute',
  'fraud_cheating',
  'tenant_eviction',
  'consumer_complaint',
] as const;

type ScenarioId = (typeof SCENARIO_IDS)[number];

function matchScenario(q: string): ScenarioId | null {
  const s = q.toLowerCase();
  if (
    /salary|wages?|pay\s*slip|pf|gratuity|not\s*paid|withheld|employer\s*not\s*pay|unpaid\s*dues|bonus\s*not/.test(s) ||
    (/terminated|fired|layoff|notice\s*pay|severance/.test(s) && /pay|salary|wage/.test(s))
  )
    return 'salary_not_received';
  if (/divorce|maintenance|125\s*crpc|alimony|custody|498a|matrimonial|husband|wife|marriage\s*break|domestic/.test(s))
    return 'divorce_maintenance';
  if (/property|landlord|tenant|evict|possession|boundary|sale\s*deed|flat|lease|rent|locked\s*out/.test(s))
    return /tenant|evict|vacat|rent|landlord|lease|locked/.test(s) ? 'tenant_eviction' : 'property_dispute';
  if (/fraud|cheat|420|online\s*scam|duped|cheating|misrepresentation|fake\s*website/.test(s)) return 'fraud_cheating';
  if (/consumer|deficien|warranty|refund|insurance\s*reject|ncdrc|complaint\s*against\s*company|e-?commerce|defective/.test(s))
    return 'consumer_complaint';
  return null;
}

function scoreCategory(q: string): NyayaCaseCategory {
  const s = q.toLowerCase();
  const scenario = matchScenario(q);
  if (scenario === 'salary_not_received') return 'employment';
  if (scenario === 'divorce_maintenance') return 'matrimonial';
  if (scenario === 'tenant_eviction' || scenario === 'property_dispute') return 'property';
  if (scenario === 'fraud_cheating') return 'criminal';
  if (scenario === 'consumer_complaint') return 'consumer';
  if (/consumer|deficien|warranty|refund|insurance\s*reject|ncdrc|complaint\s*against\s*company|e-?commerce/.test(s))
    return 'consumer';
  const scores: Record<NyayaCaseCategory, number> = {
    employment: 0,
    matrimonial: 0,
    property: 0,
    criminal: 0,
    consumer: 0,
    general: 0,
  };
  const bump = (c: NyayaCaseCategory, n: number) => {
    scores[c] += n;
  };
  if (/job|employ|labour|labor|termination|notice\s*period|hr|workplace|posh|esi|epf/.test(s)) bump('employment', 3);
  if (/salary|wage|pay|gratuity|bonus|withheld/.test(s)) bump('employment', 4);
  if (/divorce|maintenance|125|498a|custody|marriage|matrimonial|dowry|domestic/.test(s)) bump('matrimonial', 4);
  if (/property|land|title|tenant|landlord|evict|lease|rent|possession|easement|boundary|rera/.test(s)) bump('property', 3);
  if (/cheat|fraud|420|fir|criminal|theft|ipc|threat|bail/.test(s)) bump('criminal', 3);
  if (/cheque|section\s*138|ni\s*act|negotiable|dishonour/.test(s)) bump('criminal', 4);
  if (/consumer|service|product|refund|deficien|insurance|banking\s*ombuds/.test(s)) bump('consumer', 3);
  let best: NyayaCaseCategory = 'general';
  let max = 0;
  (Object.keys(scores) as NyayaCaseCategory[]).forEach((k) => {
    if (k === 'general') return;
    if (scores[k] > max) {
      max = scores[k];
      best = k;
    }
  });
  return max > 0 ? best : 'general';
}

function lawsFor(category: NyayaCaseCategory): NyayaLawRef[] {
  return INDIA_LAWS_BY_CATEGORY[category].slice(0, 3);
}

/** Map Nyaya category → lawyer specializations to prefer */
const CATEGORY_SPECIALIZATION: Record<NyayaCaseCategory, string[]> = {
  employment: ['Employment Law', 'Labour Disputes', 'Corporate Law'],
  matrimonial: ['Divorce', 'Child Custody', 'Maintenance'],
  property: ['Property Law', 'Landlord-Tenant', 'Civil Disputes'],
  criminal: ['Criminal Law', 'Bail Applications', 'White Collar Crime'],
  consumer: ['Consumer Protection', 'Cheque Bounce', 'Banking Recovery'],
  general: ['Civil Disputes', 'General'],
};

function lawyerScore(l: Lawyer, category: NyayaCaseCategory): number {
  const prefs = CATEGORY_SPECIALIZATION[category];
  let score = 0;
  for (const sp of l.specializations) {
    if (prefs.some((p) => sp.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(sp.toLowerCase())))
      score += 5;
  }
  if (category === 'property' && l.specializations.some((x) => /property|tenant|civil|landlord/i.test(x))) score += 3;
  if (category === 'employment' && l.specializations.some((x) => /employment|labour|corporate/i.test(x))) score += 3;
  if (category === 'matrimonial' && l.specializations.some((x) => /divorce|family|custody|maintenance/i.test(x))) score += 3;
  if (category === 'criminal' && l.specializations.some((x) => /criminal|bail/i.test(x))) score += 3;
  if (category === 'consumer' && l.specializations.some((x) => /consumer|cheque|banking/i.test(x))) score += 3;
  score += Math.min(3, l.experienceYears / 5);
  return score;
}

export function getRecommendedLawyers(category: NyayaCaseCategory, _userCityHint?: string): NyayaLawyerCard[] {
  const ranked = [...MOCK_LAWYERS]
    .map((l) => ({ l, s: lawyerScore(l, category) }))
    .sort((a, b) => b.s - a.s);
  const top = ranked.slice(0, 6).map((x) => x.l);
  const byFee = [...top].sort((a, b) => a.fees.call30minInr - b.fees.call30minInr);
  const pick: Lawyer[] = [];
  if (byFee[0]) pick.push(byFee[0]);
  const mid = byFee[Math.floor(byFee.length / 2)] ?? byFee[0];
  if (mid && !pick.some((p) => p.id === mid.id)) pick.push(mid);
  const high = [...top].sort((a, b) => b.fees.call30minInr - a.fees.call30minInr)[0];
  if (high && !pick.some((p) => p.id === high.id)) pick.push(high);
  while (pick.length < 3 && byFee[pick.length]) {
    const n = byFee.find((x) => !pick.some((p) => p.id === x.id));
    if (n) pick.push(n);
    else break;
  }
  const tiers: NyayaLawyerTier[] = ['Budget', 'Experienced', 'Premium'];
  const sortedPick = pick.slice(0, 3).sort((a, b) => a.fees.call30minInr - b.fees.call30minInr);
  return sortedPick.map((l, i) => ({
    id: l.id,
    name: l.name,
    tier: tiers[i] ?? 'Experienced',
    experienceYears: l.experienceYears,
    specialization: l.specializations[0] ?? 'General practice',
    rating: l.rating.average,
    city: l.city,
    state: l.state,
    feeLabel: `From ₹${l.fees.call30minInr.toLocaleString('en-IN')} / 30 min`,
  }));
}

const SCENARIOS: Record<
  ScenarioId,
  Omit<NyayaIntelResponse, 'lawyer_cards' | 'case_type_key' | 'legal_mapping'> & { case_type_key: NyayaCaseCategory }
> = {
  salary_not_received: {
    issue_title: 'Salary / wages not paid',
    category_label: 'Employment — wages & recovery',
    case_type_key: 'employment',
    prediction_range: '72–88%',
    case_understanding:
      'If you have worked and wages are due, Indian law protects timely payment. First gather proof: bank credits, payslips, emails, and attendance. Many cases start with a written demand and then Labour Commissioner / court routes depending on your status (workman vs. managerial role matters in practice).',
    recommended_actions: [
      'Collect payslips, appointment letter, bank statement, and any HR emails about unpaid months.',
      'Send a dated demand letter (registered post or email with read receipt) asking for arrears within 7–15 days.',
      'Approach the Labour Office / Inspector under the Payment of Wages Act for your establishment type.',
      'If amounts are large or employer refuses, consult a labour lawyer for Industrial Disputes Act remedies.',
    ],
    time_sensitivity: 'Wage claims should be pursued quickly; limitation and evidence decay hurt weak documentation.',
    notice_template_id: 'salary_recovery',
    disclaimer:
      'NyayaAI gives general information, not legal advice. Outcomes depend on facts, state rules, and court/tribunal practice. Speak to an advocate before filing.',
  },
  divorce_maintenance: {
    issue_title: 'Divorce or maintenance issue',
    category_label: 'Matrimonial — maintenance & personal law',
    case_type_key: 'matrimonial',
    prediction_range: '65–82%',
    case_understanding:
      'Maintenance (including under Section 125 CrPC) and matrimonial reliefs depend on marriage laws, income proofs, and children’s needs. Courts look at genuine financial need versus ability to pay. Allegations like cruelty under IPC are serious and need careful legal strategy.',
    recommended_actions: [
      'Organise income proof (IT returns, salary slips), expense list, and children’s school/medical bills if relevant.',
      'Avoid hostile texts; keep communication neutral and documented.',
      'File or respond through a family lawyer — mediation is often ordered first in many family courts.',
      'If safety is a concern, explore DV Act protection orders with a lawyer immediately.',
    ],
    time_sensitivity: 'Interim maintenance applications can move faster when affidavits and bank proof are ready.',
    notice_template_id: 'divorce_maintenance',
    disclaimer:
      'Matrimonial law is fact-specific and varies by religion/personal law. This summary is educational only — retain counsel for strategy.',
  },
  property_dispute: {
    issue_title: 'Property dispute',
    category_label: 'Property — title, possession, civil suits',
    case_type_key: 'property',
    prediction_range: '58–78%',
    case_understanding:
      'Typical disputes involve ownership documents, possession, boundaries, or developer delays. The Transfer of Property Act and CPC procedures frame how suits and injunctions work. RERA may apply for certain flat/builder issues.',
    recommended_actions: [
      'Collect sale deed, mother deeds, tax receipts, encumbrance certificate, and photos of disputed area.',
      'Check if the matter is civil (title/possession) or regulatory (RERA) or both — wrong forum wastes time.',
      'Legal notice before suit is common; timelines in notice often set 15–30 days for compliance.',
      'Engage a property lawyer for title opinion before big payments or settlements.',
    ],
    time_sensitivity: 'Injunction and limitation issues are time-sensitive; delay can weaken urgent relief.',
    notice_template_id: 'property_dispute',
    disclaimer:
      'Property law is document-heavy and state procedures differ. Verify with a local advocate.',
  },
  fraud_cheating: {
    issue_title: 'Fraud / cheating',
    category_label: 'Criminal — cheating, breach of trust, investigation',
    case_type_key: 'criminal',
    prediction_range: '55–75%',
    case_understanding:
      'Cheating and criminal breach of trust involve dishonest inducement and wrongful gain. Police may register FIR after preliminary enquiry depending on jurisdiction and facts. Parallel civil recovery may also exist.',
    recommended_actions: [
      'Preserve chats, UPI IDs, bank transfers, screenshots, and URLs in chronological order.',
      'File a clear written complaint with timeline; attach ID proof and evidence index.',
      'Consult a criminal lawyer before naming multiple accused — false implications carry risk.',
      'If cyber fraud, note National Cybercrime Reporting Portal options alongside local FIR.',
    ],
    time_sensitivity: 'Early FIR and bank lien requests (where available) improve traceability of funds.',
    notice_template_id: 'fraud_recovery',
    disclaimer:
      'Criminal process is serious. This is not a substitute for counsel; wrong steps can prejudice bail and trial.',
  },
  tenant_eviction: {
    issue_title: 'Tenant not vacating / landlord dispute',
    category_label: 'Property — lease & possession',
    case_type_key: 'property',
    prediction_range: '60–80%',
    case_understanding:
      'Tenancy may be governed by rent control statutes in some cities, or by lease deed and Transfer of Property Act. Self-help (changing locks) is risky; courts prefer notice → suit or statutory eviction routes.',
    recommended_actions: [
      'Read the lease for notice period, forfeiture clause, and arbitration (if any).',
      'Send a lawyer’s notice specifying breaches or expiry and demand vacant possession in 15–30 days.',
      'If tenant refuses, a civil suit for possession and mesne profits may follow — timelines vary by court load.',
      'Keep rent receipts / NEFT trail to show good faith if you are the landlord.',
    ],
    time_sensitivity: 'Eviction suits can take months to years; structured notice early helps.',
    notice_template_id: 'tenant_eviction',
    disclaimer:
      'Rent control laws differ by state and municipal area. Local counsel is essential.',
  },
  consumer_complaint: {
    issue_title: 'Consumer complaint — goods or services',
    category_label: 'Consumer — CPA 2019 forums',
    case_type_key: 'consumer',
    prediction_range: '68–85%',
    case_understanding:
      'Under the Consumer Protection Act, 2019, you may approach the District / State / National Commission based on claim value and territorial jurisdiction. You typically need invoices, warranty cards, service records, and a clear statement of deficiency or unfair practice.',
    recommended_actions: [
      'Preserve packaging, warranty, bill, and all customer-care emails or call logs.',
      'Send a 7–15 day legal notice before filing (many lawyers treat this as standard).',
      'Value your claim correctly — wrong forum leads to rejection or transfer delays.',
      'Attach photos/videos if the defect is visible; expert report helps for technical goods.',
    ],
    time_sensitivity: 'Consumer forums look at limitation from cause of action; do not sit on old bills.',
    notice_template_id: 'consumer_complaint',
    disclaimer:
      'Commission procedures and fee structures change; verify current rules with counsel.',
  },
};

/** Build structured Nyaya response from free-text query (dynamic mock). */
export function buildNyayaResponseFromQuery(userQuery: string): NyayaIntelResponse {
  const trimmed = userQuery.trim();
  const scenario = matchScenario(trimmed);
  const category = scenario ? SCENARIOS[scenario].case_type_key : scoreCategory(trimmed);
  const laws = lawsFor(category);
  let base: Omit<NyayaIntelResponse, 'lawyer_cards' | 'legal_mapping'>;

  if (scenario) {
    const s = SCENARIOS[scenario];
    base = {
      issue_title: s.issue_title,
      category_label: s.category_label,
      case_type_key: s.case_type_key,
      prediction_range: s.prediction_range,
      case_understanding: s.case_understanding,
      recommended_actions: s.recommended_actions,
      time_sensitivity: s.time_sensitivity,
      notice_template_id: s.notice_template_id,
      disclaimer: s.disclaimer,
    };
  } else {
    base = {
      issue_title: 'General legal orientation (India)',
      category_label: category === 'general' ? 'Mixed / unclear issue' : `${category} — initial mapping`,
      case_type_key: category,
      prediction_range: '50–70%',
      case_understanding:
        'Based on your words, NyayaAI has mapped the closest Indian law buckets below. Please add dates, parties, and documents next so a lawyer can narrow forums (civil, criminal, consumer, labour, family).',
      recommended_actions: [
        'Reply with a short timeline: what happened first, next, and last (with approximate dates).',
        'List documents you already have (contracts, IDs, FIR, invoices, screenshots).',
        'Use “Generate legal notice” only after a lawyer reviews facts — notices can start limitation clocks.',
        'Book a consult with a specialist matched below.',
      ],
      time_sensitivity: 'Many remedies have strict limitation periods under the Limitation Act, 1963.',
      notice_template_id: category === 'consumer' ? 'consumer_complaint' : null,
      disclaimer:
        'NyayaAI cannot see your full file. This output is educational and may be incomplete. Consult a licensed advocate.',
    };
  }

  const lawyer_cards = getRecommendedLawyers(category);

  return {
    ...base,
    legal_mapping: laws,
    lawyer_cards,
  };
}
