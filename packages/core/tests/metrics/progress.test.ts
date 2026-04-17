import { describe, it, expect } from 'vitest';
import { computeTrailProgress, computeAllTrailsProgress } from '../../src/metrics/index.js';
import { parseVault } from '../../src/parser/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('computeTrailProgress', () => {
  it('computes trail progress (completed modules / total)', async () => {
    const idx = await parseVault(VAULT);
    const trail = idx.byTitle.get('Java Trail')!;
    const progress = computeTrailProgress(trail, idx);
    expect(progress.title).toBe('Java Trail');
    expect(progress.totalModules).toBe(1);
    expect(progress.completedModules).toBe(0);
    expect(progress.inProgressModules).toBe(1);
    expect(progress.percentComplete).toBe(0);
    expect(progress.notes).toBe(1);
    expect(progress.cards).toBe(1);
  });

  it('counts modules with status=completed', async () => {
    const idx = await parseVault(VAULT);
    const trail = idx.byTitle.get('Java Trail')!;
    (idx.byTitle.get('Fundamentals')!.frontmatter as any).status = 'completed';
    const progress = computeTrailProgress(trail, idx);
    expect(progress.percentComplete).toBe(100);
  });
});

describe('computeAllTrailsProgress', () => {
  it('returns progress for all trails', async () => {
    const idx = await parseVault(VAULT);
    const all = computeAllTrailsProgress(idx);
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('Java Trail');
  });
});
