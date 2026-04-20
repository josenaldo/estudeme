import { describe, it, expect } from 'vitest';
import { runCardsList, runCardsExport } from '../../src/commands/cards.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme cards list', () => {
  it('lists cards with optional filters', async () => {
    const r = await runCardsList({ vault: VAULT });
    expect(r.output).toContain('1 card');
  });

  it('filters by trail', async () => {
    const r = await runCardsList({ vault: VAULT, trail: 'Java Trail' });
    expect(r.output).toContain('1 card');
  });
});

describe('estudeme cards export', () => {
  it('exports cards to JSON', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-test-'));
    const out = path.join(tmp, 'cards.json');
    try {
      const r = await runCardsExport({ vault: VAULT, output: out, format: 'json' });
      expect(r.exitCode).toBe(0);
      const parsed = JSON.parse(readFileSync(out, 'utf-8'));
      expect(parsed.cards).toHaveLength(1);
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });
});
