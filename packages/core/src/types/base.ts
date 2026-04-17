export type DocumentType =
  | 'trail' | 'module' | 'note' | 'card' | 'quiz'
  | 'exam' | 'resource' | 'performance'
  | string;

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Status =
  | 'active' | 'completed' | 'paused' | 'in-progress' | 'not-started';

export type Wikilink = string;

export interface BaseFrontmatter {
  type: DocumentType;
  title: string;
  tags?: string[];
  created?: string;
  updated?: string;
}

export interface ParsedDocument<T extends BaseFrontmatter = BaseFrontmatter> {
  path: string;
  relativePath: string;
  frontmatter: T;
  content: string;
  wikilinks: string[];
}
