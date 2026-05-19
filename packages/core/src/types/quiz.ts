import type { BaseFrontmatter, Wikilink } from './base.js';

export interface QuizFrontmatter extends BaseFrontmatter {
  type: 'quiz';
  trail?: Wikilink;
  module?: Wikilink;
  questions: number;
  'passing-score': number;
}
