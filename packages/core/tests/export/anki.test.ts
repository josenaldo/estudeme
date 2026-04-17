import { describe, it, expect } from 'vitest';
import { extractCardsForExport, cardsToJSON } from '../../src/export/index.js';
import { parseVault } from '../../src/parser/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('extractCardsForExport', () => {
  it('extracts cards from the vault', async () => {
    const idx = await parseVault(VAULT);
    const cards = extractCardsForExport(idx);
    expect(cards.length).toBe(1);
    expect(cards[0].cardType).toBe('basic');
    expect(cards[0].front).toContain('How many primitive types');
    expect(cards[0].back).toContain('8');
    expect(cards[0].trail).toBe('Java Trail');
  });

  it('splits Front/Back by ## Front / ## Back headers', async () => {
    const idx = await parseVault(VAULT);
    const cards = extractCardsForExport(idx);
    expect(cards[0].front.trim()).not.toContain('## Back');
  });
});

describe('cardsToJSON', () => {
  it('serializes cards as structured JSON', async () => {
    const idx = await parseVault(VAULT);
    const json = cardsToJSON(extractCardsForExport(idx));
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.cards).toHaveLength(1);
  });
});
