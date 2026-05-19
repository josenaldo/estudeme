import type { BaseFrontmatter, Wikilink } from './base.js';

export type Activity = 'card-review' | 'quiz' | 'exam' | 'study-session';

export interface PerformanceFrontmatter extends BaseFrontmatter {
  type: 'performance';
  date: string;
  trail?: Wikilink;
  module?: Wikilink;
  activity: Activity;
  score?: number;
  duration?: number;
}
