import type { VaultIndex } from '../parser/vault.js';
import { normalizeWikilink } from '../parser/wikilinks.js';

export interface CardForExport {
  id: string;
  cardType: string;
  front: string;
  back: string;
  trail?: string;
  module?: string;
  source?: string;
  tags: string[];
  difficulty?: number;
}

interface CardJSON {
  version: number;
  generatedAt: string;
  cards: CardForExport[];
}

export function splitFrontBack(content: string): { front: string; back: string } {
  const frontMatch = content.match(/##\s+Front\s*\n([\s\S]*?)(?=##\s+Back|$)/i);
  const backMatch = content.match(/##\s+Back\s*\n([\s\S]*?)$/i);
  return {
    front: frontMatch ? frontMatch[1].trim() : '',
    back: backMatch ? backMatch[1].trim() : '',
  };
}

export function extractCardsForExport(index: VaultIndex): CardForExport[] {
  const cardDocs = index.byType['card'] ?? [];

  return cardDocs.map((doc) => {
    const fm = doc.frontmatter as unknown as Record<string, unknown>;
    const { front, back } = splitFrontBack(doc.content);

    const resolveWikilink = (value: unknown): string | undefined => {
      if (typeof value !== 'string') return undefined;
      return normalizeWikilink(value);
    };

    return {
      id: doc.relativePath,
      cardType: typeof fm['card-type'] === 'string' ? fm['card-type'] : 'basic',
      front,
      back,
      trail: resolveWikilink(fm['trail']),
      module: resolveWikilink(fm['module']),
      source: resolveWikilink(fm['source']),
      tags: Array.isArray(fm['tags']) ? (fm['tags'] as string[]) : [],
      difficulty: typeof fm['difficulty'] === 'number' ? fm['difficulty'] : undefined,
    };
  });
}

export function cardsToJSON(cards: CardForExport[]): string {
  const payload: CardJSON = {
    version: 1,
    generatedAt: new Date().toISOString(),
    cards,
  };
  return JSON.stringify(payload, null, 2);
}
