import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../../src/parser/frontmatter.js';

describe('parseFrontmatter', () => {
  it('extracts YAML frontmatter from markdown', () => {
    const input = `---
type: note
title: "Primitive Types"
tags: [java, fundamentals]
---

# Content

Note body.`;
    const { data, content } = parseFrontmatter(input);
    expect(data.type).toBe('note');
    expect(data.title).toBe('Primitive Types');
    expect(data.tags).toEqual(['java', 'fundamentals']);
    expect(content.trim()).toBe('# Content\n\nNote body.');
  });

  it('returns empty data when there is no frontmatter', () => {
    const input = '# No frontmatter\n\nJust content.';
    const { data, content } = parseFrontmatter(input);
    expect(data).toEqual({});
    expect(content.trim()).toBe('# No frontmatter\n\nJust content.');
  });

  it('throws on invalid YAML', () => {
    const input = `---\ntype: note\ntitle: "unclosed\n---\ncontent`;
    expect(() => parseFrontmatter(input)).toThrow();
  });
});
