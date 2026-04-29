export type LegalCategory = 'labour' | 'criminal' | 'family' | 'property' | 'general';

export type LegalTemplate = {
  id: 'salary_not_paid' | 'FIR_not_registered' | 'divorce_process' | 'property_dispute';
  title: string;
  category: LegalCategory;
  subCategory: string;
  explanation: string;
  laws: { title: string; description: string }[];
  steps: string[];
  timeline: string;
  costEstimate: string;
  caseTypes: string[];
  relatedSearches: string[];
};

export const LEGAL_TEMPLATES: Record<LegalTemplate['id'], LegalTemplate> = {
  salary_not_paid: {
    id: 'salary_not_paid',
    title: 'Salary Not Paid by Employer',
    category: 'labour',
    subCategory: 'wage_recovery',
    explanation:
      'If salary is delayed or withheld, start with written notice and evidence collection. If unresolved, file a labour complaint and seek wage recovery with statutory dues.',
    laws: [
      { title: 'Payment of Wages Act, 1936', description: 'Protects timely wage payment and enables recovery for wrongful deductions/delays.' },
      { title: 'Code on Wages, 2019', description: 'Consolidates wage rights and obligations across employment categories.' },
      { title: 'Industrial Disputes framework', description: 'Supports conciliation/adjudication for employer-employee disputes.' },
    ],
    steps: [
      'Collect offer letter, payslips, bank statements, and attendance proof.',
      'Send formal legal notice to employer demanding payment within 7-15 days.',
      'File complaint before Labour Commissioner/authority with documents.',
      'Initiate recovery proceedings or labour court claim if employer is non-compliant.',
    ],
    timeline: 'Notice: 1-2 weeks · Labour complaint: 2-8 weeks · Adjudication/recovery: 2-6 months',
    costEstimate: 'INR 2,000-20,000 depending on notice-only vs full proceedings',
    caseTypes: ['Unpaid Salary', 'Wrongful Deduction', 'Final Settlement Delay'],
    relatedSearches: ['PF not deposited by employer', 'Wrongful termination notice period', 'Gratuity not paid'],
  },
  FIR_not_registered: {
    id: 'FIR_not_registered',
    title: 'Police Not Registering FIR',
    category: 'criminal',
    subCategory: 'fir_registration',
    explanation:
      'For cognizable offences, police should register FIR. If refused, escalate to SP and then magistrate under CrPC remedies.',
    laws: [
      { title: 'CrPC Section 154', description: 'Mandates registration of FIR for cognizable offence information.' },
      { title: 'CrPC Section 156(3)', description: 'Magistrate can direct police investigation/FIR registration.' },
      { title: 'CrPC Section 190', description: 'Magistrate can take cognizance based on complaint.' },
    ],
    steps: [
      'Submit written complaint at police station; keep acknowledgement/record.',
      'Escalate complaint to Superintendent of Police (SP/DCP) with evidence.',
      'File complaint before magistrate with request under Section 156(3) CrPC.',
      'Track FIR number and preserve all communication/evidence trail.',
    ],
    timeline: 'PS/SP escalation: 3-10 days · Magistrate order: 2-6 weeks',
    costEstimate: 'INR 3,000-30,000 based on complaint drafting and court filings',
    caseTypes: ['FIR Refusal', 'Police Inaction', 'Criminal Complaint'],
    relatedSearches: ['Anticipatory bail process', 'How to file criminal complaint', 'Evidence needed for FIR'],
  },
  divorce_process: {
    id: 'divorce_process',
    title: 'Divorce Process in India',
    category: 'family',
    subCategory: 'divorce',
    explanation:
      'Divorce route depends on mutual consent vs contested grounds. Proper documentation and interim relief strategy significantly reduces delay.',
    laws: [
      { title: 'Hindu Marriage Act, 1955', description: 'Governs divorce grounds, mutual consent, and ancillary relief for Hindus.' },
      { title: 'Special Marriage Act, 1954', description: 'Applies to civil marriages and related dissolution proceedings.' },
      { title: 'CrPC Section 125', description: 'Maintenance remedy during/after marital disputes where applicable.' },
    ],
    steps: [
      'Choose mutual consent or contested divorce route with legal grounds.',
      'Prepare marriage proof, address records, finances, and child documents.',
      'File petition in family court and attend mediation/counselling stages.',
      'Pursue interim maintenance/custody applications where needed.',
    ],
    timeline: 'Mutual consent: ~6-18 months · Contested: 2-5 years',
    costEstimate: 'INR 20,000-2,50,000+ based on complexity and court stages',
    caseTypes: ['Mutual Consent Divorce', 'Contested Divorce', 'Custody & Maintenance'],
    relatedSearches: ['Child custody rights', 'Interim maintenance application', 'Domestic violence legal remedies'],
  },
  property_dispute: {
    id: 'property_dispute',
    title: 'Property / Land Dispute Resolution',
    category: 'property',
    subCategory: 'title_possession',
    explanation:
      'Property disputes generally require title verification, possession status assessment, and quick injunction strategy to prevent irreversible loss.',
    laws: [
      { title: 'Transfer of Property Act, 1882', description: 'Defines transfer, ownership rights, and obligations in property transactions.' },
      { title: 'Specific Relief Act, 1963', description: 'Enables injunction and declaratory relief for property protection.' },
      { title: 'Registration Act, 1908', description: 'Supports enforceability and proof through registered property instruments.' },
    ],
    steps: [
      'Collect title chain: sale deed, mutation, tax receipts, encumbrance record.',
      'Issue legal notice and attempt pre-litigation settlement/mediation.',
      'File civil suit for declaration/injunction/possession as applicable.',
      'Seek interim injunction immediately to stop sale/encroachment.',
    ],
    timeline: 'Notice + verification: 2-4 weeks · Interim injunction: 1-8 weeks · Suit: 1-5 years',
    costEstimate: 'INR 15,000-3,00,000+ depending on valuation and court process',
    caseTypes: ['Title Dispute', 'Possession Dispute', 'Partition / Inheritance'],
    relatedSearches: ['Encroachment complaint', 'Partition suit process', 'Stay order on property sale'],
  },
};
