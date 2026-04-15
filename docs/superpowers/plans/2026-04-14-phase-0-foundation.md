# Phase 0 — Foundation (Core Lib + CLI) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the EstudeMe foundation — a TypeScript monorepo with a core lib (parser, validation, metrics, card export) and a working CLI (`init`, `validate`, `trail`, `cards`, `metrics`), validated against the codex-technomanticus vault.

**Architecture:** Turborepo monorepo with 2 packages: `@estudeme/core` (agnostic, zero Obsidian dependencies) and `@estudeme/cli` (Commander.js, uses core). Data model: Markdown + YAML frontmatter, indexed by type. TDD for all core modules.

**Tech Stack:** TypeScript 5.x, Node.js 22+, Turborepo, tsup (bundler), Vitest (tests), Commander.js (CLI), gray-matter (frontmatter), js-yaml, ESLint, Prettier, GitHub Actions.

---

## File Structure

```
estudeme/
├── package.json                              # workspace root
├── turbo.json                                # build orchestration
├── tsconfig.base.json                        # shared TS config
├── .gitignore
├── .editorconfig
├── .prettierrc
├── eslint.config.js
├── README.md
├── .github/workflows/ci.yaml
│
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   ├── vitest.config.ts
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types/ (base, trail, module, note, card, quiz, exam, resource, performance)
│   │   │   ├── parser/ (frontmatter, wikilinks, document, vault)
│   │   │   ├── validation/ (schemas, validate)
│   │   │   ├── metrics/ (progress)
│   │   │   └── export/ (anki)
│   │   └── tests/
│   │       ├── fixtures/sample-vault/
│   │       ├── parser/
│   │       ├── validation/
│   │       ├── metrics/
│   │       └── export/
│   │
│   └── cli/
│       ├── package.json, tsconfig.json, tsup.config.ts, vitest.config.ts
│       ├── src/
│       │   ├── index.ts
│       │   ├── commands/ (init, validate, trail, cards, metrics)
│       │   └── lib/ (format, vault-loader)
│       ├── templates/ (trail.md, module.md, note.md, card.md, quiz.md)
│       └── tests/commands/
│
└── docs/
    ├── superpowers/specs/2026-04-14-estudeme-design.md
    └── superpowers/plans/2026-04-14-phase-0-foundation.md
```

---

## Task 1: Monorepo Setup

**Files:**
- Create: `package.json`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.prettierrc`, `eslint.config.js`, `README.md`

- [ ] **Step 1.1: Create `.gitignore`**

```gitignore
node_modules/
dist/
*.log
.DS_Store
.turbo/
coverage/
.env
.env.local
*.tsbuildinfo
```

- [ ] **Step 1.2: Create root `package.json`**

```json
{
  "name": "estudeme",
  "version": "0.0.0",
  "private": true,
  "description": "Open-core self-directed learning platform",
  "license": "MIT",
  "author": "Josenaldo de Oliveira Matos Filho",
  "workspaces": ["packages/*"],
  "scripts": {
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0",
    "prettier": "^3.3.0",
    "eslint": "^9.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^8.0.0"
  },
  "packageManager": "npm@10.0.0",
  "engines": { "node": ">=22.0.0" }
}
```

- [ ] **Step 1.3: Create `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test": { "dependsOn": ["^build"] },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "clean": { "cache": false }
  }
}
```

- [ ] **Step 1.4: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "isolatedModules": true
  }
}
```

- [ ] **Step 1.5: Create `.editorconfig`, `.prettierrc`, `eslint.config.js`**

`.editorconfig`:
```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

`eslint.config.js`:
```js
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs['recommended'].rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  { ignores: ['**/dist/**', '**/node_modules/**', '**/*.config.ts', '**/*.config.js'] },
];
```

- [ ] **Step 1.6: Create minimal `README.md`**

```markdown
# EstudeMe

Open-core self-directed learning platform. Markdown vault + frontmatter as the universal data format.

## Status

Under development — Phase 0 (Foundation).

See the [design doc](docs/superpowers/specs/2026-04-14-estudeme-design.md).

## License

MIT
```

- [ ] **Step 1.7: Install deps and commit**

```bash
npm install
git add .
git commit -m "chore: setup Turborepo + TypeScript monorepo"
```

Expected: `npm install` creates `node_modules/` and `package-lock.json`. No errors.

---

## Task 2: `@estudeme/core` Package Setup

**Files:**
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/tsup.config.ts`, `packages/core/vitest.config.ts`, `packages/core/src/index.ts`

- [ ] **Step 2.1: Create `packages/core/package.json`**

```json
{
  "name": "@estudeme/core",
  "version": "0.0.0",
  "description": "EstudeMe core library — parser, validation, metrics",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "@types/js-yaml": "^4.0.0",
    "@types/node": "^22.0.0",
    "tsup": "^8.0.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2.2: Create `packages/core/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "tests"]
}
```

- [ ] **Step 2.3: Create `packages/core/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node22',
});
```

- [ ] **Step 2.4: Create `packages/core/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
    },
  },
});
```

- [ ] **Step 2.5: Create `packages/core/src/index.ts` placeholder**

```ts
export const VERSION = '0.0.0';
```

- [ ] **Step 2.6: Install deps and validate build**

```bash
npm install
npm run -w @estudeme/core build
npm run -w @estudeme/core typecheck
```

Expected: build creates `packages/core/dist/index.js` and `index.d.ts`. typecheck passes.

- [ ] **Step 2.7: Commit**

```bash
git add packages/core/
git commit -m "chore(core): setup @estudeme/core package"
```

---

## Task 3: Base Types

**Files:**
- Create: `packages/core/src/types/base.ts`, `packages/core/src/types/index.ts`
- Test: `packages/core/tests/types/base.test.ts`

- [ ] **Step 3.1: Write test for base types**

`packages/core/tests/types/base.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import type { DocumentType, Difficulty, Status, Wikilink } from '../../src/types/base.js';

describe('Base types', () => {
  it('accepts valid DocumentType', () => {
    const t: DocumentType = 'trail';
    expect(t).toBe('trail');
  });

  it('accepts Difficulty in the 1-5 range', () => {
    const d: Difficulty = 3;
    expect(d).toBeGreaterThanOrEqual(1);
    expect(d).toBeLessThanOrEqual(5);
  });

  it('Status accepts active/completed/paused/in-progress/not-started', () => {
    const s: Status = 'active';
    expect(['active', 'completed', 'paused', 'in-progress', 'not-started']).toContain(s);
  });

  it('Wikilink is a string in [[text]] format', () => {
    const w: Wikilink = '[[Java Backend]]';
    expect(w).toMatch(/^\[\[.+\]\]$/);
  });
});
```

- [ ] **Step 3.2: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- types/base`
Expected: FAIL — `base.ts` does not exist.

- [ ] **Step 3.3: Implement base types**

`packages/core/src/types/base.ts`:
```ts
/**
 * Extensible types — new types can be added without architectural changes.
 */
export type DocumentType =
  | 'trail'
  | 'module'
  | 'note'
  | 'card'
  | 'quiz'
  | 'exam'
  | 'resource'
  | 'performance'
  | string;

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Status =
  | 'active'
  | 'completed'
  | 'paused'
  | 'in-progress'
  | 'not-started';

export type Wikilink = string;

export interface BaseFrontmatter {
  type: DocumentType;
  title: string;
  tags?: string[];
  created?: string;
  updated?: string;
}

export interface ParsedDocument<T extends BaseFrontmatter = BaseFrontmatter> {
  path: string;
  relativePath: string;
  frontmatter: T;
  content: string;
  wikilinks: string[];
}
```

- [ ] **Step 3.4: Create `packages/core/src/types/index.ts`**

```ts
export * from './base.js';
```

- [ ] **Step 3.5: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- types/base`
Expected: PASS (4 tests).

- [ ] **Step 3.6: Commit**

```bash
git add packages/core/src/types/ packages/core/tests/types/
git commit -m "feat(core): base types and ParsedDocument"
```

---

## Task 4: Specific Types

**Files:**
- Create: `packages/core/src/types/{trail,module,note,card,quiz,exam,resource,performance}.ts`
- Modify: `packages/core/src/types/index.ts`
- Test: `packages/core/tests/types/specific.test.ts`

- [ ] **Step 4.1: Write test for specific types**

`packages/core/tests/types/specific.test.ts`:
```ts
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
```

- [ ] **Step 4.2: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- types/specific`
Expected: FAIL.

- [ ] **Step 4.3: Implement types**

`packages/core/src/types/trail.ts`:
```ts
import type { BaseFrontmatter, Status, Wikilink } from './base.js';

export interface TrailFrontmatter extends BaseFrontmatter {
  type: 'trail';
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: Wikilink[];
  status: Status;
}
```

`packages/core/src/types/module.ts`:
```ts
import type { BaseFrontmatter, Status, Wikilink } from './base.js';

export interface ModuleFrontmatter extends BaseFrontmatter {
  type: 'module';
  trail: Wikilink;
  order: number;
  status: Status;
}
```

