import type { BaseFrontmatter, Status, Wikilink } from './base.js';

export interface ModuleFrontmatter extends BaseFrontmatter {
  type: 'module';
  trail: Wikilink;
  order: number;
  status: Status;
}
