import { describe, it, expect } from 'vitest';
import type { DocumentType, Difficulty, Status, Wikilink } from '../../src/types/base.js';

describe('Base types', () => {
  it('accepts valid DocumentType', () => {
    const t: DocumentType = 'trail';
    expect(t).toBe('trail');
  });

  it('accepts Difficulty in the 1-5 range', () => {
    const d: Difficulty = 3;
    expect(d).toBeGreaterThanOrEqual(1);
    expect(d).toBeLessThanOrEqual(5);
  });

  it('Status accepts active/completed/paused/in-progress/not-started', () => {
    const s: Status = 'active';
    expect(['active', 'completed', 'paused', 'in-progress', 'not-started']).toContain(s);
  });

  it('Wikilink is a string in [[text]] format', () => {
    const w: Wikilink = '[[Java Backend]]';
    expect(w).toMatch(/^\[\[.+\]\]$/);
  });
});
