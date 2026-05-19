import type { BaseFrontmatter, Difficulty, Wikilink } from './base.js';

export type CardType = 'basic' | 'cloze' | 'vocab' | 'scenario' | 'pitfall';

export interface CardFrontmatter extends BaseFrontmatter {
  type: 'card';
  'card-type': CardType;
  trail?: Wikilink;
  module?: Wikilink;
  source?: Wikilink;
  difficulty?: Difficulty;
  due?: string;
  interval?: number;
  reps?: number;
  lapses?: number;
}
