import type { BaseFrontmatter, Status, Wikilink } from './base.js';

export interface TrailFrontmatter extends BaseFrontmatter {
  type: 'trail';
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: Wikilink[];
  status: Status;
}
