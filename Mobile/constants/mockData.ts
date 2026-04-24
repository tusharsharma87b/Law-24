// Law24 — Mock Seed Data (Phase 1 MVP)

export interface Lawyer {
  id: string;
  name: string;
  designation: string;
  verified: boolean;
  verifiedPlus: boolean;
  barCouncilId: string;
  experienceYears: number;
  city: string;
  state: string;
  servesRemote: boolean;
  specializations: string[];
  languages: string[];
  courts: { name: string; since: number }[];
  cases: {
    total: number;
    won: number;
    lost: number;
    settled: number;
    winRatePercent: number;
    byCategory: Record<string, number>;
  };
  fees: {
    chatPerMinuteInr: number;
    call30minInr: number;
    call60minInr: number;
    documentReviewInr: number;
    inPersonPerHourInr: number;
  };
  rating: { average: number; totalReviews: number; breakdown: Record<string, number> };
  isOnline: boolean;
  responseTimeMinutes: number;
  bio: string;
  initials: string;
  avatarColor: string;
}

export const MOCK_LAWYERS: Lawyer[] = [
  {
    id: 'LAW-001',
    name: 'Adv. Anjali Kapoor',
    designation: 'Senior Advocate · High Court',
    verified: true,
    verifiedPlus: true,
    barCouncilId: 'BAR/KAR/2015/4821',
    experienceYears: 9,
    city: 'Bengaluru',
    state: 'Karnataka',
    servesRemote: true,
    specializations: ['Property Law', 'Landlord-Tenant', 'Civil Disputes', 'RERA'],
    languages: ['Kannada', 'English', 'Hindi', 'Telugu'],
    courts: [
      { name: 'Karnataka High Court', since: 2015 },
      { name: 'Supreme Court of India', since: 2019 },
      { name: 'City Civil Court Bengaluru', since: 2015 },
    ],
    cases: {
      total: 340,
      won: 320,
      lost: 14,
      settled: 6,
      winRatePercent: 94.1,
      byCategory: { property: 98, criminal: 75, employment: 62, family: 55, consumer: 35, other: 15 },
    },
    fees: { chatPerMinuteInr: 25, call30minInr: 1200, call60minInr: 2000, documentReviewInr: 500, inPersonPerHourInr: 2500 },
    rating: { average: 4.9, totalReviews: 112, breakdown: { '5': 99, '4': 9, '3': 2, '2': 1, '1': 1 } },
    isOnline: true,
    responseTimeMinutes: 4,
    bio: 'Senior Advocate with 9+ years of specialised practice in property law, RERA disputes, and landlord-tenant matters across Karnataka courts. Known for strategic litigation and out-of-court settlements.',
    initials: 'AK',
    avatarColor: '#4F46E5',
  },
  {
    id: 'LAW-002',
    name: 'Adv. Rahul Mehta',
    designation: 'Criminal Law Specialist',
    verified: true,
    verifiedPlus: false,
    barCouncilId: 'BAR/DL/2012/3302',
    experienceYears: 12,
    city: 'New Delhi',
    state: 'Delhi',
    servesRemote: true,
    specializations: ['Criminal Law', 'Bail Applications', 'White Collar Crime', 'NDPS'],
    languages: ['Hindi', 'English', 'Punjabi'],
    courts: [
      { name: 'Delhi High Court', since: 2012 },
      { name: 'Supreme Court of India', since: 2016 },
      { name: 'Sessions Court Delhi', since: 2012 },
    ],
    cases: {
      total: 520,
      won: 468,
      lost: 36,
      settled: 16,
      winRatePercent: 90.0,
      byCategory: { criminal: 280, civil: 80, employment: 60, family: 60, consumer: 40 },
    },
    fees: { chatPerMinuteInr: 30, call30minInr: 1500, call60minInr: 2500, documentReviewInr: 600, inPersonPerHourInr: 3000 },
    rating: { average: 4.8, totalReviews: 203, breakdown: { '5': 175, '4': 20, '3': 6, '2': 1, '1': 1 } },
    isOnline: true,
    responseTimeMinutes: 3,
    bio: 'Criminal law expert with 12 years at Delhi High Court and Supreme Court. Specialises in bail, anticipatory bail, NDPS cases, and white-collar crime. 90%+ win rate across 520 cases.',
    initials: 'RM',
    avatarColor: '#DC2626',
  },
  {
    id: 'LAW-003',
    name: 'Adv. Priya Sharma',
    designation: 'Family & Matrimonial Lawyer',
    verified: true,
    verifiedPlus: true,
    barCouncilId: 'BAR/MH/2016/7740',
    experienceYears: 8,
    city: 'Mumbai',
    state: 'Maharashtra',
    servesRemote: true,
    specializations: ['Divorce', 'Child Custody', 'Domestic Violence', 'Maintenance'],
    languages: ['Marathi', 'Hindi', 'English'],
    courts: [
      { name: 'Bombay High Court', since: 2016 },
      { name: 'Family Court Mumbai', since: 2016 },
    ],
    cases: {
      total: 210,
      won: 189,
      lost: 12,
      settled: 9,
      winRatePercent: 90.0,
      byCategory: { family: 150, civil: 30, employment: 20, consumer: 10 },
    },
    fees: { chatPerMinuteInr: 20, call30minInr: 1000, call60minInr: 1800, documentReviewInr: 400, inPersonPerHourInr: 2000 },
    rating: { average: 4.7, totalReviews: 89, breakdown: { '5': 72, '4': 12, '3': 3, '2': 1, '1': 1 } },
    isOnline: false,
    responseTimeMinutes: 8,
    bio: 'Compassionate family law practitioner at Bombay High Court. 8 years handling sensitive divorce, custody, and domestic violence matters with empathy and precision.',
    initials: 'PS',
    avatarColor: '#7C3AED',
  },
  {
    id: 'LAW-004',
    name: 'Adv. Vikram Nair',
    designation: 'Corporate & Employment Lawyer',
    verified: true,
    verifiedPlus: false,
    barCouncilId: 'BAR/KL/2014/5521',
    experienceYears: 10,
    city: 'Kochi',
    state: 'Kerala',
    servesRemote: true,
    specializations: ['Employment Law', 'POSH', 'Corporate Law', 'Labour Disputes'],
    languages: ['Malayalam', 'English', 'Hindi', 'Tamil'],
    courts: [
      { name: 'Kerala High Court', since: 2014 },
      { name: 'Labour Court Kochi', since: 2014 },
    ],
    cases: {
      total: 280,
      won: 252,
      lost: 21,
      settled: 7,
      winRatePercent: 90.0,
      byCategory: { employment: 160, corporate: 60, civil: 40, consumer: 20 },
    },
    fees: { chatPerMinuteInr: 22, call30minInr: 1100, call60minInr: 1900, documentReviewInr: 450, inPersonPerHourInr: 2200 },
    rating: { average: 4.6, totalReviews: 67, breakdown: { '5': 52, '4': 10, '3': 3, '2': 1, '1': 1 } },
    isOnline: true,
    responseTimeMinutes: 6,
    bio: 'Corporate and employment law specialist with 10 years at Kerala High Court. Expert in POSH cases, wrongful termination, and labour dispute resolution across South India.',
    initials: 'VN',
    avatarColor: '#059669',
  },
  {
    id: 'LAW-005',
    name: 'Adv. Sunita Reddy',
    designation: 'Consumer & Banking Lawyer',
    verified: true,
    verifiedPlus: false,
    barCouncilId: 'BAR/TS/2017/2210',
    experienceYears: 7,
    city: 'Hyderabad',
    state: 'Telangana',
    servesRemote: true,
    specializations: ['Consumer Protection', 'Cheque Bounce', 'Banking Recovery', 'SARFAESI'],
    languages: ['Telugu', 'Hindi', 'English', 'Urdu'],
    courts: [
      { name: 'Telangana High Court', since: 2017 },
      { name: 'NCDRC', since: 2019 },
      { name: 'DRT Hyderabad', since: 2018 },
    ],
    cases: {
      total: 195,
      won: 171,
      lost: 16,
      settled: 8,
      winRatePercent: 87.7,
      byCategory: { consumer: 90, banking: 65, civil: 25, employment: 15 },
    },
    fees: { chatPerMinuteInr: 18, call30minInr: 900, call60minInr: 1600, documentReviewInr: 350, inPersonPerHourInr: 1800 },
    rating: { average: 4.5, totalReviews: 54, breakdown: { '5': 42, '4': 8, '3': 3, '2': 1, '1': 0 } },
    isOnline: false,
    responseTimeMinutes: 12,
    bio: 'Consumer and banking law expert with 7 years at Telangana High Court. Specialises in cheque bounce (S.138), SARFAESI recovery, and NCDRC consumer complaints.',
    initials: 'SR',
    avatarColor: '#D97706',
  },
];

