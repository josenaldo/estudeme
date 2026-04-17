import { describe, it, expect } from 'vitest';
import { parseVault } from '../../src/parser/vault.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('parseVault', () => {
  it('finds all valid .md files', async () => {
    const result = await parseVault(VAULT);
    const titles = result.documents.map((d) => d.frontmatter.title);
    expect(titles).toContain('Java Trail');
    expect(titles).toContain('Fundamentals');
    expect(titles).toContain('Primitive Types');
    expect(titles).toContain('Primitive types count');
  });

  it('ignores .obsidian folder', async () => {
    const result = await parseVault(VAULT);
    const paths = result.documents.map((d) => d.relativePath);
    expect(paths.every((p) => !p.includes('.obsidian'))).toBe(true);
  });

  it('collects invalid documents into result.errors', async () => {
    const result = await parseVault(VAULT);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].path).toContain('no-type');
  });

  it('indexes by type', async () => {
    const result = await parseVault(VAULT);
    expect(result.byType.trail.length).toBe(1);
    expect(result.byType.module.length).toBe(1);
    expect(result.byType.note.length).toBe(1);
    expect(result.byType.card.length).toBe(1);
  });

  it('indexes by title', async () => {
    const result = await parseVault(VAULT);
    expect(result.byTitle.get('Java Trail')?.frontmatter.type).toBe('trail');
  });
});