`packages/core/src/types/note.ts`:
```ts
import type { BaseFrontmatter, Difficulty, Wikilink } from './base.js';

export interface NoteFrontmatter extends BaseFrontmatter {
  type: 'note';
  trail?: Wikilink;
  module?: Wikilink;
  difficulty?: Difficulty;
}
```

`packages/core/src/types/card.ts`:
```ts
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
```

`packages/core/src/types/quiz.ts`:
```ts
import type { BaseFrontmatter, Wikilink } from './base.js';

export interface QuizFrontmatter extends BaseFrontmatter {
  type: 'quiz';
  trail?: Wikilink;
  module?: Wikilink;
  questions: number;
  'passing-score': number;
}
```

`packages/core/src/types/exam.ts`:
```ts
import type { BaseFrontmatter, Wikilink } from './base.js';

export interface ExamFrontmatter extends BaseFrontmatter {
  type: 'exam';
  trail?: Wikilink;
  questions: number;
  'time-limit': number;
  'passing-score': number;
}
```

`packages/core/src/types/resource.ts`:
```ts
import type { BaseFrontmatter, Wikilink } from './base.js';

export type ResourceType =
  | 'video' | 'book' | 'article' | 'course' | 'podcast'
  | 'paper' | 'documentation' | 'cheatsheet' | 'repo';

export type ResourceStatus =
  | 'to-consume' | 'in-progress' | 'consumed' | 'watched' | 'read';

export interface ResourceFrontmatter extends BaseFrontmatter {
  type: 'resource';
  'resource-type': ResourceType;
  url?: string;
  trail?: Wikilink;
  module?: Wikilink;
  status: ResourceStatus;
  rating?: 1 | 2 | 3 | 4 | 5;
}
```

`packages/core/src/types/performance.ts`:
```ts
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
```

- [ ] **Step 4.4: Update `packages/core/src/types/index.ts`**

```ts
export * from './base.js';
export * from './trail.js';
export * from './module.js';
export * from './note.js';
export * from './card.js';
export * from './quiz.js';
export * from './exam.js';
export * from './resource.js';
export * from './performance.js';
```

- [ ] **Step 4.5: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- types/`
Expected: PASS.

- [ ] **Step 4.6: Commit**

```bash
git add packages/core/src/types/ packages/core/tests/types/
git commit -m "feat(core): specific types (trail, module, note, card, quiz, exam, resource, performance)"
```

---

## Task 5: Frontmatter Parser

**Files:**
- Create: `packages/core/src/parser/frontmatter.ts`
- Test: `packages/core/tests/parser/frontmatter.test.ts`

- [ ] **Step 5.1: Write test**

`packages/core/tests/parser/frontmatter.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../../src/parser/frontmatter.js';

describe('parseFrontmatter', () => {
  it('extracts YAML frontmatter from markdown', () => {
    const input = `---
type: note
title: "Primitive Types"
tags: [java, fundamentals]
---

# Content

Note body.`;

    const { data, content } = parseFrontmatter(input);
    expect(data.type).toBe('note');
    expect(data.title).toBe('Primitive Types');
    expect(data.tags).toEqual(['java', 'fundamentals']);
    expect(content.trim()).toBe('# Content\n\nNote body.');
  });

  it('returns empty data when there is no frontmatter', () => {
    const input = '# No frontmatter\n\nJust content.';
    const { data, content } = parseFrontmatter(input);
    expect(data).toEqual({});
    expect(content.trim()).toBe('# No frontmatter\n\nJust content.');
  });

  it('throws on invalid YAML', () => {
    const input = `---
type: note
title: "unclosed
---
content`;
    expect(() => parseFrontmatter(input)).toThrow();
  });
});
```

- [ ] **Step 5.2: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- parser/frontmatter`
Expected: FAIL.

- [ ] **Step 5.3: Implement parser**

`packages/core/src/parser/frontmatter.ts`:
```ts
import matter from 'gray-matter';

export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const result = matter(raw);
  return {
    data: result.data as Record<string, unknown>,
    content: result.content,
  };
}
```

- [ ] **Step 5.4: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- parser/frontmatter`
Expected: PASS.

- [ ] **Step 5.5: Commit**

```bash
git add packages/core/src/parser/frontmatter.ts packages/core/tests/parser/frontmatter.test.ts
git commit -m "feat(core): YAML frontmatter parser"
```

---

## Task 6: Wikilink Extractor

**Files:**
- Create: `packages/core/src/parser/wikilinks.ts`
- Test: `packages/core/tests/parser/wikilinks.test.ts`

- [ ] **Step 6.1: Write test**

`packages/core/tests/parser/wikilinks.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { extractWikilinks, normalizeWikilink } from '../../src/parser/wikilinks.js';

describe('extractWikilinks', () => {
  it('extracts simple wikilinks', () => {
    expect(extractWikilinks('See [[Java Backend]] and [[Spring Boot]].'))
      .toEqual(['Java Backend', 'Spring Boot']);
  });

  it('extracts wikilinks with alias (keeps target)', () => {
    expect(extractWikilinks('See [[Java Backend|java backend]].'))
      .toEqual(['Java Backend']);
  });

  it('extracts wikilinks with header (keeps file only)', () => {
    expect(extractWikilinks('See [[Java Backend#Spring]].'))
      .toEqual(['Java Backend']);
  });

  it('returns empty array when there are no wikilinks', () => {
    expect(extractWikilinks('No links here.')).toEqual([]);
  });

  it('deduplicates wikilinks', () => {
    expect(extractWikilinks('[[Java]] and [[Java]] again.'))
      .toEqual(['Java']);
  });
});

describe('normalizeWikilink', () => {
  it('strips [[ ]] and returns the target', () => {
    expect(normalizeWikilink('[[Java Backend]]')).toBe('Java Backend');
    expect(normalizeWikilink('[[Java|alias]]')).toBe('Java');
    expect(normalizeWikilink('[[Java#header]]')).toBe('Java');
  });

  it('returns input as-is when already normalized', () => {
    expect(normalizeWikilink('Java Backend')).toBe('Java Backend');
  });
});
```

- [ ] **Step 6.2: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- parser/wikilinks`
Expected: FAIL.

- [ ] **Step 6.3: Implement extractor**

`packages/core/src/parser/wikilinks.ts`:
```ts
const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

export function extractWikilinks(content: string): string[] {
  const matches = content.matchAll(WIKILINK_REGEX);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const match of matches) {
    const target = match[1].split('|')[0].split('#')[0].trim();
    if (target && !seen.has(target)) {
      seen.add(target);
      result.push(target);
    }
  }

  return result;
}

export function normalizeWikilink(link: string): string {
  const stripped = link.replace(/^\[\[|\]\]$/g, '');
  return stripped.split('|')[0].split('#')[0].trim();
}
```

- [ ] **Step 6.4: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- parser/wikilinks`
Expected: PASS.

- [ ] **Step 6.5: Commit**

```bash
git add packages/core/src/parser/wikilinks.ts packages/core/tests/parser/wikilinks.test.ts
git commit -m "feat(core): wikilink extractor"
```

---

## Task 7: Document Parser

**Files:**
- Create: `packages/core/src/parser/document.ts`
- Test: `packages/core/tests/parser/document.test.ts`

- [ ] **Step 7.1: Write test**

`packages/core/tests/parser/document.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseDocument } from '../../src/parser/document.js';

describe('parseDocument', () => {
  it('combines frontmatter + wikilinks into a ParsedDocument', () => {
    const raw = `---
type: note
title: "Spring Boot"
trail: "[[Java Backend]]"
---

Spring Boot makes [[Dependency Injection]] easier.`;

    const doc = parseDocument(raw, '/vault/Spring Boot.md', 'Spring Boot.md');

    expect(doc.path).toBe('/vault/Spring Boot.md');
    expect(doc.relativePath).toBe('Spring Boot.md');
    expect(doc.frontmatter.type).toBe('note');
    expect(doc.frontmatter.title).toBe('Spring Boot');
    expect(doc.wikilinks).toContain('Java Backend');
    expect(doc.wikilinks).toContain('Dependency Injection');
  });

  it('also extracts wikilinks from frontmatter fields', () => {
    const raw = `---
type: card
title: "DI explained"
trail: "[[Java Backend]]"
module: "[[Spring Boot]]"
source: "[[DI Concepts]]"
---

Body without wikilinks.`;

    const doc = parseDocument(raw, '/v/c.md', 'c.md');
    expect(doc.wikilinks).toEqual(
      expect.arrayContaining(['Java Backend', 'Spring Boot', 'DI Concepts']),
    );
  });

  it('throws when type field is missing', () => {
    const raw = `---\ntitle: "No type"\n---\n\ncontent`;
    expect(() => parseDocument(raw, '/v/x.md', 'x.md')).toThrow(/type/i);
  });

  it('throws when title field is missing', () => {
    const raw = `---\ntype: note\n---\n\ncontent`;
    expect(() => parseDocument(raw, '/v/y.md', 'y.md')).toThrow(/title/i);
  });
});
```

- [ ] **Step 7.2: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- parser/document`
Expected: FAIL.

