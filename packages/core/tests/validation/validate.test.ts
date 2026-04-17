import { describe, it, expect } from 'vitest';
import { validateDocument, validateVault } from '../../src/validation/index.js';
import { parseVault } from '../../src/parser/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('validateDocument', () => {
  it('approves a valid trail', () => {
    const doc = {
      path: '/v/t.md', relativePath: 't.md',
      frontmatter: { type: 'trail', title: 'Java', level: 'beginner', status: 'active' },
      content: '', wikilinks: [],
    } as const;
    expect(validateDocument(doc)).toEqual([]);
  });

  it('reports trail without level', () => {
    const doc = {
      path: '/v/t.md', relativePath: 't.md',
      frontmatter: { type: 'trail', title: 'Java', status: 'active' },
      content: '', wikilinks: [],
    } as any;
    expect(validateDocument(doc).some((i) => i.field === 'level')).toBe(true);
  });

  it('reports module without trail', () => {
    const doc = {
      path: '/v/m.md', relativePath: 'm.md',
      frontmatter: { type: 'module', title: 'X', order: 1, status: 'active' },
      content: '', wikilinks: [],
    } as any;
    expect(validateDocument(doc).some((i) => i.field === 'trail')).toBe(true);
  });
});

describe('validateVault', () => {
  it('detects no broken wikilinks in valid fixture', async () => {
    const idx = await parseVault(VAULT);
    expect(validateVault(idx).brokenLinks).toEqual([]);
  });

  it('includes parse errors', async () => {
    const idx = await parseVault(VAULT);
    expect(validateVault(idx).parseErrors.length).toBeGreaterThan(0);
  });
});
