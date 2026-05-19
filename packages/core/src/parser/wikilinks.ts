const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

export function extractWikilinks(content: string): string[] {
  const matches = content.matchAll(WIKILINK_REGEX);
  const seen = new Set<string>();
  const result: string[] = [];
  for (const match of matches) {
    const target = match[1].split('|')[0].split('#')[0].trim();
    if (target && !seen.has(target)) {
      seen.add(target);
      result.push(target);
    }
  }
  return result;
}

export function normalizeWikilink(link: string): string {
  const stripped = link.replace(/^\[\[|\]\]$/g, '');
  return stripped.split('|')[0].split('#')[0].trim();
}
