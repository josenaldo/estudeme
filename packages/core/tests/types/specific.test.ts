import { describe, it, expect } from 'vitest';
import type {
  TrailFrontmatter, ModuleFrontmatter, NoteFrontmatter, CardFrontmatter,
  QuizFrontmatter, ExamFrontmatter, ResourceFrontmatter, PerformanceFrontmatter,
} from '../../src/types/index.js';

describe('Specific types', () => {
  it('TrailFrontmatter has type=trail and level', () => {
    const t: TrailFrontmatter = {
      type: 'trail', title: 'Java Backend', level: 'intermediate', status: 'active',
    };
    expect(t.type).toBe('trail');
    expect(t.level).toBe('intermediate');
  });

  it('CardFrontmatter has card-type and optional source', () => {
    const c: CardFrontmatter = {
      type: 'card', title: 'int vs Integer', 'card-type': 'basic',
      trail: '[[Java Backend]]', difficulty: 2,
    };
    expect(c['card-type']).toBe('basic');
  });

  it('PerformanceFrontmatter has activity and date', () => {
    const p: PerformanceFrontmatter = {
      type: 'performance', title: 'Review 2026-04-14',
      date: '2026-04-14', activity: 'card-review',
    };
    expect(p.activity).toBe('card-review');
  });
});