- [ ] **Step 7.3: Implement document parser**

`packages/core/src/parser/document.ts`:
```ts
import { parseFrontmatter } from './frontmatter.js';
import { extractWikilinks, normalizeWikilink } from './wikilinks.js';
import type { BaseFrontmatter, ParsedDocument } from '../types/base.js';

const WIKILINK_FRONTMATTER_FIELDS = ['trail', 'module', 'source', 'prerequisites'];

export function parseDocument(
  raw: string,
  absolutePath: string,
  relativePath: string,
): ParsedDocument {
  const { data, content } = parseFrontmatter(raw);

  if (!data.type) {
    throw new Error(`Frontmatter missing 'type' field in ${relativePath}`);
  }
  if (!data.title) {
    throw new Error(`Frontmatter missing 'title' field in ${relativePath}`);
  }

  const contentLinks = extractWikilinks(content);
  const fmLinks = extractWikilinksFromFrontmatter(data);

  return {
    path: absolutePath,
    relativePath,
    frontmatter: data as unknown as BaseFrontmatter,
    content,
    wikilinks: Array.from(new Set([...fmLinks, ...contentLinks])),
  };
}

function extractWikilinksFromFrontmatter(data: Record<string, unknown>): string[] {
  const links: string[] = [];
  for (const field of WIKILINK_FRONTMATTER_FIELDS) {
    const value = data[field];
    if (typeof value === 'string') {
      const n = normalizeWikilink(value);
      if (n) links.push(n);
    } else if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === 'string') {
          const n = normalizeWikilink(v);
          if (n) links.push(n);
        }
      }
    }
  }
  return links;
}
```

- [ ] **Step 7.4: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- parser/document`
Expected: PASS.

- [ ] **Step 7.5: Commit**

```bash
git add packages/core/src/parser/document.ts packages/core/tests/parser/document.test.ts
git commit -m "feat(core): document parser (frontmatter + wikilinks)"
```

---

## Task 8: Vault Walker and Index

**Files:**
- Create: `packages/core/src/parser/vault.ts`
- Create: `packages/core/tests/fixtures/sample-vault/` (test vault)
- Test: `packages/core/tests/parser/vault.test.ts`

- [ ] **Step 8.1: Create test vault fixture**

`packages/core/tests/fixtures/sample-vault/Java Trail.md`:
```markdown
---
type: trail
title: "Java Trail"
description: "Learn Java from scratch"
level: beginner
status: active
---

Java trail.
```

`packages/core/tests/fixtures/sample-vault/Module 1.md`:
```markdown
---
type: module
title: "Fundamentals"
trail: "[[Java Trail]]"
order: 1
status: in-progress
---

Fundamentals module.
```

`packages/core/tests/fixtures/sample-vault/notes/Primitive Types.md`:
```markdown
---
type: note
title: "Primitive Types"
trail: "[[Java Trail]]"
module: "[[Module 1]]"
difficulty: 1
---

Java has 8 primitive types.
```

`packages/core/tests/fixtures/sample-vault/cards/card-001.md`:
```markdown
---
type: card
title: "Primitive types count"
card-type: basic
trail: "[[Java Trail]]"
module: "[[Module 1]]"
source: "[[Primitive Types]]"
difficulty: 1
---

## Front
How many primitive types does Java have?

## Back
8.
```

`packages/core/tests/fixtures/sample-vault/_invalid/no-type.md`:
```markdown
---
title: "No type"
---

Invalid document.
```

`packages/core/tests/fixtures/sample-vault/.obsidian/config.json`:
```json
{}
```

- [ ] **Step 8.2: Write test**

`packages/core/tests/parser/vault.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseVault } from '../../src/parser/vault.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('parseVault', () => {
  it('finds all valid .md files', async () => {
    const result = await parseVault(VAULT);
    const titles = result.documents.map((d) => d.frontmatter.title);
    expect(titles).toContain('Java Trail');
    expect(titles).toContain('Fundamentals');
    expect(titles).toContain('Primitive Types');
    expect(titles).toContain('Primitive types count');
  });

  it('ignores .obsidian folder', async () => {
    const result = await parseVault(VAULT);
    const paths = result.documents.map((d) => d.relativePath);
    expect(paths.every((p) => !p.includes('.obsidian'))).toBe(true);
  });

  it('collects invalid documents into result.errors', async () => {
    const result = await parseVault(VAULT);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].path).toContain('no-type');
  });

  it('indexes by type', async () => {
    const result = await parseVault(VAULT);
    expect(result.byType.trail.length).toBe(1);
    expect(result.byType.module.length).toBe(1);
    expect(result.byType.note.length).toBe(1);
    expect(result.byType.card.length).toBe(1);
  });

  it('indexes by title', async () => {
    const result = await parseVault(VAULT);
    expect(result.byTitle.get('Java Trail')?.frontmatter.type).toBe('trail');
  });
});
```

- [ ] **Step 8.3: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- parser/vault`
Expected: FAIL.

- [ ] **Step 8.4: Implement vault walker**

`packages/core/src/parser/vault.ts`:
```ts
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
```

- [ ] **Step 8.5: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- parser/vault`
Expected: PASS.

- [ ] **Step 8.6: Update parser and core index**

`packages/core/src/parser/index.ts`:
```ts
export * from './frontmatter.js';
export * from './wikilinks.js';
export * from './document.js';
export * from './vault.js';
```

`packages/core/src/index.ts`:
```ts
export const VERSION = '0.0.0';
export * from './types/index.js';
export * from './parser/index.js';
```

- [ ] **Step 8.7: Commit**

```bash
git add packages/core/src/parser/ packages/core/src/index.ts packages/core/tests/parser/ packages/core/tests/fixtures/
git commit -m "feat(core): vault walker and index by type/title"
```

---

## Task 9: Validation

**Files:**
- Create: `packages/core/src/validation/schemas.ts`, `validate.ts`, `index.ts`
- Test: `packages/core/tests/validation/validate.test.ts`

- [ ] **Step 9.1: Write test**

`packages/core/tests/validation/validate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { validateDocument, validateVault } from '../../src/validation/index.js';
import { parseVault } from '../../src/parser/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('validateDocument', () => {
  it('approves a valid trail', () => {
    const doc = {
      path: '/v/t.md', relativePath: 't.md',
      frontmatter: { type: 'trail', title: 'Java', level: 'beginner', status: 'active' },
      content: '', wikilinks: [],
    } as const;
    expect(validateDocument(doc)).toEqual([]);
  });

  it('reports trail without level', () => {
    const doc = {
      path: '/v/t.md', relativePath: 't.md',
      frontmatter: { type: 'trail', title: 'Java', status: 'active' },
      content: '', wikilinks: [],
    } as any;
    expect(validateDocument(doc).some((i) => i.field === 'level')).toBe(true);
  });

  it('reports module without trail', () => {
    const doc = {
      path: '/v/m.md', relativePath: 'm.md',
      frontmatter: { type: 'module', title: 'X', order: 1, status: 'active' },
      content: '', wikilinks: [],
    } as any;
    expect(validateDocument(doc).some((i) => i.field === 'trail')).toBe(true);
  });
});

