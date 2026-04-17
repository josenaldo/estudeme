import type { BaseFrontmatter, Wikilink } from './base.js';

export interface ExamFrontmatter extends BaseFrontmatter {
  type: 'exam';
  trail?: Wikilink;
  questions: number;
  'time-limit': number;
  'passing-score': number;
}
