import { LEGAL_TEMPLATES, type LegalCategory, type LegalTemplate } from '../data/legalTemplates';

export type LegalResponse = {
  title: string;
  explanation: string;
  laws: { title: string; description: string }[];
  steps: string[];
  timeline: string;
  costEstimate: string;
  category: LegalCategory;
  subCategory: string;
  caseTypes: string[];
  relatedSearches: string[];
};

const KEYWORD_INTENT: Array<{ words: string[]; template: LegalTemplate['id'] }> = [
  { words: ['salary', 'wage', 'wages', 'pf', 'labour', 'employment'], template: 'salary_not_paid' },
  { words: ['fir', 'police', 'arrest', 'criminal'], template: 'FIR_not_registered' },
  { words: ['divorce', 'marriage', 'alimony', 'custody', 'family'], template: 'divorce_process' },
  { words: ['property', 'land', 'plot', 'flat', 'house', 'tenant', 'rent'], template: 'property_dispute' },
];

function pickTemplateId(query: string): LegalTemplate['id'] {
  const q = query.toLowerCase();
  const match = KEYWORD_INTENT.find((rule) => rule.words.some((w) => q.includes(w)));
  return match?.template ?? 'salary_not_paid';
}

export function generateLegalResponse(query: string): LegalResponse {
  const template = LEGAL_TEMPLATES[pickTemplateId(query)];
  return {
    title: template.title,
    explanation: template.explanation,
    laws: template.laws,
    steps: template.steps,
    timeline: template.timeline,
    costEstimate: template.costEstimate,
    category: template.category,
    subCategory: template.subCategory,
    caseTypes: template.caseTypes,
    relatedSearches: template.relatedSearches,
  };
}
