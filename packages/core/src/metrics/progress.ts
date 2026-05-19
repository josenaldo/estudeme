import type { ParsedDocument } from '../types/base.js';
import type { VaultIndex } from '../parser/vault.js';
import { normalizeWikilink } from '../parser/wikilinks.js';

export interface TrailProgress {
  title: string;
  totalModules: number;
  completedModules: number;
  inProgressModules: number;
  notStartedModules: number;
  percentComplete: number;
  notes: number;
  cards: number;
  quizzes: number;
}

function getTrailTitle(doc: ParsedDocument): string {
  const fm = doc.frontmatter as unknown as Record<string, unknown>;
  const raw = fm['trail'];
  return typeof raw === 'string' ? normalizeWikilink(raw) : '';
}

export function computeTrailProgress(trail: ParsedDocument, index: VaultIndex): TrailProgress {
  const trailTitle = trail.frontmatter.title;

  const modules = (index.byType['module'] ?? []).filter(
    (doc) => getTrailTitle(doc) === trailTitle,
  );

  const notes = (index.byType['note'] ?? []).filter(
    (doc) => getTrailTitle(doc) === trailTitle,
  );

  const cards = (index.byType['card'] ?? []).filter(
    (doc) => getTrailTitle(doc) === trailTitle,
  );

  const quizzes = (index.byType['quiz'] ?? []).filter(
    (doc) => getTrailTitle(doc) === trailTitle,
  );

  const totalModules = modules.length;

  const completedModules = modules.filter(
    (m) => (m.frontmatter as unknown as Record<string, unknown>)['status'] === 'completed',
  ).length;

  const inProgressModules = modules.filter(
    (m) => (m.frontmatter as unknown as Record<string, unknown>)['status'] === 'in-progress',
  ).length;

  const notStartedModules = totalModules - completedModules - inProgressModules;

  const percentComplete =
    totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);

  return {
    title: trailTitle,
    totalModules,
    completedModules,
    inProgressModules,
    notStartedModules,
    percentComplete,
    notes: notes.length,
    cards: cards.length,
    quizzes: quizzes.length,
  };
}

export function computeAllTrailsProgress(index: VaultIndex): TrailProgress[] {
  return (index.byType['trail'] ?? []).map((trail) => computeTrailProgress(trail, index));
}
