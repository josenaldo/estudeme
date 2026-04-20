import { describe, it, expect } from 'vitest';
import { runValidate } from '../../src/commands/validate.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme validate', () => {
  it('returns exit code 1 when there are errors', async () => {
    const result = await runValidate({ vault: VAULT });
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('no-type');
  });

  it('lists parse and validation errors', async () => {
    const result = await runValidate({ vault: VAULT });
    expect(result.output).toMatch(/error|missing|invalid/i);
  });
});
