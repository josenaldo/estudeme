import { describe, it, expect } from 'vitest';
import { extractWikilinks, normalizeWikilink } from '../../src/parser/wikilinks.js';

describe('extractWikilinks', () => {
  it('extracts simple wikilinks', () => {
    expect(extractWikilinks('See [[Java Backend]] and [[Spring Boot]].'))
      .toEqual(['Java Backend', 'Spring Boot']);
  });
  it('extracts wikilinks with alias (keeps target)', () => {
    expect(extractWikilinks('See [[Java Backend|java backend]].'))
      .toEqual(['Java Backend']);
  });
  it('extracts wikilinks with header (keeps file only)', () => {
    expect(extractWikilinks('See [[Java Backend#Spring]].'))
      .toEqual(['Java Backend']);
  });
  it('returns empty array when there are no wikilinks', () => {
    expect(extractWikilinks('No links here.')).toEqual([]);
  });
  it('deduplicates wikilinks', () => {
    expect(extractWikilinks('[[Java]] and [[Java]] again.'))
      .toEqual(['Java']);
  });
});

describe('normalizeWikilink', () => {
  it('strips [[ ]] and returns the target', () => {
    expect(normalizeWikilink('[[Java Backend]]')).toBe('Java Backend');
    expect(normalizeWikilink('[[Java|alias]]')).toBe('Java');
    expect(normalizeWikilink('[[Java#header]]')).toBe('Java');
  });
  it('returns input as-is when already normalized', () => {
    expect(normalizeWikilink('Java Backend')).toBe('Java Backend');
  });
});
