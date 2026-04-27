/**
 * Law24 — Legal Department Architecture
 *
 * 10 departments covering all major Indian legal domains.
 * Each subcategory has a LAYMAN problem title (plain English/Hindi-ish)
 * mapped to the actual legal section — so users can find help without
 * knowing legal terminology.
 */

export type SubcategoryUrgency = 'critical' | 'high' | 'medium' | 'low';

export interface LegalSubcategory {
  id:           string;
  /** Plain-language user problem — shown on the card */
  problem:      string;
  /** Legal section / act for reference */
  legalTitle:   string;
  acts:         string[];
  urgency:      SubcategoryUrgency;
  icon:         string;
  caseType:     string;
  /** Typical time-to-resolution */
  timeline:     string;
  /** Category key used to filter lawyers directory */
  lawyerCategory: string;
}

export interface LegalDepartment {
  id:           string;
  name:         string;
  tagline:      string;
  icon:         string;
  color:        string;
  subcategories: LegalSubcategory[];
}

export const LEGAL_DEPARTMENTS: LegalDepartment[] = [

  // ─── 1. Family Law ──────────────────────────────────────────────────────────
  {
    id: 'family',
    name: 'Family Law',
    tagline: 'Marriage, divorce, custody & inheritance',
    icon: 'family-restroom',
    color: '#FF9F43',
    subcategories: [
      { id: 'fam-1', problem: 'I want a divorce', legalTitle: 'Divorce Petition — Section 13 HMA', acts: ['Hindu Marriage Act 1955'], urgency: 'high', icon: 'heart-broken', caseType: 'Matrimonial Civil', timeline: '1–3 years', lawyerCategory: 'family' },
      { id: 'fam-2', problem: 'My husband / wife is not paying maintenance', legalTitle: 'Maintenance — Section 125 CrPC', acts: ['Section 125 CrPC'], urgency: 'high', icon: 'money-off', caseType: 'Maintenance', timeline: '6–18 months', lawyerCategory: 'family' },
      { id: 'fam-3', problem: 'I want custody of my children', legalTitle: 'Child Custody — Section 26 HMA', acts: ['Hindu Marriage Act 1955', 'Guardians & Wards Act 1890'], urgency: 'critical', icon: 'child-care', caseType: 'Custody', timeline: '6 months–2 years', lawyerCategory: 'family' },
      { id: 'fam-4', problem: 'My spouse is being violent / cruel at home', legalTitle: 'Domestic Violence — DV Act 2005', acts: ['Protection of Women from Domestic Violence Act 2005'], urgency: 'critical', icon: 'shield', caseType: 'DV Civil/Criminal', timeline: '1–6 months (Protection Order)', lawyerCategory: 'family' },
      { id: 'fam-5', problem: 'My parents passed away, dispute over property', legalTitle: 'Succession & Inheritance — Hindu Succession Act', acts: ['Hindu Succession Act 1956'], urgency: 'medium', icon: 'home', caseType: 'Succession', timeline: '1–3 years', lawyerCategory: 'family' },
      { id: 'fam-6', problem: 'My spouse left home and won\'t come back', legalTitle: 'Restitution of Conjugal Rights — Section 9 HMA', acts: ['Hindu Marriage Act 1955'], urgency: 'medium', icon: 'home-filled', caseType: 'RCR', timeline: '6 months–1.5 years', lawyerCategory: 'family' },
      { id: 'fam-7', problem: 'I was forced into marriage (underage / forced)', legalTitle: 'Void / Voidable Marriage — Section 11/12 HMA', acts: ['Prohibition of Child Marriage Act 2006'], urgency: 'critical', icon: 'dangerous', caseType: 'Nullity of Marriage', timeline: '6–12 months', lawyerCategory: 'family' },
    ],
  },

  // ─── 2. Criminal Law ────────────────────────────────────────────────────────
  {
    id: 'criminal',
    name: 'Criminal Law',
    tagline: 'FIR, bail, defense & criminal matters',
    icon: 'gavel',
    color: '#F85149',
    subcategories: [
      { id: 'crim-1', problem: 'I need to file an FIR / police complaint', legalTitle: 'FIR — Section 154 CrPC', acts: ['CrPC 1973', 'IPC 1860'], urgency: 'critical', icon: 'report', caseType: 'Criminal Complaint', timeline: '1–7 days (immediate)', lawyerCategory: 'criminal' },
      { id: 'crim-2', problem: 'I have been arrested and need bail', legalTitle: 'Bail Application — Section 437/439 CrPC', acts: ['CrPC 1973'], urgency: 'critical', icon: 'lock-open', caseType: 'Bail Application', timeline: '1–7 days', lawyerCategory: 'criminal' },
      { id: 'crim-3', problem: 'I might be arrested — need protection in advance', legalTitle: 'Anticipatory Bail — Section 438 CrPC', acts: ['CrPC 1973'], urgency: 'critical', icon: 'security', caseType: 'Anticipatory Bail', timeline: '3–14 days', lawyerCategory: 'criminal' },
      { id: 'crim-4', problem: 'I am accused of a crime I did not commit', legalTitle: 'Criminal Defense — IPC / Special Acts', acts: ['IPC 1860', 'CrPC 1973'], urgency: 'critical', icon: 'balance', caseType: 'Criminal Trial Defense', timeline: '1–5 years', lawyerCategory: 'criminal' },
      { id: 'crim-5', problem: 'My cheque was dishonoured and I want to file a case', legalTitle: 'Cheque Bounce — Section 138 NI Act', acts: ['Negotiable Instruments Act 1881'], urgency: 'high', icon: 'money-off', caseType: 'Cheque Dishonour', timeline: '6–18 months', lawyerCategory: 'civil' },
      { id: 'crim-6', problem: 'Someone has threatened / blackmailed me', legalTitle: 'Extortion / Threat — Section 383/506 IPC', acts: ['IPC 1860'], urgency: 'critical', icon: 'warning', caseType: 'Criminal Complaint', timeline: '1–7 days', lawyerCategory: 'criminal' },
      { id: 'crim-7', problem: 'My family member has been falsely accused of 498A', legalTitle: 'Section 498A Defense — Cruelty', acts: ['IPC Section 498A', 'DV Act 2005'], urgency: 'critical', icon: 'shield', caseType: '498A Defense', timeline: '2–5 years', lawyerCategory: 'criminal' },
    ],
  },

  // ─── 3. Property & Real Estate ──────────────────────────────────────────────
  {
    id: 'property',
    name: 'Property & Real Estate',
    tagline: 'Property disputes, RERA & landlord issues',
    icon: 'home-work',
    color: '#3FB950',
    subcategories: [
      { id: 'prop-1', problem: 'My builder has not given possession / refund', legalTitle: 'RERA Complaint', acts: ['Real Estate (Regulation & Development) Act 2016'], urgency: 'high', icon: 'apartment', caseType: 'RERA Complaint', timeline: '6–18 months', lawyerCategory: 'property' },
      { id: 'prop-2', problem: 'Someone is illegally occupying my land / property', legalTitle: 'Possession Suit — Section 6 Specific Relief Act', acts: ['Specific Relief Act 1963', 'Transfer of Property Act 1882'], urgency: 'high', icon: 'map', caseType: 'Property Dispute', timeline: '1–5 years', lawyerCategory: 'property' },
      { id: 'prop-3', problem: 'My tenant is not vacating / paying rent', legalTitle: 'Eviction / Rent Recovery', acts: ['State Rent Control Acts'], urgency: 'high', icon: 'house', caseType: 'Eviction', timeline: '6 months–2 years', lawyerCategory: 'property' },
      { id: 'prop-4', problem: 'I want to verify property title before buying', legalTitle: 'Title Verification & Due Diligence', acts: ['Transfer of Property Act 1882', 'Registration Act 1908'], urgency: 'medium', icon: 'search', caseType: 'Legal Opinion', timeline: '7–15 days', lawyerCategory: 'property' },
      { id: 'prop-5', problem: 'Government is taking my land (acquisition)', legalTitle: 'Land Acquisition Challenge', acts: ['Right to Fair Compensation Act 2013'], urgency: 'high', icon: 'terrain', caseType: 'Land Acquisition', timeline: '1–3 years', lawyerCategory: 'property' },
      { id: 'prop-6', problem: 'Dispute over property partition / division', legalTitle: 'Partition Suit', acts: ['Partition Act 1893', 'Hindu Succession Act'], urgency: 'medium', icon: 'call-split', caseType: 'Partition Suit', timeline: '1–4 years', lawyerCategory: 'property' },
    ],
  },

  // ─── 4. Employment & Labour ─────────────────────────────────────────────────
  {
    id: 'employment',
    name: 'Employment & Labour',
    tagline: 'Job, salary, harassment & labour rights',
    icon: 'work',
    color: '#58A6FF',
    subcategories: [
      { id: 'emp-1', problem: 'I was fired without reason / notice', legalTitle: 'Wrongful Termination — Section 25F IDA', acts: ['Industrial Disputes Act 1947'], urgency: 'high', icon: 'person-remove', caseType: 'Labour Dispute', timeline: '6–18 months', lawyerCategory: 'employment' },
      { id: 'emp-2', problem: 'My employer is not paying my salary', legalTitle: 'Wage Recovery — Payment of Wages Act', acts: ['Payment of Wages Act 1936'], urgency: 'high', icon: 'money-off', caseType: 'Wage Recovery', timeline: '3–12 months', lawyerCategory: 'employment' },
      { id: 'emp-3', problem: 'I am being harassed / bullied at my workplace', legalTitle: 'Workplace Harassment — POSH Act 2013', acts: ['POSH Act 2013'], urgency: 'critical', icon: 'report-problem', caseType: 'POSH Complaint', timeline: '2–6 months', lawyerCategory: 'employment' },
      { id: 'emp-4', problem: 'My PF / EPF / ESI has not been given', legalTitle: 'PF/ESI Recovery', acts: ['Employees\' Provident Funds Act 1952', 'ESI Act 1948'], urgency: 'high', icon: 'account-balance-wallet', caseType: 'PF/ESI Dispute', timeline: '3–9 months', lawyerCategory: 'employment' },
      { id: 'emp-5', problem: 'I was denied maternity / paternity leave', legalTitle: 'Maternity Benefit — Maternity Benefit Act 1961', acts: ['Maternity Benefit Act 1961'], urgency: 'high', icon: 'pregnant-woman', caseType: 'Leave Dispute', timeline: '2–6 months', lawyerCategory: 'employment' },
      { id: 'emp-6', problem: 'Contract worker / gig worker rights violation', legalTitle: 'Contract Labour Regulation', acts: ['Contract Labour (Regulation & Abolition) Act 1970', 'Labour Codes 2020'], urgency: 'medium', icon: 'engineering', caseType: 'Contract Labour Dispute', timeline: '6–18 months', lawyerCategory: 'employment' },
    ],
  },

  // ─── 5. Banking & Finance ───────────────────────────────────────────────────
  {
    id: 'banking',
    name: 'Banking & Finance',
    tagline: 'Loans, cheque bounce, debt & bank fraud',
    icon: 'account-balance',
    color: '#A78BFA',
    subcategories: [
      { id: 'bank-1', problem: 'Bank is taking away my property for loan default', legalTitle: 'SARFAESI Challenge', acts: ['SARFAESI Act 2002'], urgency: 'critical', icon: 'home', caseType: 'DRT/SARFAESI', timeline: '6 months–2 years', lawyerCategory: 'civil' },
      { id: 'bank-2', problem: 'My cheque bounced and the other party is threatening', legalTitle: 'Cheque Bounce Defense — Section 138 NI Act', acts: ['Negotiable Instruments Act 1881'], urgency: 'critical', icon: 'credit-card-off', caseType: '138 NI Defense', timeline: '1–2 years', lawyerCategory: 'civil' },
      { id: 'bank-3', problem: 'Someone took money from me and is not returning it', legalTitle: 'Debt Recovery / Money Recovery Suit', acts: ['CPC 1908', 'Limitation Act 1963'], urgency: 'high', icon: 'money', caseType: 'Money Recovery', timeline: '1–3 years', lawyerCategory: 'civil' },
      { id: 'bank-4', problem: 'Bank has committed fraud on my account', legalTitle: 'Banking Fraud — RBI / IPC', acts: ['IPC 1860', 'IT Act 2000', 'RBI Guidelines'], urgency: 'critical', icon: 'warning', caseType: 'Banking Fraud', timeline: '6–18 months', lawyerCategory: 'cyber' },
      { id: 'bank-5', problem: 'Insurance company rejected my valid claim', legalTitle: 'Insurance Claim Dispute — Consumer Court', acts: ['Consumer Protection Act 2019', 'Insurance Act 1938'], urgency: 'high', icon: 'health-and-safety', caseType: 'Insurance Dispute', timeline: '6–18 months', lawyerCategory: 'civil' },
    ],
  },

  // ─── 6. Consumer Protection ─────────────────────────────────────────────────
  {
    id: 'consumer',
    name: 'Consumer Protection',
    tagline: 'Product defects, service disputes & e-commerce',
    icon: 'shopping-cart',
    color: '#34D399',
    subcategories: [
      { id: 'con-1', problem: 'I bought a defective product / service was bad', legalTitle: 'Consumer Complaint — Consumer Protection Act 2019', acts: ['Consumer Protection Act 2019'], urgency: 'medium', icon: 'report', caseType: 'Consumer Complaint', timeline: '3–12 months', lawyerCategory: 'civil' },
      { id: 'con-2', problem: 'E-commerce platform is not refunding / returning', legalTitle: 'E-commerce Dispute', acts: ['Consumer Protection (E-Commerce) Rules 2020'], urgency: 'medium', icon: 'shopping-bag', caseType: 'E-commerce Dispute', timeline: '3–9 months', lawyerCategory: 'civil' },
      { id: 'con-3', problem: 'Hospital / doctor gave wrong treatment', legalTitle: 'Medical Negligence — Consumer Court / Civil', acts: ['Consumer Protection Act 2019', 'Indian Medical Council Act'], urgency: 'critical', icon: 'local-hospital', caseType: 'Medical Negligence', timeline: '1–3 years', lawyerCategory: 'civil' },
      { id: 'con-4', problem: 'A company is cheating / using unfair practices', legalTitle: 'Unfair Trade Practice', acts: ['Consumer Protection Act 2019', 'Competition Act 2002'], urgency: 'high', icon: 'warning', caseType: 'Unfair Trade Practice', timeline: '6–18 months', lawyerCategory: 'civil' },
      { id: 'con-5', problem: 'Vehicle / appliance is defective (warranty issue)', legalTitle: 'Product Liability — Consumer Court', acts: ['Consumer Protection Act 2019'], urgency: 'medium', icon: 'directions-car', caseType: 'Product Liability', timeline: '3–12 months', lawyerCategory: 'civil' },
    ],
  },

  // ─── 7. Cyber Law ───────────────────────────────────────────────────────────
  {
    id: 'cyber',
    name: 'Cyber Law',
    tagline: 'Online fraud, cyberbullying & data theft',
    icon: 'security',
    color: '#60A5FA',
    subcategories: [
      { id: 'cyb-1', problem: 'I have been cheated online / UPI fraud', legalTitle: 'Online Fraud — IT Act + IPC', acts: ['IT Act 2000', 'IPC Section 420'], urgency: 'critical', icon: 'money-off', caseType: 'Cyber Fraud', timeline: '7–30 days (lodge complaint)', lawyerCategory: 'cyber' },
      { id: 'cyb-2', problem: 'Someone is harassing / trolling me on social media', legalTitle: 'Cyberbullying / Cyberstalking — Section 354D IPC', acts: ['IT Act 2000', 'IPC 1860'], urgency: 'high', icon: 'person-off', caseType: 'Cyberbullying', timeline: '1–6 months', lawyerCategory: 'cyber' },
      { id: 'cyb-3', problem: 'My private photos / videos are being shared online', legalTitle: 'Revenge Porn / Non-consensual Sharing — IT Act', acts: ['IT Act 2000 Section 67', 'IPC Section 292'], urgency: 'critical', icon: 'no-photography', caseType: 'Cyber Crime', timeline: '1–7 days (takedown + FIR)', lawyerCategory: 'cyber' },
      { id: 'cyb-4', problem: 'My email / phone was hacked and data stolen', legalTitle: 'Hacking / Data Theft — Section 66 IT Act', acts: ['IT Act 2000'], urgency: 'critical', icon: 'lock', caseType: 'Data Theft', timeline: '1–30 days (report)', lawyerCategory: 'cyber' },
      { id: 'cyb-5', problem: 'Someone is spreading false news / defamation online', legalTitle: 'Online Defamation — Section 499/500 IPC', acts: ['IPC 1860 Section 499', 'IT Act 2000'], urgency: 'high', icon: 'campaign', caseType: 'Defamation', timeline: '3–12 months', lawyerCategory: 'cyber' },
    ],
  },

  // ─── 8. Corporate & Business ────────────────────────────────────────────────
  {
    id: 'corporate',
    name: 'Corporate & Business',
    tagline: 'Company setup, contracts, IP & disputes',
    icon: 'business',
    color: '#F5A623',
    subcategories: [
      { id: 'corp-1', problem: 'I want to register a company / LLP / startup', legalTitle: 'Company / LLP Formation', acts: ['Companies Act 2013', 'LLP Act 2008'], urgency: 'low', icon: 'add-business', caseType: 'Business Registration', timeline: '7–30 days', lawyerCategory: 'corporate' },
      { id: 'corp-2', problem: 'My business partner has cheated me', legalTitle: 'Partnership Dispute / Breach of Fiduciary Duty', acts: ['Partnership Act 1932', 'Companies Act 2013'], urgency: 'critical', icon: 'group-remove', caseType: 'Business Dispute', timeline: '1–4 years', lawyerCategory: 'corporate' },
      { id: 'corp-3', problem: 'Someone is using my brand / logo without permission', legalTitle: 'Trademark / Copyright Infringement', acts: ['Trade Marks Act 1999', 'Copyright Act 1957'], urgency: 'high', icon: 'verified', caseType: 'IP Infringement', timeline: '3–18 months', lawyerCategory: 'corporate' },
      { id: 'corp-4', problem: 'My contract was broken / other party is not delivering', legalTitle: 'Breach of Contract — Specific Relief Act', acts: ['Indian Contract Act 1872', 'Specific Relief Act 1963'], urgency: 'high', icon: 'description', caseType: 'Contract Dispute', timeline: '1–3 years', lawyerCategory: 'corporate' },
      { id: 'corp-5', problem: 'GST / income tax notice / audit dispute', legalTitle: 'Tax Dispute — IT Act / GST Act', acts: ['Income Tax Act 1961', 'GST Act 2017'], urgency: 'high', icon: 'receipt', caseType: 'Tax Dispute', timeline: '3–24 months', lawyerCategory: 'tax' },
    ],
  },

  // ─── 9. Documentation & Civil ───────────────────────────────────────────────
  {
    id: 'documentation',
    name: 'Documentation & Civil',
    tagline: 'Drafting, notices, affidavits & civil suits',
    icon: 'description',
    color: '#D29922',
    subcategories: [
      { id: 'doc-1', problem: 'I need to send a legal notice to someone', legalTitle: 'Legal Notice Drafting — CPC', acts: ['Code of Civil Procedure 1908'], urgency: 'medium', icon: 'mail', caseType: 'Legal Notice', timeline: '1–3 days', lawyerCategory: 'civil' },
      { id: 'doc-2', problem: 'I want to write a will / testament', legalTitle: 'Will Drafting — Indian Succession Act', acts: ['Indian Succession Act 1925'], urgency: 'low', icon: 'edit-note', caseType: 'Will Drafting', timeline: '2–7 days', lawyerCategory: 'civil' },
      { id: 'doc-3', problem: 'I need to register a property / document', legalTitle: 'Property Registration — Registration Act', acts: ['Registration Act 1908', 'Stamp Act 1899'], urgency: 'medium', icon: 'how-to-reg', caseType: 'Registration', timeline: '3–10 days', lawyerCategory: 'property' },
      { id: 'doc-4', problem: 'I need an affidavit / notarized document', legalTitle: 'Affidavit / Notarization', acts: ['Notaries Act 1952', 'Oaths Act 1969'], urgency: 'low', icon: 'task', caseType: 'Affidavit', timeline: '1–2 days', lawyerCategory: 'civil' },
      { id: 'doc-5', problem: 'I have a civil money / dispute claim to file', legalTitle: 'Civil Suit — CPC Order VII Rule 1', acts: ['Code of Civil Procedure 1908'], urgency: 'medium', icon: 'account-balance', caseType: 'Civil Suit', timeline: '2–7 years', lawyerCategory: 'civil' },
    ],
  },

  // ─── 10. Litigation Support ─────────────────────────────────────────────────
  {
    id: 'litigation',
    name: 'Litigation Support',
    tagline: 'Appeals, HC/SC matters & execution',
    icon: 'balance',
    color: '#8B949E',
    subcategories: [
      { id: 'lit-1', problem: 'Court order is against me, I want to appeal', legalTitle: 'Appeal / Revision — CPC / CrPC', acts: ['CPC 1908', 'CrPC 1973'], urgency: 'high', icon: 'upload', caseType: 'Appeal', timeline: '6 months–3 years', lawyerCategory: 'criminal' },
      { id: 'lit-2', problem: 'Court gave order in my favour but it is not being followed', legalTitle: 'Execution Petition', acts: ['CPC Order XXI'], urgency: 'high', icon: 'assignment-turned-in', caseType: 'Execution', timeline: '3–12 months', lawyerCategory: 'civil' },
      { id: 'lit-3', problem: 'I need an urgent stay order from High Court', legalTitle: 'Stay / Injunction — High Court', acts: ['CPC Order XXXIX'], urgency: 'critical', icon: 'stop-circle', caseType: 'Stay Order', timeline: '1–7 days (urgent listing)', lawyerCategory: 'civil' },
      { id: 'lit-4', problem: 'Fundamental right has been violated — need High Court / SC', legalTitle: 'Writ Petition — Article 226 / 32', acts: ['Constitution of India Art. 226 / 32'], urgency: 'high', icon: 'account-balance', caseType: 'Writ Petition', timeline: '3–18 months', lawyerCategory: 'criminal' },
      { id: 'lit-5', problem: 'I am in arbitration / mediation proceedings', legalTitle: 'Arbitration — Arbitration & Conciliation Act', acts: ['Arbitration & Conciliation Act 1996'], urgency: 'medium', icon: 'handshake', caseType: 'Arbitration', timeline: '6 months–2 years', lawyerCategory: 'corporate' },
    ],
  },
];

/** Quick lookup by department ID */
export const getDepartment = (id: string): LegalDepartment | undefined =>
  LEGAL_DEPARTMENTS.find((d) => d.id === id);

/** Map a subcategory's lawyerCategory to the DirectoryCategory key */
export const DEPARTMENT_TO_CATEGORY: Record<string, string> = {
  family:      'family',
  criminal:    'criminal',
  property:    'property',
  employment:  'employment',
  civil:       'civil',
  corporate:   'corporate',
  cyber:       'cyber',
  tax:         'tax',
};
