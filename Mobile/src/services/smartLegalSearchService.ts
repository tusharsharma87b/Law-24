import { apiPost } from './api';
import { generateLegalResponse, type LegalResponse } from './legalResponseEngine';
import type { Category, Item } from '../data/legalSystem';

type AiAnalyzeResponse = {
  featuredAnswer?: string;
  caseTypes?: string[];
  explanation?: string;
  legalSections?: { title: string; description: string }[];
  relatedSearches?: string[];
};

function toLegalCategory(categoryId?: string): LegalResponse['category'] {
  if (categoryId?.includes('criminal')) return 'criminal';
  if (categoryId?.includes('family')) return 'family';
  if (categoryId?.includes('labour')) return 'labour';
  if (categoryId?.includes('property')) return 'property';
  return 'general';
}

export function buildLegalResponseFromItem(item: Item, category?: Category, backend?: AiAnalyzeResponse): LegalResponse {
  const fallback = generateLegalResponse(item.aiPrompt);
  return {
    title: backend?.featuredAnswer ?? item.title,
    explanation: backend?.explanation ?? fallback.explanation,
    laws: backend?.legalSections ?? item.legalRefs?.map((title) => ({ title, description: `Relevant reference for ${item.title}.` })) ?? fallback.laws,
    steps: fallback.steps,
    timeline: fallback.timeline,
    costEstimate: fallback.costEstimate,
    category: toLegalCategory(category?.id),
    subCategory: item.id,
    caseTypes: backend?.caseTypes ?? [category?.title ?? 'Legal issue', item.title],
    relatedSearches: backend?.relatedSearches ?? item.keywords.slice(0, 4),
  };
}

export async function analyzeLegalItem(item: Item, category?: Category): Promise<LegalResponse> {
  try {
    const backend = await apiPost('/ai/analyze', {
      query: item.aiPrompt,
      language: 'en',
    });
    return buildLegalResponseFromItem(item, category, backend as AiAnalyzeResponse);
  } catch (error) {
    console.error('[Law24 AI] Falling back to local legal response:', error);
    return buildLegalResponseFromItem(item, category);
  }
}

export function smartSearchParams(item: Item, category?: Category, ai?: LegalResponse) {
  return {
    q: item.title,
    title: item.title,
    aiPrompt: item.aiPrompt,
    category: category?.title ?? '',
    ai: ai ? JSON.stringify(ai) : undefined,
  };
}
