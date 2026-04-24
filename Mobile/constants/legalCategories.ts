// Law24 — 12 Legal Categories

export interface LegalCategory {
  id: string;
  label: string;
  icon: string; // MaterialIcons name
  shortLabel: string;
  color: string;
  acts: string[];
}

export const LEGAL_CATEGORIES: LegalCategory[] = [
  {
    id: 'criminal',
    label: 'Criminal Law',
    shortLabel: 'Criminal',
    icon: 'gavel',
    color: '#F85149',
    acts: ['IPC', 'CrPC', 'NDPS Act', 'Arms Act'],
  },
  {
    id: 'family',
    label: 'Family & Matrimonial',
    shortLabel: 'Family',
    icon: 'family-restroom',
    color: '#FF9F43',
    acts: ['Hindu Marriage Act', 'Muslim Personal Law', 'DV Act', 'POCSO'],
  },
  {
    id: 'property',
    label: 'Property & Real Estate',
    shortLabel: 'Property',
    icon: 'home',
    color: '#3FB950',
    acts: ['Transfer of Property Act', 'RERA', 'Registration Act'],
  },
  {
    id: 'employment',
    label: 'Employment & Labour',
    shortLabel: 'Employment',
    icon: 'work',
    color: '#58A6FF',
    acts: ['Industrial Disputes Act 1947', 'Labour Codes 2020', 'POSH Act'],
  },
  {
    id: 'consumer',
    label: 'Consumer Protection',
    shortLabel: 'Consumer',
    icon: 'shopping-cart',
    color: '#F5A623',
    acts: ['Consumer Protection Act 2019'],
  },
  {
    id: 'banking',
    label: 'Banking & Finance',
    shortLabel: 'Banking',
    icon: 'account-balance',
    color: '#A78BFA',
    acts: ['NI Act S.138', 'SARFAESI Act', 'IBC 2016'],
  },
  {
    id: 'civil',
    label: 'Civil & Contract',
    shortLabel: 'Civil',
    icon: 'description',
    color: '#34D399',
    acts: ['Indian Contract Act 1872', 'Specific Relief Act'],
  },
  {
    id: 'cyber',
    label: 'Cyber Crime',
    shortLabel: 'Cyber',
    icon: 'security',
    color: '#60A5FA',
    acts: ['IT Act 2000', 'IT Amendment 2008', 'DPDPA 2023'],
  },
  {
    id: 'tax',
    label: 'Taxation',
    shortLabel: 'Taxation',
    icon: 'receipt',
    color: '#FBBF24',
    acts: ['Income Tax Act', 'GST Act', 'Customs Act'],
  },
  {
    id: 'corporate',
    label: 'Corporate & Business',
    shortLabel: 'Corporate',
    icon: 'business',
    color: '#818CF8',
    acts: ['Companies Act 2013', 'Partnership Act', 'LLP Act'],
  },
  {
    id: 'immigration',
    label: 'Immigration',
    shortLabel: 'Immigration',
    icon: 'flight',
    color: '#6EE7B7',
    acts: ['Foreigners Act', 'Passports Act', 'Citizenship Act'],
  },
  {
    id: 'medical',
    label: 'Medical & Healthcare',
    shortLabel: 'Medical',
    icon: 'local-hospital',
    color: '#FCA5A5',
    acts: ['MTP Act', 'PC & PNDT Act', 'Consumer Protection (medical)'],
  },
];
