import type { BaseFrontmatter, Difficulty, Wikilink } from './base.js';

export interface NoteFrontmatter extends BaseFrontmatter {
  type: 'note';
  trail?: Wikilink;
  module?: Wikilink;
  difficulty?: Difficulty;
}
