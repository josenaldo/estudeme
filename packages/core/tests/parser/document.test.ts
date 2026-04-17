import { describe, it, expect } from 'vitest';
import { parseDocument } from '../../src/parser/document.js';

describe('parseDocument', () => {
  it('combines frontmatter + wikilinks into a ParsedDocument', () => {
    const raw = `---
type: note
title: "Spring Boot"
trail: "[[Java Backend]]"
---

Spring Boot makes [[Dependency Injection]] easier.`;
    const doc = parseDocument(raw, '/vault/Spring Boot.md', 'Spring Boot.md');
    expect(doc.path).toBe('/vault/Spring Boot.md');
    expect(doc.relativePath).toBe('Spring Boot.md');
    expect(doc.frontmatter.type).toBe('note');
    expect(doc.frontmatter.title).toBe('Spring Boot');
    expect(doc.wikilinks).toContain('Java Backend');
    expect(doc.wikilinks).toContain('Dependency Injection');
  });

  it('also extracts wikilinks from frontmatter fields', () => {
    const raw = `---
type: card
title: "DI explained"
trail: "[[Java Backend]]"
module: "[[Spring Boot]]"
source: "[[DI Concepts]]"
---

Body without wikilinks.`;
    const doc = parseDocument(raw, '/v/c.md', 'c.md');
    expect(doc.wikilinks).toEqual(
      expect.arrayContaining(['Java Backend', 'Spring Boot', 'DI Concepts']),
    );
  });

  it('throws when type field is missing', () => {
    expect(() => parseDocument('---\ntitle: "No type"\n---\ncontent', '/v/x.md', 'x.md')).toThrow(/type/i);
  });

  it('throws when title field is missing', () => {
    expect(() => parseDocument('---\ntype: note\n---\ncontent', '/v/y.md', 'y.md')).toThrow(/title/i);
  });
});