export const MOCK_QUICK_PROMPTS = [
  { id: '1', label: 'Cheque bounced', prompt: 'The cheque I received has bounced. What are my legal options under Section 138 NI Act?' },
  { id: '2', label: 'Lost my job', prompt: 'I was terminated without notice or severance pay. What are my rights?' },
  { id: '3', label: 'Property dispute', prompt: 'My landlord has locked my house without notice. What should I do?' },
  { id: '4', label: 'Insurance rejected', prompt: 'My insurance claim was rejected without valid reason. Can I take legal action?' },
  { id: '5', label: 'Cheating / fraud', prompt: 'Someone has cheated me of money in an online transaction. What are my options?' },
];

export const MOCK_AI_RESPONSE = {
  issue_title: 'Unlawful Termination & Severance Recovery',
  category: 'Employment Law',
  prediction_range: '70–85%',
  legal_basis:
    "Termination without notice violates Section 25F of the Industrial Disputes Act 1947, which mandates one month's written notice or pay in lieu thereof. You are also entitled to gratuity under the Payment of Gratuity Act 1972 if service exceeds 5 years.",
  applicable_acts: ['Industrial Disputes Act 1947, Section 25F', 'Payment of Gratuity Act 1972', 'Payment of Wages Act 1936'],
  recommended_actions: [
    'Secure all written contracts, appointment letter, and termination communication with exact date',
    'Send a formal Demand Notice via registered post within 30 days',
    'File a grievance with the Deputy Labour Commissioner within 45 days',
  ],
  time_sensitivity: 'Action recommended within 30 days',
  risk_level: 'medium',
  matched_cases: ['Delhi HC 2019 – Sharma vs TechCorp India Pvt Ltd', 'Bombay HC 2021 – Gupta vs Infosys Ltd'],
  disclaimer:
    'This is legal information based on publicly available Indian case law and statutes. It is not legal advice tailored to your specific situation. Consult a licensed advocate before taking legal action.',
};