describe('validateVault', () => {
  it('detects no broken wikilinks in valid fixture', async () => {
    const idx = await parseVault(VAULT);
    expect(validateVault(idx).brokenLinks).toEqual([]);
  });

  it('includes parse errors', async () => {
    const idx = await parseVault(VAULT);
    expect(validateVault(idx).parseErrors.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 9.2: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- validation`
Expected: FAIL.

- [ ] **Step 9.3: Implement schemas and validation**

`packages/core/src/validation/schemas.ts`:
```ts
export interface FieldSchema {
  required: boolean;
  type?: 'string' | 'number' | 'array' | 'wikilink';
  enum?: readonly string[];
}

export interface TypeSchema {
  fields: Record<string, FieldSchema>;
}

export const SCHEMAS: Record<string, TypeSchema> = {
  trail: {
    fields: {
      title: { required: true, type: 'string' },
      level: { required: true, type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
      status: { required: true, type: 'string', enum: ['active', 'completed', 'paused'] },
      description: { required: false, type: 'string' },
      prerequisites: { required: false, type: 'array' },
      tags: { required: false, type: 'array' },
    },
  },
  module: {
    fields: {
      title: { required: true, type: 'string' },
      trail: { required: true, type: 'wikilink' },
      order: { required: true, type: 'number' },
      status: { required: true, type: 'string', enum: ['not-started', 'in-progress', 'completed'] },
    },
  },
  note: {
    fields: {
      title: { required: true, type: 'string' },
      trail: { required: false, type: 'wikilink' },
      module: { required: false, type: 'wikilink' },
      difficulty: { required: false, type: 'number' },
    },
  },
  card: {
    fields: {
      title: { required: true, type: 'string' },
      'card-type': { required: true, type: 'string', enum: ['basic', 'cloze', 'vocab', 'scenario', 'pitfall'] },
      trail: { required: false, type: 'wikilink' },
      module: { required: false, type: 'wikilink' },
      source: { required: false, type: 'wikilink' },
      difficulty: { required: false, type: 'number' },
    },
  },
  quiz: {
    fields: {
      title: { required: true, type: 'string' },
      questions: { required: true, type: 'number' },
      'passing-score': { required: true, type: 'number' },
      trail: { required: false, type: 'wikilink' },
      module: { required: false, type: 'wikilink' },
    },
  },
  exam: {
    fields: {
      title: { required: true, type: 'string' },
      questions: { required: true, type: 'number' },
      'time-limit': { required: true, type: 'number' },
      'passing-score': { required: true, type: 'number' },
      trail: { required: false, type: 'wikilink' },
    },
  },
  resource: {
    fields: {
      title: { required: true, type: 'string' },
      'resource-type': { required: true, type: 'string' },
      status: { required: true, type: 'string' },
      url: { required: false, type: 'string' },
      trail: { required: false, type: 'wikilink' },
      module: { required: false, type: 'wikilink' },
      rating: { required: false, type: 'number' },
    },
  },
  performance: {
    fields: {
      title: { required: true, type: 'string' },
      date: { required: true, type: 'string' },
      activity: { required: true, type: 'string', enum: ['card-review', 'quiz', 'exam', 'study-session'] },
      trail: { required: false, type: 'wikilink' },
      module: { required: false, type: 'wikilink' },
      score: { required: false, type: 'number' },
      duration: { required: false, type: 'number' },
    },
  },
};
```

`packages/core/src/validation/validate.ts`:
```ts
import { SCHEMAS, type FieldSchema } from './schemas.js';
import type { ParsedDocument } from '../types/base.js';
import type { VaultIndex } from '../parser/vault.js';
import { normalizeWikilink } from '../parser/wikilinks.js';

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
  const schema = SCHEMAS[doc.frontmatter.type];
  if (!schema) {
    return [{
      path: doc.relativePath,
      field: 'type',
      message: `Custom type '${doc.frontmatter.type}' has no schema (ok, but not validated)`,
      severity: 'warning',
    }];
  }

  const issues: ValidationIssue[] = [];
  const fm = doc.frontmatter as Record<string, unknown>;

  for (const [field, fieldSchema] of Object.entries(schema.fields)) {
    const issue = validateField(doc.relativePath, field, fm[field], fieldSchema);
    if (issue) issues.push(issue);
  }

  return issues;
}

function validateField(
  path: string,
  field: string,
  value: unknown,
  schema: FieldSchema,
): ValidationIssue | null {
  if (value === undefined || value === null) {
    if (schema.required) {
      return { path, field, message: `Required field '${field}' is missing`, severity: 'error' };
    }
    return null;
  }
  if (schema.type === 'string' && typeof value !== 'string') {
    return { path, field, message: `Field '${field}' must be a string`, severity: 'error' };
  }
  if (schema.type === 'number' && typeof value !== 'number') {
    return { path, field, message: `Field '${field}' must be a number`, severity: 'error' };
  }
  if (schema.type === 'array' && !Array.isArray(value)) {
    return { path, field, message: `Field '${field}' must be an array`, severity: 'error' };
  }
  if (schema.type === 'wikilink' && typeof value !== 'string') {
    return { path, field, message: `Field '${field}' must be a wikilink string`, severity: 'error' };
  }
  if (schema.enum && typeof value === 'string' && !schema.enum.includes(value)) {
    return {
      path, field,
      message: `Field '${field}' value '${value}' is not in [${schema.enum.join(', ')}]`,
      severity: 'error',
    };
  }
  return null;
}

export function validateVault(index: VaultIndex): VaultValidationResult {
  const documentIssues: ValidationIssue[] = [];
  const brokenLinks: BrokenLink[] = [];

  for (const doc of index.documents) {
    documentIssues.push(...validateDocument(doc));
    for (const link of doc.wikilinks) {
      const target = normalizeWikilink(link);
      if (!index.byTitle.has(target)) {
        brokenLinks.push({ path: doc.relativePath, link: target });
      }
    }
  }

  return { documentIssues, brokenLinks, parseErrors: index.errors };
}
```

`packages/core/src/validation/index.ts`:
```ts
export * from './schemas.js';
export * from './validate.js';
```

- [ ] **Step 9.4: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- validation`
Expected: PASS.

- [ ] **Step 9.5: Update core index**

Append to `packages/core/src/index.ts`:
```ts
export * from './validation/index.js';
```

- [ ] **Step 9.6: Commit**

```bash
git add packages/core/src/validation/ packages/core/src/index.ts packages/core/tests/validation/
git commit -m "feat(core): schema validation and broken-link detection"
```

---

## Task 10: Progress Metrics

**Files:**
- Create: `packages/core/src/metrics/progress.ts`, `index.ts`
- Test: `packages/core/tests/metrics/progress.test.ts`

- [ ] **Step 10.1: Write test**

`packages/core/tests/metrics/progress.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { computeTrailProgress, computeAllTrailsProgress } from '../../src/metrics/index.js';
import { parseVault } from '../../src/parser/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('computeTrailProgress', () => {
  it('computes trail progress (completed modules / total)', async () => {
    const idx = await parseVault(VAULT);
    const trail = idx.byTitle.get('Java Trail')!;
    const progress = computeTrailProgress(trail, idx);

    expect(progress.title).toBe('Java Trail');
    expect(progress.totalModules).toBe(1);
    expect(progress.completedModules).toBe(0);
    expect(progress.inProgressModules).toBe(1);
    expect(progress.percentComplete).toBe(0);
    expect(progress.notes).toBe(1);
    expect(progress.cards).toBe(1);
  });

  it('counts modules with status=completed', async () => {
    const idx = await parseVault(VAULT);
    const trail = idx.byTitle.get('Java Trail')!;
    (idx.byTitle.get('Fundamentals')!.frontmatter as any).status = 'completed';
    const progress = computeTrailProgress(trail, idx);
    expect(progress.percentComplete).toBe(100);
  });
});

describe('computeAllTrailsProgress', () => {
  it('returns progress for all trails', async () => {
    const idx = await parseVault(VAULT);
    const all = computeAllTrailsProgress(idx);
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('Java Trail');
  });
});
```

- [ ] **Step 10.2: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- metrics`
Expected: FAIL.

- [ ] **Step 10.3: Implement metrics**

`packages/core/src/metrics/progress.ts`:
```ts
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

export function computeTrailProgress(trail: ParsedDocument, index: VaultIndex): TrailProgress {
  const trailTitle = trail.frontmatter.title;
  const modules = (index.byType.module ?? []).filter((m) => {
    const t = (m.frontmatter as Record<string, unknown>).trail;
    return typeof t === 'string' && normalizeWikilink(t) === trailTitle;
  });

  const completedModules = modules.filter(
    (m) => (m.frontmatter as Record<string, unknown>).status === 'completed',
  ).length;
  const inProgressModules = modules.filter(
    (m) => (m.frontmatter as Record<string, unknown>).status === 'in-progress',
  ).length;
  const notStartedModules = modules.filter(
    (m) => (m.frontmatter as Record<string, unknown>).status === 'not-started',
  ).length;

  const totalModules = modules.length;
  const percentComplete =
    totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);

  return {
    title: trailTitle,
    totalModules,
    completedModules,
    inProgressModules,
    notStartedModules,
    percentComplete,
    notes: countByTrail(index.byType.note ?? [], trailTitle),
    cards: countByTrail(index.byType.card ?? [], trailTitle),
    quizzes: countByTrail(index.byType.quiz ?? [], trailTitle),
  };
}

function countByTrail(docs: ParsedDocument[], trailTitle: string): number {
  return docs.filter((d) => {
    const t = (d.frontmatter as Record<string, unknown>).trail;
    return typeof t === 'string' && normalizeWikilink(t) === trailTitle;
  }).length;
}

export function computeAllTrailsProgress(index: VaultIndex): TrailProgress[] {
  return (index.byType.trail ?? []).map((t) => computeTrailProgress(t, index));
}
```

`packages/core/src/metrics/index.ts`:
```ts
export * from './progress.js';
```

- [ ] **Step 10.4: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- metrics`
Expected: PASS.

- [ ] **Step 10.5: Update core index**

Append to `packages/core/src/index.ts`:
```ts
export * from './metrics/index.js';
```

- [ ] **Step 10.6: Commit**

```bash
git add packages/core/src/metrics/ packages/core/src/index.ts packages/core/tests/metrics/
git commit -m "feat(core): trail progress metrics"
```

---

## Task 11: Card Export — Neutral JSON

**Decision:** For Phase 0, avoid reimplementing `.apkg` generation in TypeScript. `core` emits neutral JSON; users needing `.apkg` pipe it into the Python `arcana`.

**Files:**
- Create: `packages/core/src/export/anki.ts`, `index.ts`
- Test: `packages/core/tests/export/anki.test.ts`

- [ ] **Step 11.1: Write test**

`packages/core/tests/export/anki.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { extractCardsForExport, cardsToJSON } from '../../src/export/index.js';
import { parseVault } from '../../src/parser/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('extractCardsForExport', () => {
  it('extracts cards from the vault', async () => {
    const idx = await parseVault(VAULT);
    const cards = extractCardsForExport(idx);
    expect(cards.length).toBe(1);
    expect(cards[0].cardType).toBe('basic');
    expect(cards[0].front).toContain('How many primitive types');
    expect(cards[0].back).toContain('8');
    expect(cards[0].trail).toBe('Java Trail');
  });

  it('splits Front/Back by ## Front / ## Back headers', async () => {
    const idx = await parseVault(VAULT);
    const cards = extractCardsForExport(idx);
    expect(cards[0].front.trim()).not.toContain('## Back');
  });
});

describe('cardsToJSON', () => {
  it('serializes cards as structured JSON', async () => {
    const idx = await parseVault(VAULT);
    const json = cardsToJSON(extractCardsForExport(idx));
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.cards).toHaveLength(1);
  });
});
```

- [ ] **Step 11.2: Run test, expect failure**

Run: `npm run -w @estudeme/core test -- export`
Expected: FAIL.

- [ ] **Step 11.3: Implement export**

`packages/core/src/export/anki.ts`:
```ts
import type { VaultIndex } from '../parser/vault.js';
import type { ParsedDocument } from '../types/base.js';
import { normalizeWikilink } from '../parser/wikilinks.js';

export interface CardForExport {
  id: string;
  cardType: string;
  front: string;
  back: string;
  trail?: string;
  module?: string;
  source?: string;
  tags: string[];
  difficulty?: number;
}

const FRONT_HEADER = /^##\s+Front\s*$/im;
const BACK_HEADER = /^##\s+Back\s*$/im;

export function extractCardsForExport(index: VaultIndex): CardForExport[] {
  return (index.byType.card ?? []).map((doc) => extractCard(doc));
}

function extractCard(doc: ParsedDocument): CardForExport {
  const fm = doc.frontmatter as Record<string, unknown>;
  const { front, back } = splitFrontBack(doc.content);

  return {
    id: doc.relativePath.replace(/[/\\]/g, '_').replace(/\.md$/, ''),
    cardType: (fm['card-type'] as string) ?? 'basic',
    front,
    back,
    trail: typeof fm.trail === 'string' ? normalizeWikilink(fm.trail) : undefined,
    module: typeof fm.module === 'string' ? normalizeWikilink(fm.module) : undefined,
    source: typeof fm.source === 'string' ? normalizeWikilink(fm.source) : undefined,
    tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
    difficulty: typeof fm.difficulty === 'number' ? fm.difficulty : undefined,
  };
}

function splitFrontBack(content: string): { front: string; back: string } {
  const frontMatch = content.search(FRONT_HEADER);
  const backMatch = content.search(BACK_HEADER);

  if (frontMatch < 0 || backMatch < 0) {
    return { front: content.trim(), back: '' };
  }

  const frontStart = content.indexOf('\n', frontMatch) + 1;
  const front = content.slice(frontStart, backMatch).trim();
  const backStart = content.indexOf('\n', backMatch) + 1;
  const back = content.slice(backStart).trim();

  return { front, back };
}

export function cardsToJSON(cards: CardForExport[]): string {
  return JSON.stringify(
    { version: 1, generatedAt: new Date().toISOString(), cards },
    null,
    2,
  );
}
```

`packages/core/src/export/index.ts`:
```ts
export * from './anki.js';
```

- [ ] **Step 11.4: Run test, expect pass**

Run: `npm run -w @estudeme/core test -- export`
Expected: PASS.

- [ ] **Step 11.5: Update core index**

Append to `packages/core/src/index.ts`:
```ts
export * from './export/index.js';
```

- [ ] **Step 11.6: Commit**

```bash
git add packages/core/src/export/ packages/core/src/index.ts packages/core/tests/export/
git commit -m "feat(core): card extraction for export (neutral JSON)"
```

---

## Task 12: `@estudeme/cli` Package Setup

**Files:**
- Create: `packages/cli/package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`, `src/index.ts`

- [ ] **Step 12.1: Create `packages/cli/package.json`**

```json
{
  "name": "@estudeme/cli",
  "version": "0.0.0",
  "description": "EstudeMe CLI",
  "type": "module",
  "main": "./dist/index.js",
  "bin": { "estudeme": "./dist/index.js" },
  "files": ["dist", "templates"],
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "@estudeme/core": "0.0.0",
    "commander": "^12.0.0",
    "kleur": "^4.1.5",
    "cli-table3": "^0.6.5"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsup": "^8.0.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 12.2: Create `packages/cli/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "tests"],
  "references": [{ "path": "../core" }]
}
```

- [ ] **Step 12.3: Create `packages/cli/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  target: 'node22',
  banner: { js: '#!/usr/bin/env node' },
});
```

- [ ] **Step 12.4: Create `packages/cli/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 12.5: Create `packages/cli/src/index.ts` placeholder**

