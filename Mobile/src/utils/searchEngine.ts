import type { Category, Item } from '../data/legalSystem';

export type LegalIntentMatch = {
  category: Category;
  item: Item;
  score: number;
};

function normalize(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreItem(query: string, item: Item): number {
  const q = normalize(query);
  if (!q) return 0;

  const title = normalize(item.title);
  const description = normalize(item.description);
  const keywords = item.keywords.map(normalize);
  const tokens = q.split(' ').filter(Boolean);

  let score = 0;
  if (title === q) score += 100;
  if (title.includes(q)) score += 55;
  if (description.includes(q)) score += 18;

  for (const keyword of keywords) {
    if (keyword === q) score += 80;
    else if (keyword.includes(q) || q.includes(keyword)) score += 45;
  }

  for (const token of tokens) {
    if (title.includes(token)) score += 12;
    if (description.includes(token)) score += 4;
    if (keywords.some((keyword) => keyword.includes(token))) score += 10;
  }

  return score;
}

export function findLegalIntent(query: string, data: Category[]): LegalIntentMatch | null {
  let best: LegalIntentMatch | null = null;

  for (const category of data) {
    for (const item of category.items) {
      const score = scoreItem(query, item);
      if (score > 0 && (!best || score > best.score)) {
        best = { category, item, score };
      }
    }
  }

  return best;
}

export function matchLegalIntent(query: string, data: Category[]): Item | null {
  return findLegalIntent(query, data)?.item ?? null;
}