export const MOCK_CASES = [
  {
    id: 'CASE-001',
    category: 'matrimonial',
    title: 'Matrimonial — Main Case',
    chips: ['498A', 'Section 125', 'Section 9'],
    type: 'Criminal Revision',
    successProbability: 82,
    urgency: 'critical' as const,
    stage: 'Evidence Stage',
    stages: ['Filing', 'Trial', 'Evidence', 'Judgment', 'Closed'],
    activeStageIndex: 2,
    court: 'Karnataka High Court, Bengaluru',
    judge: 'Hon. Justice Ravi Kumar Malpani',
    caseNumber: 'CRL.REV.P.12/2025',
    filedDate: '10 Jan 2025',
    nextHearing: '12 Jun 2026',
    nextAction: 'Submit bank statements for evidence',
    pendingActions: [
      { id: 'PA1', task: 'Submit bank statements (3 months)', due: '5 Jun 2026', priority: 'high' as const },
      { id: 'PA2', task: 'Sign affidavit for financial disclosure', due: '8 Jun 2026', priority: 'critical' as const },
      { id: 'PA3', task: 'Review opposing counsel\'s discovery request', due: '10 Jun 2026', priority: 'medium' as const },
    ],
    aiStrategy:
      'Based on the latest hearing record, the opposing counsel has filed for an adjournment citing incomplete discovery. You should submit the additional bank statements before the next hearing date to strengthen your position significantly.',
    aiSteps: [
      '1. Submit 3 months of bank statements before 5 Jun',
      '2. Sign and notarize the financial affidavit',
      '3. File a counter to the adjournment application',
      '4. Brief your lawyer on asset details for cross-examination',
    ],
    documents: [
      { id: 'D1', name: 'FIR Copy', category: 'court' as const, uploadedBy: 'lawyer', date: '12 Jan 2025', size: '380 KB' },
      { id: 'D2', name: 'Marriage Certificate', category: 'personal' as const, uploadedBy: 'user', date: '14 Jan 2025', size: '210 KB' },
      { id: 'D3', name: 'Bank Statement — Feb 2026', category: 'evidence' as const, uploadedBy: 'user', date: '20 Feb 2026', size: '540 KB' },
      { id: 'D4', name: 'Court Order — 18 Feb', category: 'court' as const, uploadedBy: 'lawyer', date: '19 Feb 2026', size: '120 KB' },
      { id: 'D5', name: 'Affidavit Draft', category: 'evidence' as const, uploadedBy: 'lawyer', date: '2 Mar 2026', size: '88 KB' },
    ],
    timeline: [
      { id: 'T1', date: '25 Mar 2026', time: '10:30 AM', type: 'urgent' as const, title: 'Critical Notice Served', desc: 'Opposing counsel served a notice requiring urgent response within 15 days.', action: 'Respond by 9 Apr 2026', people: ['Adv. Anjali Kapoor', 'Session Judge'] },
      { id: 'T2', date: '18 Feb 2026', time: '11:00 AM', type: 'done' as const, title: 'Preliminary Hearing Held', desc: 'Hearing conducted. Next date set for evidence stage. Court directed submission of financial documents.', people: ['Adv. Anjali Kapoor', 'Hon. Justice Malpani'] },
      { id: 'T3', date: '15 Jan 2026', time: '2:00 PM', type: 'action' as const, title: 'Discovery Request Filed', desc: 'Your lawyer filed a discovery request for opposing party\'s financial records.', action: 'Await response by 5 Feb', people: ['Adv. Anjali Kapoor'] },
      { id: 'T4', date: '10 Jan 2025', time: '9:00 AM', type: 'info' as const, title: 'Case Filed', desc: 'FIR filed and case registered with Karnataka High Court.', people: ['Adv. Anjali Kapoor'] },
    ],
    similarCases: [
      { result: 'Won', probability: '84%', note: 'Similar 498A case — financial evidence decisive' },
      { result: 'Settled', probability: '68%', note: 'Out-of-court settlement in Section 125 matters' },
    ],
    lawyer: MOCK_LAWYERS[0],
  },
  {
    id: 'CASE-002',
    category: 'employment',
    title: 'Employment — Wrongful Termination',
    chips: ['Section 25F', 'IDA 1947'],
    type: 'Labour Dispute',
    successProbability: 74,
    urgency: 'high' as const,
    stage: 'Filing Stage',
    stages: ['Filing', 'Conciliation', 'Tribunal', 'Closed'],
    activeStageIndex: 0,
    court: 'Labour Commissioner, Delhi',
    judge: 'Shri. Ajay Pratap Singh (Labour Commissioner)',
    caseNumber: 'LC/DEL/2026/0892',
    filedDate: '1 Apr 2026',
    nextHearing: '28 May 2026',
    nextAction: 'File conciliation application with Labour Commissioner',
    pendingActions: [
      { id: 'PA1', task: 'File conciliation petition', due: '20 May 2026', priority: 'high' as const },
      { id: 'PA2', task: 'Compile termination letter + communication trail', due: '15 May 2026', priority: 'critical' as const },
      { id: 'PA3', task: 'Get employment contract notarized', due: '18 May 2026', priority: 'medium' as const },
    ],
    aiStrategy:
      'You are within the 45-day window to file with the Labour Commissioner. Gather all written communication with your employer and prepare a detailed timeline of events.',
    aiSteps: [
      '1. Compile all HR communications and termination notice',
      '2. File conciliation petition before 20 May deadline',
      '3. Attach employment contract and payslips as evidence',
      '4. Prepare witness list from former colleagues',
    ],
    documents: [
      { id: 'D1', name: 'Termination Letter', category: 'court' as const, uploadedBy: 'user', date: '2 Apr 2026', size: '245 KB' },
      { id: 'D2', name: 'Employment Contract', category: 'personal' as const, uploadedBy: 'user', date: '3 Apr 2026', size: '1.2 MB' },
      { id: 'D3', name: 'Email Trail — HR Correspondence', category: 'evidence' as const, uploadedBy: 'user', date: '5 Apr 2026', size: '320 KB' },
    ],
    timeline: [
      { id: 'T1', date: '1 Apr 2026', time: '9:00 AM', type: 'info' as const, title: 'Case Registered', desc: 'Labour dispute registered with the Labour Commissioner, Delhi.', people: ['Adv. Priya Sharma'] },
      { id: 'T2', date: '22 Mar 2026', time: '11:00 AM', type: 'urgent' as const, title: 'Termination Received', desc: 'Client received termination letter without notice period or severance. 45-day window to file opened.', action: 'File by 6 May 2026', people: ['Adv. Priya Sharma'] },
    ],
    similarCases: [
      { result: 'Won', probability: '76%', note: 'Wrongful termination without notice — courts favour employee' },
      { result: 'Settled', probability: '60%', note: 'Typical settlement: 3–6 months salary compensation' },
    ],
    lawyer: MOCK_LAWYERS[3],
  },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'N1', type: 'hearing', title: 'Hearing Reminder', body: 'Your case hearing is tomorrow at 11:00 AM — Karnataka HC', time: '2h ago', read: false },
  { id: 'N2', type: 'action', title: 'Action Required', body: 'Adv. Anjali Kapoor has assigned you a task: Sign affidavit', time: '5h ago', read: false },
  { id: 'N3', type: 'ai', title: 'NyayaAI Update', body: 'New similar judgment found that may impact your case strategy', time: '1d ago', read: true },
  { id: 'N4', type: 'payment', title: 'Payment Receipt', body: 'Chat session with Adv. Rahul Mehta — ₹375 (15 min)', time: '2d ago', read: true },
  { id: 'N5', type: 'lawyer', title: 'Lawyer Online', body: 'Adv. Anjali Kapoor is now available for chat', time: '3d ago', read: true },
];