```ts
import { Command } from 'commander';

const program = new Command();
program
  .name('estudeme')
  .description('Open-core self-directed learning platform')
  .version('0.0.0');

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 12.6: Install deps and validate build**

```bash
npm install
npm run -w @estudeme/cli build
node packages/cli/dist/index.js --help
```

Expected: build OK, `--help` shows usage.

- [ ] **Step 12.7: Commit**

```bash
git add packages/cli/
git commit -m "chore(cli): setup @estudeme/cli package"
```

---

## Task 13: Vault Loader and Format Helpers

**Files:**
- Create: `packages/cli/src/lib/vault-loader.ts`, `format.ts`
- Test: `packages/cli/tests/lib/vault-loader.test.ts`

- [ ] **Step 13.1: Write test**

`packages/cli/tests/lib/vault-loader.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { resolveVaultPath } from '../../src/lib/vault-loader.js';
import path from 'node:path';

describe('resolveVaultPath', () => {
  it('accepts an absolute path', () => {
    expect(resolveVaultPath('/tmp/vault')).toBe('/tmp/vault');
  });

  it('resolves a relative path against cwd', () => {
    expect(path.isAbsolute(resolveVaultPath('./my-vault'))).toBe(true);
  });

  it('returns cwd when no vault path is given', () => {
    expect(resolveVaultPath()).toBe(process.cwd());
  });
});
```

- [ ] **Step 13.2: Run test, expect failure**

Run: `npm run -w @estudeme/cli test -- vault-loader`
Expected: FAIL.

- [ ] **Step 13.3: Implement helpers**

`packages/cli/src/lib/vault-loader.ts`:
```ts
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';

export function resolveVaultPath(input?: string): string {
  if (!input) return process.cwd();
  if (path.isAbsolute(input)) return input;
  return path.resolve(process.cwd(), input);
}

export function assertVaultExists(vaultPath: string): void {
  if (!existsSync(vaultPath)) {
    throw new Error(`Vault not found: ${vaultPath}`);
  }
  if (!statSync(vaultPath).isDirectory()) {
    throw new Error(`Vault path must be a directory: ${vaultPath}`);
  }
}
```

`packages/cli/src/lib/format.ts`:
```ts
import kleur from 'kleur';
import Table from 'cli-table3';

export const c = {
  ok: (s: string) => kleur.green(s),
  err: (s: string) => kleur.red(s),
  warn: (s: string) => kleur.yellow(s),
  info: (s: string) => kleur.cyan(s),
  dim: (s: string) => kleur.gray(s),
  bold: (s: string) => kleur.bold(s),
};

export function progressBar(percent: number, width = 20): string {
  const filled = Math.round((percent / 100) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function table(head: string[], rows: string[][]): string {
  const t = new Table({
    head: head.map((h) => kleur.bold(h)),
    style: { head: [], border: [] },
  });
  rows.forEach((r) => t.push(r));
  return t.toString();
}
```

- [ ] **Step 13.4: Run test, expect pass**

Run: `npm run -w @estudeme/cli test -- vault-loader`
Expected: PASS.

- [ ] **Step 13.5: Commit**

```bash
git add packages/cli/src/lib/ packages/cli/tests/lib/
git commit -m "feat(cli): vault-loader and format helpers"
```

---

## Task 14: `estudeme validate` Command

**Files:**
- Create: `packages/cli/src/commands/validate.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/commands/validate.test.ts`

- [ ] **Step 14.1: Write test**

`packages/cli/tests/commands/validate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runValidate } from '../../src/commands/validate.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme validate', () => {
  it('returns exit code 1 when there are errors', async () => {
    const result = await runValidate({ vault: VAULT });
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('no-type');
  });

  it('lists parse and validation errors', async () => {
    const result = await runValidate({ vault: VAULT });
    expect(result.output).toMatch(/error|missing|invalid/i);
  });
});
```

- [ ] **Step 14.2: Run test, expect failure**

Run: `npm run -w @estudeme/cli test -- validate`
Expected: FAIL.

- [ ] **Step 14.3: Implement command**

`packages/cli/src/commands/validate.ts`:
```ts
import { parseVault, validateVault } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c } from '../lib/format.js';

