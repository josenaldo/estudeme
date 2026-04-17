import matter from 'gray-matter';

export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const result = matter(raw);
  return {
    data: result.data as Record<string, unknown>,
    content: result.content,
  };
}