export const MOCK_TRANSACTIONS = [
  { id: 'T1', type: 'debit', label: 'Chat — Adv. Rahul Mehta (15 min)', amount: 450, date: '18 Apr 2026', icon: 'chat' },
  { id: 'T2', type: 'credit', label: 'Wallet Top-up via UPI', amount: 1000, date: '17 Apr 2026', icon: 'add' },
  { id: 'T3', type: 'debit', label: 'Video Call — Adv. Anjali Kapoor (30 min)', amount: 1200, date: '15 Apr 2026', icon: 'video-call' },
  { id: 'T4', type: 'credit', label: 'Wallet Top-up via GPay', amount: 2000, date: '10 Apr 2026', icon: 'add' },
  { id: 'T5', type: 'debit', label: 'Document Review — Adv. Priya Sharma', amount: 400, date: '8 Apr 2026', icon: 'description' },
];

export const MOCK_REVIEWS = [
  { id: 'R1', initials: 'SK', name: 'S.K.', rating: 5, date: '12 Apr 2026', text: 'Exceptionally knowledgeable and professional. Resolved my property dispute faster than I expected. Highly recommend!', type: 'Chat', helpful: 14 },
  { id: 'R2', initials: 'PG', name: 'P.G.', rating: 5, date: '8 Apr 2026', text: 'Very thorough and patient. Explained every legal step clearly. The chat consultation was worth every rupee.', type: 'Chat', helpful: 9 },
  { id: 'R3', initials: 'AM', name: 'A.M.', rating: 4, date: '2 Apr 2026', text: 'Good expertise in RERA matters. Would have liked a faster response time but the advice was solid.', type: 'Call', helpful: 6 },
];