export interface ValidateOptions {
  vault?: string;
}

export interface ValidateResult {
  exitCode: number;
  output: string;
}

export async function runValidate(opts: ValidateOptions): Promise<ValidateResult> {
  const lines: string[] = [];
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  lines.push(c.dim(`Vault: ${vaultPath}`));
  lines.push('');

  const idx = await parseVault(vaultPath);
  const result = validateVault(idx);

  let hasError = false;

  if (result.parseErrors.length > 0) {
    lines.push(c.bold('Parse errors:'));
    for (const e of result.parseErrors) {
      lines.push(`  ${c.err('✗')} ${e.path}: ${e.error}`);
      hasError = true;
    }
    lines.push('');
  }

  const errors = result.documentIssues.filter((i) => i.severity === 'error');
  const warnings = result.documentIssues.filter((i) => i.severity === 'warning');

  if (errors.length > 0) {
    lines.push(c.bold(`Validation errors (${errors.length}):`));
    for (const i of errors) {
      lines.push(`  ${c.err('✗')} ${i.path} [${i.field}]: ${i.message}`);
      hasError = true;
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(c.bold(`Warnings (${warnings.length}):`));
    for (const i of warnings) {
      lines.push(`  ${c.warn('⚠')} ${i.path} [${i.field}]: ${i.message}`);
    }
    lines.push('');
  }

  if (result.brokenLinks.length > 0) {
    lines.push(c.bold(`Broken wikilinks (${result.brokenLinks.length}):`));
    for (const b of result.brokenLinks) {
      lines.push(`  ${c.err('✗')} ${b.path}: [[${b.link}]]`);
      hasError = true;
    }
    lines.push('');
  }

  lines.push(
    `${c.dim('Summary:')} ${idx.documents.length} documents, ${errors.length} errors, ${warnings.length} warnings, ${result.brokenLinks.length} broken links`,
  );

  return { exitCode: hasError ? 1 : 0, output: lines.join('\n') };
}
```

- [ ] **Step 14.4: Register command in `index.ts`**

`packages/cli/src/index.ts`:
```ts
import { Command } from 'commander';
import { runValidate } from './commands/validate.js';

const program = new Command();
program
  .name('estudeme')
  .description('Open-core self-directed learning platform')
  .version('0.0.0');

program
  .command('validate')
  .description('Validate frontmatter, schemas, and wikilinks in the vault')
  .option('-v, --vault <path>', 'vault path (default: cwd)')
  .action(async (opts) => {
    const { exitCode, output } = await runValidate(opts);
    console.log(output);
    process.exit(exitCode);
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 14.5: Run test, expect pass**

Run: `npm run -w @estudeme/cli test -- validate`
Expected: PASS.

- [ ] **Step 14.6: Smoke test against the real vault**

```bash
npm run -w @estudeme/core build
npm run -w @estudeme/cli build
node packages/cli/dist/index.js validate --vault /home/josenaldo/repos/personal/codex-technomanticus
```

- [ ] **Step 14.7: Commit**

```bash
git add packages/cli/src/commands/validate.ts packages/cli/src/index.ts packages/cli/tests/commands/validate.test.ts
git commit -m "feat(cli): 'validate' command"
```

---

## Task 15: `estudeme trail list/status`

**Files:**
- Create: `packages/cli/src/commands/trail.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/commands/trail.test.ts`

- [ ] **Step 15.1: Write test**

`packages/cli/tests/commands/trail.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runTrailList, runTrailStatus } from '../../src/commands/trail.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme trail list', () => {
  it('lists all trails with progress', async () => {
    const r = await runTrailList({ vault: VAULT });
    expect(r.output).toContain('Java Trail');
    expect(r.output).toMatch(/0%/);
  });
});

describe('estudeme trail status', () => {
  it('shows detailed status for a trail', async () => {
    const r = await runTrailStatus({ vault: VAULT, trail: 'Java Trail' });
    expect(r.output).toContain('Java Trail');
    expect(r.output).toContain('Modules');
    expect(r.output).toContain('Notes');
    expect(r.output).toContain('Cards');
  });

  it('returns error when trail does not exist', async () => {
    const r = await runTrailStatus({ vault: VAULT, trail: 'Nonexistent' });
    expect(r.exitCode).toBe(1);
    expect(r.output).toMatch(/not found/i);
  });
});
```

- [ ] **Step 15.2: Run test, expect failure**

Run: `npm run -w @estudeme/cli test -- trail`
Expected: FAIL.

- [ ] **Step 15.3: Implement command**

`packages/cli/src/commands/trail.ts`:
```ts
import { parseVault, computeAllTrailsProgress, computeTrailProgress } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, table, progressBar } from '../lib/format.js';

export interface TrailListOptions { vault?: string }
export interface TrailStatusOptions { vault?: string; trail: string }
export interface CommandResult { exitCode: number; output: string }

export async function runTrailList(opts: TrailListOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  const all = computeAllTrailsProgress(idx);

  if (all.length === 0) {
    return { exitCode: 0, output: c.dim('No trails found.') };
  }

  const rows = all.map((p) => [
    p.title,
    `${progressBar(p.percentComplete, 15)} ${p.percentComplete}%`,
    `${p.completedModules}/${p.totalModules}`,
    String(p.notes),
    String(p.cards),
  ]);

  return { exitCode: 0, output: table(['Trail', 'Progress', 'Modules', 'Notes', 'Cards'], rows) };
}

export async function runTrailStatus(opts: TrailStatusOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  const trail = idx.byTitle.get(opts.trail);

  if (!trail || trail.frontmatter.type !== 'trail') {
    return { exitCode: 1, output: c.err(`Trail not found: ${opts.trail}`) };
  }

  const p = computeTrailProgress(trail, idx);
  const lines = [
    c.bold(`📋 ${p.title}`),
    '',
    `Progress: ${progressBar(p.percentComplete, 30)} ${p.percentComplete}%`,
    '',
    `${c.dim('Modules:')}     ${p.completedModules} completed | ${p.inProgressModules} in progress | ${p.notStartedModules} not started`,
    `${c.dim('Notes:')}       ${p.notes}`,
    `${c.dim('Cards:')}       ${p.cards}`,
    `${c.dim('Quizzes:')}     ${p.quizzes}`,
  ];

  return { exitCode: 0, output: lines.join('\n') };
}
```

- [ ] **Step 15.4: Register command**

Append to `packages/cli/src/index.ts` before `program.parseAsync`:
```ts
import { runTrailList, runTrailStatus } from './commands/trail.js';

const trail = program.command('trail').description('Manage study trails');

trail
  .command('list')
  .description('List all trails with progress')
  .option('-v, --vault <path>', 'vault path')
  .action(async (opts) => {
    const r = await runTrailList(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });

trail
  .command('status <trail>')
  .description('Show detailed status for a trail')
  .option('-v, --vault <path>', 'vault path')
  .action(async (trailName, opts) => {
    const r = await runTrailStatus({ ...opts, trail: trailName });
    console.log(r.output);
    process.exit(r.exitCode);
  });
```

- [ ] **Step 15.5: Run test, expect pass**

Run: `npm run -w @estudeme/cli test -- trail`
Expected: PASS.

- [ ] **Step 15.6: Commit**

```bash
git add packages/cli/src/commands/trail.ts packages/cli/src/index.ts packages/cli/tests/commands/trail.test.ts
git commit -m "feat(cli): 'trail list' and 'trail status' commands"
```

---

## Task 16: `estudeme cards list/export`

**Files:**
- Create: `packages/cli/src/commands/cards.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/commands/cards.test.ts`

- [ ] **Step 16.1: Write test**

`packages/cli/tests/commands/cards.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runCardsList, runCardsExport } from '../../src/commands/cards.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme cards list', () => {
  it('lists cards with optional filters', async () => {
    const r = await runCardsList({ vault: VAULT });
    expect(r.output).toContain('1 card');
  });

  it('filters by trail', async () => {
    const r = await runCardsList({ vault: VAULT, trail: 'Java Trail' });
    expect(r.output).toContain('1 card');
  });
});

describe('estudeme cards export', () => {
  it('exports cards to JSON', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-test-'));
    const out = path.join(tmp, 'cards.json');
    try {
      const r = await runCardsExport({ vault: VAULT, output: out, format: 'json' });
      expect(r.exitCode).toBe(0);
      const parsed = JSON.parse(readFileSync(out, 'utf-8'));
      expect(parsed.cards).toHaveLength(1);
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });
});
```

- [ ] **Step 16.2: Run test, expect failure**

Run: `npm run -w @estudeme/cli test -- cards`
Expected: FAIL.

- [ ] **Step 16.3: Implement command**

`packages/cli/src/commands/cards.ts`:
```ts
import { parseVault, extractCardsForExport, cardsToJSON } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, table } from '../lib/format.js';
import { writeFile } from 'node:fs/promises';

export interface CardsListOptions { vault?: string; trail?: string; module?: string }
export interface CardsExportOptions { vault?: string; output: string; format: 'json' | 'apkg'; trail?: string }
export interface CommandResult { exitCode: number; output: string }

export async function runCardsList(opts: CardsListOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  let cards = extractCardsForExport(idx);
  if (opts.trail) cards = cards.filter((c) => c.trail === opts.trail);
  if (opts.module) cards = cards.filter((c) => c.module === opts.module);

  if (cards.length === 0) {
    return { exitCode: 0, output: c.dim('No cards found.') };
  }

  const rows = cards.map((card) => [
    card.id,
    card.cardType,
    card.trail ?? '-',
    card.module ?? '-',
    card.front.slice(0, 50) + (card.front.length > 50 ? '...' : ''),
  ]);

  const t = table(['ID', 'Type', 'Trail', 'Module', 'Front'], rows);
  return { exitCode: 0, output: `${t}\n${c.dim(`${cards.length} card(s)`)}` };
}

export async function runCardsExport(opts: CardsExportOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  let cards = extractCardsForExport(idx);
  if (opts.trail) cards = cards.filter((c) => c.trail === opts.trail);

  if (opts.format === 'json') {
    await writeFile(opts.output, cardsToJSON(cards), 'utf-8');
    return { exitCode: 0, output: c.ok(`✓ ${cards.length} cards exported to ${opts.output}`) };
  }

  if (opts.format === 'apkg') {
    return {
      exitCode: 1,
      output: c.warn('Phase 0 .apkg export: use `arcana` (Python) with the JSON produced by --format json. Native support arrives later.'),
    };
  }

  return { exitCode: 1, output: c.err(`Unknown format: ${opts.format}`) };
}
```

- [ ] **Step 16.4: Register command**

Append to `packages/cli/src/index.ts`:
```ts
import { runCardsList, runCardsExport } from './commands/cards.js';

const cards = program.command('cards').description('Manage flashcards');

cards
  .command('list')
  .description('List cards in the vault with optional filters')
  .option('-v, --vault <path>', 'vault path')
  .option('-t, --trail <name>', 'filter by trail')
  .option('-m, --module <name>', 'filter by module')
  .action(async (opts) => {
    const r = await runCardsList(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });

cards
  .command('export')
  .description('Export cards (json or apkg)')
  .requiredOption('-o, --output <path>', 'output file')
  .option('-f, --format <format>', 'json | apkg', 'json')
  .option('-v, --vault <path>', 'vault path')
  .option('-t, --trail <name>', 'filter by trail')
  .action(async (opts) => {
    const r = await runCardsExport(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });
```

- [ ] **Step 16.5: Run test, expect pass**

Run: `npm run -w @estudeme/cli test -- cards`
Expected: PASS.

- [ ] **Step 16.6: Commit**

```bash
git add packages/cli/src/commands/cards.ts packages/cli/src/index.ts packages/cli/tests/commands/cards.test.ts
git commit -m "feat(cli): 'cards list' and 'cards export' commands"
```

---

## Task 17: `estudeme metrics show`

**Files:**
- Create: `packages/cli/src/commands/metrics.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/commands/metrics.test.ts`

- [ ] **Step 17.1: Write test**

`packages/cli/tests/commands/metrics.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runMetricsShow } from '../../src/commands/metrics.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme metrics show', () => {
  it('shows dashboard with totals by type', async () => {
    const r = await runMetricsShow({ vault: VAULT });
    expect(r.output).toContain('Trails');
    expect(r.output).toContain('Modules');
    expect(r.output).toContain('Notes');
    expect(r.output).toContain('Cards');
  });

  it('includes progress for each trail', async () => {
    const r = await runMetricsShow({ vault: VAULT });
    expect(r.output).toContain('Java Trail');
  });
});
```

- [ ] **Step 17.2: Run test, expect failure**

Run: `npm run -w @estudeme/cli test -- metrics`
Expected: FAIL.

- [ ] **Step 17.3: Implement command**

`packages/cli/src/commands/metrics.ts`:
```ts
import { parseVault, computeAllTrailsProgress } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, progressBar } from '../lib/format.js';

export interface MetricsShowOptions { vault?: string }
export interface CommandResult { exitCode: number; output: string }

export async function runMetricsShow(opts: MetricsShowOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  const all = computeAllTrailsProgress(idx);

  const totals = {
    trails: idx.byType.trail?.length ?? 0,
    modules: idx.byType.module?.length ?? 0,
    notes: idx.byType.note?.length ?? 0,
    cards: idx.byType.card?.length ?? 0,
    quizzes: idx.byType.quiz?.length ?? 0,
    exams: idx.byType.exam?.length ?? 0,
    resources: idx.byType.resource?.length ?? 0,
  };

  const lines: string[] = [];
  lines.push(c.bold('📊 EstudeMe Dashboard'));
  lines.push(c.dim(`Vault: ${vaultPath}`));
  lines.push('');
  lines.push(c.bold('Totals'));
  lines.push(`  ${c.dim('Trails:')}    ${totals.trails}`);
  lines.push(`  ${c.dim('Modules:')}   ${totals.modules}`);
  lines.push(`  ${c.dim('Notes:')}     ${totals.notes}`);
  lines.push(`  ${c.dim('Cards:')}     ${totals.cards}`);
  lines.push(`  ${c.dim('Quizzes:')}   ${totals.quizzes}`);
  lines.push(`  ${c.dim('Exams:')}     ${totals.exams}`);
  lines.push(`  ${c.dim('Resources:')} ${totals.resources}`);
  lines.push('');

  if (all.length > 0) {
    lines.push(c.bold('Trails'));
    for (const p of all) {
      lines.push(
        `  ${p.title.padEnd(30)} ${progressBar(p.percentComplete, 20)} ${String(p.percentComplete).padStart(3)}%`,
      );
    }
  }

  return { exitCode: 0, output: lines.join('\n') };
}
```

- [ ] **Step 17.4: Register command**

Append to `packages/cli/src/index.ts`:
```ts
import { runMetricsShow } from './commands/metrics.js';

const metrics = program.command('metrics').description('Show study metrics');

metrics
  .command('show')
  .description('Dashboard with totals and per-trail progress')
  .option('-v, --vault <path>', 'vault path')
  .action(async (opts) => {
    const r = await runMetricsShow(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });
```

- [ ] **Step 17.5: Run test, expect pass**

Run: `npm run -w @estudeme/cli test -- metrics`
Expected: PASS.

- [ ] **Step 17.6: Commit**

```bash
git add packages/cli/src/commands/metrics.ts packages/cli/src/index.ts packages/cli/tests/commands/metrics.test.ts
git commit -m "feat(cli): 'metrics show' command"
```

---

## Task 18: Templates and `estudeme init`

**Files:**
- Create: `packages/cli/templates/{trail,module,note,card,quiz}.md`
- Create: `packages/cli/src/commands/init.ts`
- Modify: `packages/cli/src/index.ts`, `packages/cli/tsup.config.ts`
- Test: `packages/cli/tests/commands/init.test.ts`

- [ ] **Step 18.1: Create templates**

`packages/cli/templates/trail.md`:
```markdown
---
type: trail
title: "<%* tR += await tp.system.prompt('Trail title') %>"
description: ""
level: beginner
prerequisites: []
tags: []
status: active
created: <% tp.date.now('YYYY-MM-DD') %>
---

## Goal

<trail description>

## Modules

- 
```

`packages/cli/templates/module.md`:
```markdown
---
type: module
title: "<%* tR += await tp.system.prompt('Module title') %>"
trail: "[[<%* tR += await tp.system.prompt('Trail') %>]]"
order: 1
status: not-started
---

## Content

- 
```

`packages/cli/templates/note.md`:
```markdown
---
type: note
title: "<%* tR += tp.file.title %>"
trail: ""
module: ""
difficulty: 1
tags: []
---


```

`packages/cli/templates/card.md`:
```markdown
---
type: card
title: "<%* tR += await tp.system.prompt('Card title') %>"
card-type: basic
trail: ""
module: ""
source: ""
difficulty: 2
---

## Front

<question>

## Back

<answer>
```

`packages/cli/templates/quiz.md`:
```markdown
---
type: quiz
title: "<%* tR += await tp.system.prompt('Quiz title') %>"
trail: ""
module: ""
questions: 5
passing-score: 70
---

## Q1

<question>

- [ ] option A
- [ ] option B
- [x] option C (correct)
- [ ] option D
```

- [ ] **Step 18.2: Update `tsup.config.ts` to copy templates on build**

`packages/cli/tsup.config.ts`:
```ts
import { defineConfig } from 'tsup';
import { cpSync } from 'node:fs';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  sourcemap: true,
  target: 'node22',
  banner: { js: '#!/usr/bin/env node' },
  onSuccess: async () => {
    cpSync('templates', 'dist/templates', { recursive: true });
  },
});
```

- [ ] **Step 18.3: Write test**

`packages/cli/tests/commands/init.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runInit } from '../../src/commands/init.js';
import { mkdtempSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('estudeme init', () => {
  it('creates _templates folder with 5 templates', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      const r = await runInit({ vault: tmp });
      expect(r.exitCode).toBe(0);
      for (const t of ['trail', 'module', 'note', 'card', 'quiz']) {
        const p = path.join(tmp, '_templates', `${t}.md`);
        expect(existsSync(p)).toBe(true);
        expect(readFileSync(p, 'utf-8')).toContain(`type: ${t}`);
      }
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('creates a README explaining the structure', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      await runInit({ vault: tmp });
      expect(readFileSync(path.join(tmp, 'README.md'), 'utf-8')).toContain('EstudeMe');
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('does not overwrite existing files without --force', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      await runInit({ vault: tmp });
      const r2 = await runInit({ vault: tmp });
      expect(r2.output).toMatch(/already exists|skip/i);
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });
});
```

- [ ] **Step 18.4: Run test, expect failure**

Run: `npm run -w @estudeme/cli test -- init`
Expected: FAIL.

- [ ] **Step 18.5: Implement command**

`packages/cli/src/commands/init.ts`:
```ts
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveVaultPath } from '../lib/vault-loader.js';
import { c } from '../lib/format.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const TEMPLATE_NAMES = ['trail', 'module', 'note', 'card', 'quiz'];

export interface InitOptions { vault?: string; force?: boolean }
export interface CommandResult { exitCode: number; output: string }

const README = `# EstudeMe Vault

This vault was initialized by \`estudeme init\`.

## Structure

- \`_templates/\` — Templater templates for trail, module, note, card, quiz
- Other files are free — EstudeMe finds content by frontmatter, not folder

## Frontmatter

Every content \`.md\` file needs:

\`\`\`yaml
---
type: trail | module | note | card | quiz | exam | resource
title: "Title"
---
\`\`\`

See \`_templates/\` for examples of each type.

## Useful commands

- \`estudeme validate\` — validate frontmatter and wikilinks
- \`estudeme trail list\` — list trails with progress
- \`estudeme metrics show\` — study dashboard
`;

export async function runInit(opts: InitOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  await mkdir(vaultPath, { recursive: true });

  const lines: string[] = [];
  lines.push(c.dim(`Initializing vault at: ${vaultPath}`));

  const templatesDir = path.join(vaultPath, '_templates');
  await mkdir(templatesDir, { recursive: true });

  for (const name of TEMPLATE_NAMES) {
    const target = path.join(templatesDir, `${name}.md`);
    if ((await exists(target)) && !opts.force) {
      lines.push(c.dim(`  - _templates/${name}.md (already exists, skipped)`));
      continue;
    }
    const src = path.join(TEMPLATES_DIR, `${name}.md`);
    const content = await readFile(src, 'utf-8');
    await writeFile(target, content, 'utf-8');
    lines.push(c.ok(`  ✓ _templates/${name}.md`));
  }

  const readmePath = path.join(vaultPath, 'README.md');
  if ((await exists(readmePath)) && !opts.force) {
    lines.push(c.dim(`  - README.md (already exists, skipped)`));
  } else {
    await writeFile(readmePath, README, 'utf-8');
    lines.push(c.ok(`  ✓ README.md`));
  }

  lines.push('');
  lines.push(c.ok('Vault initialized.'));
  return { exitCode: 0, output: lines.join('\n') };
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 18.6: Register command**

Append to `packages/cli/src/index.ts`:
```ts
import { runInit } from './commands/init.js';

program
  .command('init')
  .description('Initialize an EstudeMe vault (creates _templates/ and README.md)')
  .option('-v, --vault <path>', 'vault path (default: cwd)')
  .option('-f, --force', 'overwrite existing files')
  .action(async (opts) => {
    const r = await runInit(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });
```

- [ ] **Step 18.7: Build and run tests**

```bash
npm run -w @estudeme/cli build
npm run -w @estudeme/cli test
```

Expected: build copies `templates/` to `dist/templates/`. Tests pass.

- [ ] **Step 18.8: Commit**

```bash
git add packages/cli/templates/ packages/cli/src/commands/init.ts packages/cli/src/index.ts packages/cli/tsup.config.ts packages/cli/tests/commands/init.test.ts
git commit -m "feat(cli): 'init' command with templates and README"
```

---

## Task 19: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yaml`

- [ ] **Step 19.1: Create workflow**

`.github/workflows/ci.yaml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
```

- [ ] **Step 19.2: Validate locally**

```bash
npm ci
npm run build
npm run typecheck
npm run lint
npm run test
```

Expected: everything passes.

- [ ] **Step 19.3: Commit**

```bash
git add .github/
git commit -m "ci: GitHub Actions workflow (build, typecheck, lint, test)"
```

---

## Task 20: E2E Validation Against the Real Vault

**Files:**
- Create: `docs/superpowers/notes/2026-04-14-phase-0-validation.md`

- [ ] **Step 20.1: Run `estudeme init` in a temporary folder**

```bash
mkdir -p /tmp/estudeme-test-vault
node packages/cli/dist/index.js init --vault /tmp/estudeme-test-vault
ls -la /tmp/estudeme-test-vault/_templates/
cat /tmp/estudeme-test-vault/README.md
```

Expected: folder created with 5 templates and README.

- [ ] **Step 20.2: Run `estudeme validate` against codex-technomanticus**

```bash
node packages/cli/dist/index.js validate --vault /home/josenaldo/repos/personal/codex-technomanticus 2>&1 | tee /tmp/validate-codex.log
```

Expected: list of errors/warnings. Record counts.

- [ ] **Step 20.3: Run `estudeme trail list`**

```bash
node packages/cli/dist/index.js trail list --vault /home/josenaldo/repos/personal/codex-technomanticus
```

Expected: list of trails with progress. May show 0% if current frontmatter lacks `type: trail`.

- [ ] **Step 20.4: Run `estudeme metrics show`**

```bash
node packages/cli/dist/index.js metrics show --vault /home/josenaldo/repos/personal/codex-technomanticus
```

Expected: dashboard with totals.

- [ ] **Step 20.5: Run `estudeme cards list` and `cards export`**

```bash
node packages/cli/dist/index.js cards list --vault /home/josenaldo/repos/personal/codex-technomanticus
node packages/cli/dist/index.js cards export --vault /home/josenaldo/repos/personal/codex-technomanticus --output /tmp/cards.json
cat /tmp/cards.json | head -30
```

- [ ] **Step 20.6: Document results**

Create `docs/superpowers/notes/2026-04-14-phase-0-validation.md` recording:
- Documents parsed
- Validation errors count
- Trails/notes/cards found
- Vault adjustments needed to fully benefit from EstudeMe
- Bugs found
- Next steps

- [ ] **Step 20.7: Final commit**

```bash
git add docs/superpowers/notes/
git commit -m "docs: phase 0 e2e validation against codex-technomanticus vault"
```

---

## Self-Review

**Spec coverage (Phase 0):**

| Spec requirement                                                    | Task(s)  |
| ------------------------------------------------------------------- | -------- |
| Monorepo TS + Turborepo                                             | 1, 2, 12 |
| Types: trail, module, note, card, quiz, exam, resource, performance | 3, 4     |
| Frontmatter parser                                                  | 5        |
| Wikilink parser                                                     | 6        |
| Document parser                                                     | 7        |
| Vault walker + index                                                | 8        |
| Schema + link validation                                            | 9        |
| Progress metrics                                                    | 10       |
| Anki export (neutral JSON)                                          | 11       |
| CLI: `init`                                                         | 18       |
| CLI: `validate`                                                     | 14       |
| CLI: `trail list/status`                                             | 15       |
| CLI: `cards list/export`                                            | 16       |
| CLI: `metrics show`                                                 | 17       |
| CI                                                                  | 19       |
| Validation against the real vault                                   | 20       |

**Out of scope (future phases):**

- Skills (Phase 1)
- FSRS spaced repetition (Phase 2)
- Interactive quizzes (Phase 2)
- Obsidian plugin (Phase 3)
- Site / Quartz (Phase 4)
- Marketplace / API (Phase 5)
- Native `.apkg` in TS
- `ingest` command (delegates to KB) — Phase 1

**Deliberate scope reductions:**

1. Anki `.apkg` via neutral JSON; `arcana` Python handles final `.apkg`.
2. `ingest` deferred to Phase 1 skills.
3. No `cards generate` (AI-driven) — Phase 1.
4. No `quiz run` (interactive) — Phase 2.

**Placeholder scan:** No TBD/TODO/FIXME. Every step has complete code.

**Type consistency:** `parseVault`, `validateVault`, `validateDocument`, `computeTrailProgress`, `computeAllTrailsProgress`, `extractCardsForExport`, `cardsToJSON` used consistently.

**Total:** 20 tasks, ~110 steps. Estimate: 8-12 days dedicated, or 3-4 weeks as a side project.

---

## Next Steps After Phase 0

1. Publish Phase 0 (release notes, CLI output)
2. Adapt codex-technomanticus vault to use EstudeMe frontmatter
3. Plan **Phase 1: Skills + User AI**
4. Consider publishing `@estudeme/core` and `@estudeme/cli` on npm
