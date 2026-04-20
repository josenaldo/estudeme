import { describe, it, expect } from 'vitest';
import { runTrailList, runTrailStatus } from '../../src/commands/trail.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme trail list', () => {
  it('lists all trails with progress', async () => {
    const r = await runTrailList({ vault: VAULT });
    expect(r.output).toContain('Java Trail');
    expect(r.output).toMatch(/0%/);
  });
});

describe('estudeme trail status', () => {
  it('shows detailed status for a trail', async () => {
    const r = await runTrailStatus({ vault: VAULT, trail: 'Java Trail' });
    expect(r.output).toContain('Java Trail');
    expect(r.output).toContain('Modules');
    expect(r.output).toContain('Notes');
    expect(r.output).toContain('Cards');
  });

  it('returns error when trail does not exist', async () => {
    const r = await runTrailStatus({ vault: VAULT, trail: 'Nonexistent' });
    expect(r.exitCode).toBe(1);
    expect(r.output).toMatch(/not found/i);
  });
});
