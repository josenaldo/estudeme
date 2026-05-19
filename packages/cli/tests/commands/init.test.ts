import { describe, it, expect } from 'vitest';
import { runInit } from '../../src/commands/init.js';
import { mkdtempSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('estudeme init', () => {
  it('creates _templates folder with 5 templates', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      const r = await runInit({ vault: tmp });
      expect(r.exitCode).toBe(0);
      for (const t of ['trail', 'module', 'note', 'card', 'quiz']) {
        const p = path.join(tmp, '_templates', `${t}.md`);
        expect(existsSync(p)).toBe(true);
        expect(readFileSync(p, 'utf-8')).toContain(`type: ${t}`);
      }
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('creates a README explaining the structure', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      await runInit({ vault: tmp });
      expect(readFileSync(path.join(tmp, 'README.md'), 'utf-8')).toContain('EstudeMe');
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('does not overwrite existing files without --force', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      await runInit({ vault: tmp });
      const r2 = await runInit({ vault: tmp });
      expect(r2.output).toMatch(/already exists|skip/i);
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });
});
