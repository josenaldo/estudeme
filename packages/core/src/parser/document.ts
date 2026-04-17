import { parseFrontmatter } from './frontmatter.js';
import { extractWikilinks, normalizeWikilink } from './wikilinks.js';
import type { BaseFrontmatter, ParsedDocument } from '../types/base.js';

const WIKILINK_FRONTMATTER_FIELDS = ['trail', 'module', 'source', 'prerequisites'];

export function parseDocument(
  raw: string,
  absolutePath: string,
  relativePath: string,
): ParsedDocument {
  const { data, content } = parseFrontmatter(raw);
  if (!data.type) throw new Error(`Frontmatter missing 'type' field in ${relativePath}`);
  if (!data.title) throw new Error(`Frontmatter missing 'title' field in ${relativePath}`);

  const contentLinks = extractWikilinks(content);
  const fmLinks = extractWikilinksFromFrontmatter(data);
  return {
    path: absolutePath,
    relativePath,
    frontmatter: data as unknown as BaseFrontmatter,
    content,
    wikilinks: Array.from(new Set([...fmLinks, ...contentLinks])),
  };
}

function extractWikilinksFromFrontmatter(data: Record<string, unknown>): string[] {
  const links: string[] = [];
  for (const field of WIKILINK_FRONTMATTER_FIELDS) {
    const value = data[field];
    if (typeof value === 'string') {
      const n = normalizeWikilink(value);
      if (n) links.push(n);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === 'string') {
          const n = normalizeWikilink(v);
          if (n) links.push(n);
        }
      }
    }
  }
  return links;
}
