import path from 'node:path';
import type { ParsedDocument } from '../types/base.js';
import type { VaultIndex } from '../parser/vault.js';
import { normalizeWikilink } from '../parser/wikilinks.js';
import { SCHEMAS } from './schemas.js';

export interface ValidationIssue {
  path: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface BrokenLink {
  path: string;
  link: string;
}

export interface VaultValidationResult {
  documentIssues: ValidationIssue[];
  brokenLinks: BrokenLink[];
  parseErrors: { path: string; error: string }[];
}

export function validateDocument(doc: ParsedDocument): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fm = doc.frontmatter as unknown as Record<string, unknown>;
  const type = fm['type'] as string;
  const schema = SCHEMAS[type];

  if (!schema) {
    issues.push({
      path: doc.relativePath,
      field: 'type',
      message: `Unknown document type: "${type}"`,
      severity: 'warning',
    });
    return issues;
  }

  for (const [field, fieldSchema] of Object.entries(schema)) {
    const value = fm[field];

    if (fieldSchema.required && (value === undefined || value === null || value === '')) {
      issues.push({
        path: doc.relativePath,
        field,
        message: `Required field "${field}" is missing or empty`,
        severity: 'error',
      });
      continue;
    }

    if (value === undefined || value === null) continue;

    if (fieldSchema.enum && !fieldSchema.enum.includes(value as string)) {
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      issues.push({
        path: doc.relativePath,
        field,
        message: `Field "${field}" has invalid value "${displayValue}". Expected one of: ${fieldSchema.enum.join(', ')}`,
        severity: 'error',
      });
    }
  }

  return issues;
}

export function validateVault(index: VaultIndex): VaultValidationResult {
  const documentIssues: ValidationIssue[] = [];
  const brokenLinks: BrokenLink[] = [];

  // Obsidian links resolve by filename stem, not frontmatter title.
  // Build a set of all known stems (e.g. "Module 1" from "Module 1.md") in
  // addition to using the byTitle map (which is keyed by frontmatter title).
  const knownStems = new Set<string>(
    index.documents.map((d) => path.basename(d.relativePath, '.md')),
  );

  for (const doc of index.documents) {
    documentIssues.push(...validateDocument(doc));

    for (const link of doc.wikilinks) {
      const normalized = normalizeWikilink(link);
      if (!index.byTitle.has(normalized) && !knownStems.has(normalized)) {
        brokenLinks.push({ path: doc.relativePath, link: normalized });
      }
    }
  }

  return {
    documentIssues,
    brokenLinks,
    parseErrors: index.errors.map((e) => ({ path: e.path, error: e.error })),
  };
}
