import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseDocument } from './document.js';
import type { ParsedDocument } from '../types/base.js';

export interface VaultParseError {
  path: string;
  error: string;
}

export interface VaultIndex {
  root: string;
  documents: ParsedDocument[];
  byType: Record<string, ParsedDocument[]>;
  byTitle: Map<string, ParsedDocument>;
  errors: VaultParseError[];
}

const IGNORED_DIRS = new Set(['.obsidian', '.git', 'node_modules', '.trash', '.DS_Store']);

export async function parseVault(root: string): Promise<VaultIndex> {
  const documents: ParsedDocument[] = [];
  const errors: VaultParseError[] = [];
  const files = await walkMarkdownFiles(root);

  for (const file of files) {
    const relativePath = path.relative(root, file);
    try {
      const raw = await readFile(file, 'utf-8');
      documents.push(parseDocument(raw, file, relativePath));
    } catch (err) {
      errors.push({
        path: relativePath,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const byType: Record<string, ParsedDocument[]> = {};
  const byTitle = new Map<string, ParsedDocument>();

  for (const doc of documents) {
    const t = doc.frontmatter.type;
    if (!byType[t]) byType[t] = [];
    byType[t].push(doc);
    byTitle.set(doc.frontmatter.title, doc);
  }

  return { root, documents, byType, byTitle, errors };
}

async function walkMarkdownFiles(dir: string): Promise<string[]> {
  const result: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      result.push(...await walkMarkdownFiles(path.join(dir, entry.name)));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(path.join(dir, entry.name));
    }
  }

  return result;
}
