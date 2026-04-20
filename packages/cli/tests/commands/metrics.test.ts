import { describe, it, expect } from 'vitest';
import { runMetricsShow } from '../../src/commands/metrics.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme metrics show', () => {
  it('shows dashboard with totals by type', async () => {
    const r = await runMetricsShow({ vault: VAULT });
    expect(r.output).toContain('Trails');
    expect(r.output).toContain('Modules');
    expect(r.output).toContain('Notes');
    expect(r.output).toContain('Cards');
  });

  it('includes progress for each trail', async () => {
    const r = await runMetricsShow({ vault: VAULT });
    expect(r.output).toContain('Java Trail');
  });
});
