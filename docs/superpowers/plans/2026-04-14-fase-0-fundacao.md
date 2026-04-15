# Fase 0 — Fundação (Core Lib + CLI) — Plano de Implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: Use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar este plano tarefa por tarefa. Steps usam sintaxe de checkbox (`- [ ]`) para tracking.

**Objetivo:** Construir a base do EstudeMe — monorepo TypeScript com core lib (parser, validação, métricas, export Anki) e CLI funcional (`init`, `validate`, `trail`, `cards`, `metrics`), validados contra o vault codex-technomanticus.

**Arquitetura:** Monorepo Turborepo com 2 packages: `@estudeme/core` (agnóstico, zero deps de Obsidian) e `@estudeme/cli` (Commander.js, usa core). Modelo de dados: Markdown + frontmatter YAML, índice por type. TDD em todos os módulos do core.

**Tech Stack:** TypeScript 5.x, Node.js 22+, Turborepo, tsup (bundler), Vitest (testes), Commander.js (CLI), gray-matter (frontmatter), js-yaml, ESLint, Prettier, GitHub Actions.

---

## Estrutura de Arquivos

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
│   │   │   ├── index.ts                     # exports públicos
│   │   │   ├── types/
│   │   │   │   ├── index.ts                 # re-exports
│   │   │   │   ├── base.ts                  # tipos compartilhados
│   │   │   │   ├── trail.ts
│   │   │   │   ├── module.ts
│   │   │   │   ├── note.ts
│   │   │   │   ├── card.ts
│   │   │   │   ├── quiz.ts
│   │   │   │   ├── exam.ts
│   │   │   │   ├── resource.ts
│   │   │   │   └── performance.ts
│   │   │   ├── parser/
│   │   │   │   ├── index.ts
│   │   │   │   ├── frontmatter.ts           # parse YAML frontmatter
│   │   │   │   ├── wikilinks.ts             # extract [[wikilinks]]
│   │   │   │   ├── document.ts              # parse 1 .md file
│   │   │   │   └── vault.ts                 # walk vault, build index
│   │   │   ├── validation/
│   │   │   │   ├── index.ts
│   │   │   │   ├── schemas.ts               # schemas por type
│   │   │   │   └── validate.ts              # validate documento
│   │   │   ├── metrics/
│   │   │   │   ├── index.ts
│   │   │   │   └── progress.ts              # progresso por trail/module
│   │   │   └── export/
│   │   │       ├── index.ts
│   │   │       └── anki.ts                  # export para .apkg
│   │   └── tests/
│   │       ├── fixtures/                    # vaults de teste
│   │       ├── parser/
│   │       ├── validation/
│   │       ├── metrics/
│   │       └── export/
│   │
│   └── cli/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── vitest.config.ts
│       ├── src/
│       │   ├── index.ts                     # entry point (#!/usr/bin/env node)
│       │   ├── commands/
│       │   │   ├── init.ts
│       │   │   ├── validate.ts
│       │   │   ├── trail.ts
│       │   │   ├── cards.ts
│       │   │   └── metrics.ts
│       │   └── lib/
│       │       ├── format.ts                # cores, tabelas terminal
│       │       └── vault-loader.ts          # encontra/carrega vault
│       ├── templates/                       # arquivos .md template para init
│       │   ├── trail.md
│       │   ├── module.md
│       │   ├── note.md
│       │   ├── card.md
│       │   └── quiz.md
│       └── tests/
│           └── commands/
│
└── docs/
    ├── superpowers/specs/
    │   └── 2026-04-14-estudeme-design.md    # já existe
    └── superpowers/plans/
        └── 2026-04-14-fase-0-fundacao.md    # este arquivo
```

---

## Tarefa 1: Setup do Monorepo

**Files:**
- Create: `package.json`, `turbo.json`, `tsconfig.base.json`, `.gitignore`, `.editorconfig`, `.prettierrc`, `eslint.config.js`, `README.md`

- [ ] **Step 1.1: Criar `.gitignore`**

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

- [ ] **Step 1.2: Criar `package.json` raiz**

```json
{
  "name": "estudeme",
  "version": "0.0.0",
  "private": true,
  "description": "Plataforma open-core de estudo autodidata",
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
  "engines": {
    "node": ">=22.0.0"
  }
}
```

- [ ] **Step 1.3: Criar `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 1.4: Criar `tsconfig.base.json`**

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

- [ ] **Step 1.5: Criar `.editorconfig`, `.prettierrc`, `eslint.config.js`**

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
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs['recommended'].rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.config.ts', '**/*.config.js'],
  },
];
```

- [ ] **Step 1.6: Criar `README.md` mínimo**

```markdown
# EstudeMe

Plataforma open-core de estudo autodidata. Vault Markdown + frontmatter como formato universal de dados.

## Status

Em desenvolvimento — Fase 0 (Fundação).

Veja o [design doc](docs/superpowers/specs/2026-04-14-estudeme-design.md).

## Licença

MIT
```

- [ ] **Step 1.7: Instalar dependências e commitar**

```bash
npm install
git add .
git commit -m "chore: setup monorepo Turborepo + TypeScript"
```

Expected: `npm install` cria `node_modules/` e `package-lock.json`. Sem erros.

---

## Tarefa 2: Setup do Package `@estudeme/core`

**Files:**
- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/tsup.config.ts`, `packages/core/vitest.config.ts`, `packages/core/src/index.ts`

- [ ] **Step 2.1: Criar `packages/core/package.json`**

```json
{
  "name": "@estudeme/core",
  "version": "0.0.0",
  "description": "Core library do EstudeMe — parser, validação, métricas",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
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

- [ ] **Step 2.2: Criar `packages/core/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "tests"]
}
```

- [ ] **Step 2.3: Criar `packages/core/tsup.config.ts`**

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

- [ ] **Step 2.4: Criar `packages/core/vitest.config.ts`**

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

- [ ] **Step 2.5: Criar `packages/core/src/index.ts` placeholder**

```ts
export const VERSION = '0.0.0';
```

- [ ] **Step 2.6: Instalar deps e validar build**

```bash
npm install
npm run -w @estudeme/core build
npm run -w @estudeme/core typecheck
```

Expected: build cria `packages/core/dist/index.js` e `index.d.ts`. typecheck passa.

- [ ] **Step 2.7: Commit**

```bash
git add packages/core/
git commit -m "chore(core): setup package @estudeme/core"
```

---

## Tarefa 3: Definir Tipos Base

**Files:**
- Create: `packages/core/src/types/base.ts`, `packages/core/src/types/index.ts`
- Test: `packages/core/tests/types/base.test.ts`

- [ ] **Step 3.1: Escrever teste para tipos base**

`packages/core/tests/types/base.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import type { DocumentType, Difficulty, Status, Wikilink } from '../../src/types/base.js';

describe('Tipos base', () => {
  it('aceita DocumentType valido', () => {
    const t: DocumentType = 'trail';
    expect(t).toBe('trail');
  });

  it('aceita Difficulty no range 1-5', () => {
    const d: Difficulty = 3;
    expect(d).toBeGreaterThanOrEqual(1);
    expect(d).toBeLessThanOrEqual(5);
  });

  it('Status aceita active/completed/paused/in-progress', () => {
    const s: Status = 'active';
    expect(['active', 'completed', 'paused', 'in-progress', 'not-started']).toContain(s);
  });

  it('Wikilink eh string com formato [[texto]]', () => {
    const w: Wikilink = '[[Java Backend]]';
    expect(w).toMatch(/^\[\[.+\]\]$/);
  });
});
```

- [ ] **Step 3.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- types/base`
Expected: FAIL — arquivo `base.ts` não existe.

- [ ] **Step 3.3: Implementar tipos base**

`packages/core/src/types/base.ts`:
```ts
/**
 * Tipos extensiveis — adicionar novos tipos sem mudar arquitetura.
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
  | string; // permite tipos custom

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Status =
  | 'active'
  | 'completed'
  | 'paused'
  | 'in-progress'
  | 'not-started';

export type Wikilink = string; // formato: "[[texto]]"

export interface BaseFrontmatter {
  type: DocumentType;
  title: string;
  tags?: string[];
  created?: string; // YYYY-MM-DD
  updated?: string;
}

export interface ParsedDocument<T extends BaseFrontmatter = BaseFrontmatter> {
  path: string;          // caminho absoluto
  relativePath: string;  // relativo ao vault root
  frontmatter: T;
  content: string;       // conteudo markdown sem frontmatter
  wikilinks: string[];   // links extraidos do conteudo
}
```

- [ ] **Step 3.4: Criar `packages/core/src/types/index.ts`**

```ts
export * from './base.js';
```

- [ ] **Step 3.5: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- types/base`
Expected: PASS (4 tests).

- [ ] **Step 3.6: Commit**

```bash
git add packages/core/src/types/ packages/core/tests/types/
git commit -m "feat(core): tipos base e ParsedDocument"
```

---

## Tarefa 4: Tipos Específicos (Trail, Module, Note, Card, Quiz, Exam, Resource, Performance)

**Files:**
- Create: `packages/core/src/types/{trail,module,note,card,quiz,exam,resource,performance}.ts`
- Modify: `packages/core/src/types/index.ts`
- Test: `packages/core/tests/types/specific.test.ts`

- [ ] **Step 4.1: Escrever teste para tipos específicos**

`packages/core/tests/types/specific.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import type {
  TrailFrontmatter,
  ModuleFrontmatter,
  NoteFrontmatter,
  CardFrontmatter,
  QuizFrontmatter,
  ExamFrontmatter,
  ResourceFrontmatter,
  PerformanceFrontmatter,
} from '../../src/types/index.js';

describe('Tipos especificos', () => {
  it('TrailFrontmatter tem type=trail e level', () => {
    const t: TrailFrontmatter = {
      type: 'trail',
      title: 'Java Backend',
      level: 'intermediate',
      status: 'active',
    };
    expect(t.type).toBe('trail');
    expect(t.level).toBe('intermediate');
  });

  it('CardFrontmatter tem card-type e source opcional', () => {
    const c: CardFrontmatter = {
      type: 'card',
      title: 'int vs Integer',
      'card-type': 'basic',
      trail: '[[Java Backend]]',
      difficulty: 2,
    };
    expect(c['card-type']).toBe('basic');
  });

  it('PerformanceFrontmatter tem activity e date', () => {
    const p: PerformanceFrontmatter = {
      type: 'performance',
      title: 'Review 2026-04-14',
      date: '2026-04-14',
      activity: 'card-review',
    };
    expect(p.activity).toBe('card-review');
  });
});
```

- [ ] **Step 4.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- types/specific`
Expected: FAIL — tipos não definidos.

- [ ] **Step 4.3: Implementar tipos**

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
  // FSRS state — adicionado em Fase 2
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
  'passing-score': number; // percentual 0-100
}
```

`packages/core/src/types/exam.ts`:
```ts
import type { BaseFrontmatter, Wikilink } from './base.js';

export interface ExamFrontmatter extends BaseFrontmatter {
  type: 'exam';
  trail?: Wikilink;
  questions: number;
  'time-limit': number; // minutos
  'passing-score': number;
}
```

`packages/core/src/types/resource.ts`:
```ts
import type { BaseFrontmatter, Wikilink } from './base.js';

export type ResourceType =
  | 'video'
  | 'book'
  | 'article'
  | 'course'
  | 'podcast'
  | 'paper'
  | 'documentation'
  | 'cheatsheet'
  | 'repo';

export type ResourceStatus =
  | 'to-consume'
  | 'in-progress'
  | 'consumed'
  | 'watched'
  | 'read';

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
  date: string; // YYYY-MM-DD
  trail?: Wikilink;
  module?: Wikilink;
  activity: Activity;
  score?: number;
  duration?: number; // segundos
}
```

- [ ] **Step 4.4: Atualizar `packages/core/src/types/index.ts`**

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

- [ ] **Step 4.5: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- types/`
Expected: PASS (todos os tests de tipos).

- [ ] **Step 4.6: Commit**

```bash
git add packages/core/src/types/ packages/core/tests/types/
git commit -m "feat(core): tipos especificos (trail, module, note, card, quiz, exam, resource, performance)"
```

---

## Tarefa 5: Parser de Frontmatter

**Files:**
- Create: `packages/core/src/parser/frontmatter.ts`
- Test: `packages/core/tests/parser/frontmatter.test.ts`

- [ ] **Step 5.1: Escrever teste**

`packages/core/tests/parser/frontmatter.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from '../../src/parser/frontmatter.js';

describe('parseFrontmatter', () => {
  it('extrai frontmatter YAML do markdown', () => {
    const input = `---
type: note
title: "Tipos Primitivos"
tags: [java, fundamentos]
---

# Conteudo

Texto da nota.`;

    const { data, content } = parseFrontmatter(input);
    expect(data.type).toBe('note');
    expect(data.title).toBe('Tipos Primitivos');
    expect(data.tags).toEqual(['java', 'fundamentos']);
    expect(content.trim()).toBe('# Conteudo\n\nTexto da nota.');
  });

  it('retorna data vazio quando nao ha frontmatter', () => {
    const input = '# Sem frontmatter\n\nApenas conteudo.';
    const { data, content } = parseFrontmatter(input);
    expect(data).toEqual({});
    expect(content.trim()).toBe('# Sem frontmatter\n\nApenas conteudo.');
  });

  it('lanca erro com YAML invalido', () => {
    const input = `---
type: note
title: "unclosed
---
content`;
    expect(() => parseFrontmatter(input)).toThrow();
  });
});
```

- [ ] **Step 5.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- parser/frontmatter`
Expected: FAIL — arquivo não existe.

- [ ] **Step 5.3: Implementar parser**

`packages/core/src/parser/frontmatter.ts`:
```ts
import matter from 'gray-matter';

export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const result = matter(raw, {
    engines: {
      yaml: {
        parse: (str: string) => {
          // gray-matter usa js-yaml por baixo; lanca em YAML invalido
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const yaml = require('js-yaml');
          return yaml.load(str, { schema: yaml.JSON_SCHEMA });
        },
        stringify: (obj: unknown) => {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const yaml = require('js-yaml');
          return yaml.dump(obj);
        },
      },
    },
  });
  return {
    data: result.data as Record<string, unknown>,
    content: result.content,
  };
}
```

Nota: `gray-matter` por padrão usa js-yaml e já lança em YAML inválido. A configuração explícita acima é defensiva. Se vier a causar problema com require em ESM, simplificar para `return matter(raw)` sem engines customizadas.

- [ ] **Step 5.4: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- parser/frontmatter`
Expected: PASS (3 tests).

- [ ] **Step 5.5: Commit**

```bash
git add packages/core/src/parser/frontmatter.ts packages/core/tests/parser/frontmatter.test.ts
git commit -m "feat(core): parser de frontmatter YAML"
```

---

## Tarefa 6: Extrator de Wikilinks

**Files:**
- Create: `packages/core/src/parser/wikilinks.ts`
- Test: `packages/core/tests/parser/wikilinks.test.ts`

- [ ] **Step 6.1: Escrever teste**

`packages/core/tests/parser/wikilinks.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { extractWikilinks, normalizeWikilink } from '../../src/parser/wikilinks.js';

describe('extractWikilinks', () => {
  it('extrai wikilinks simples', () => {
    const input = 'Veja [[Java Backend]] e [[Spring Boot]].';
    expect(extractWikilinks(input)).toEqual(['Java Backend', 'Spring Boot']);
  });

  it('extrai wikilinks com alias (pega target)', () => {
    const input = 'Veja [[Java Backend|backend java]].';
    expect(extractWikilinks(input)).toEqual(['Java Backend']);
  });

  it('extrai wikilinks com header (pega so o file)', () => {
    const input = 'Veja [[Java Backend#Spring]].';
    expect(extractWikilinks(input)).toEqual(['Java Backend']);
  });

  it('ignora codigo embedded (ainda assim extrai — escopo simples)', () => {
    // versao MVP: extrai tudo. Se virar problema, melhoramos.
    const input = '`[[nao-deveria]]` mas [[deveria]].';
    expect(extractWikilinks(input)).toContain('deveria');
  });

  it('retorna lista vazia quando nao ha wikilinks', () => {
    expect(extractWikilinks('Texto sem links.')).toEqual([]);
  });

  it('deduplica wikilinks', () => {
    const input = '[[Java]] e [[Java]] de novo.';
    expect(extractWikilinks(input)).toEqual(['Java']);
  });
});

describe('normalizeWikilink', () => {
  it('remove [[ ]] e retorna so o target', () => {
    expect(normalizeWikilink('[[Java Backend]]')).toBe('Java Backend');
    expect(normalizeWikilink('[[Java|alias]]')).toBe('Java');
    expect(normalizeWikilink('[[Java#header]]')).toBe('Java');
  });

  it('retorna entrada como-esta se ja for normalizada', () => {
    expect(normalizeWikilink('Java Backend')).toBe('Java Backend');
  });
});
```

- [ ] **Step 6.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- parser/wikilinks`
Expected: FAIL.

- [ ] **Step 6.3: Implementar extrator**

`packages/core/src/parser/wikilinks.ts`:
```ts
const WIKILINK_REGEX = /\[\[([^\]]+)\]\]/g;

/**
 * Extrai targets de wikilinks no formato [[target]], [[target|alias]] ou [[target#header]].
 * Retorna lista deduplicada, preservando ordem da primeira ocorrencia.
 */
export function extractWikilinks(content: string): string[] {
  const matches = content.matchAll(WIKILINK_REGEX);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const match of matches) {
    const inner = match[1];
    const target = inner.split('|')[0].split('#')[0].trim();
    if (target && !seen.has(target)) {
      seen.add(target);
      result.push(target);
    }
  }

  return result;
}

/**
 * Normaliza um wikilink, removendo [[ ]], alias e headers.
 * Aceita "[[X]]", "[[X|alias]]", "[[X#h]]" ou apenas "X".
 */
export function normalizeWikilink(link: string): string {
  const stripped = link.replace(/^\[\[|\]\]$/g, '');
  return stripped.split('|')[0].split('#')[0].trim();
}
```

- [ ] **Step 6.4: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- parser/wikilinks`
Expected: PASS.

- [ ] **Step 6.5: Commit**

```bash
git add packages/core/src/parser/wikilinks.ts packages/core/tests/parser/wikilinks.test.ts
git commit -m "feat(core): extrator de wikilinks"
```

---

## Tarefa 7: Parser de Documento

**Files:**
- Create: `packages/core/src/parser/document.ts`
- Test: `packages/core/tests/parser/document.test.ts`

- [ ] **Step 7.1: Escrever teste**

`packages/core/tests/parser/document.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseDocument } from '../../src/parser/document.js';

describe('parseDocument', () => {
  it('combina frontmatter + wikilinks num ParsedDocument', () => {
    const raw = `---
type: note
title: "Spring Boot"
trail: "[[Java Backend]]"
---

Spring Boot facilita [[Dependency Injection]].`;

    const doc = parseDocument(raw, '/vault/Spring Boot.md', 'Spring Boot.md');

    expect(doc.path).toBe('/vault/Spring Boot.md');
    expect(doc.relativePath).toBe('Spring Boot.md');
    expect(doc.frontmatter.type).toBe('note');
    expect(doc.frontmatter.title).toBe('Spring Boot');
    expect(doc.wikilinks).toContain('Java Backend');
    expect(doc.wikilinks).toContain('Dependency Injection');
    expect(doc.content).toContain('Spring Boot facilita');
  });

  it('extrai wikilinks tambem do frontmatter (campo trail/module/source)', () => {
    const raw = `---
type: card
title: "DI explicada"
trail: "[[Java Backend]]"
module: "[[Spring Boot]]"
source: "[[DI Concepts]]"
---

Conteudo sem wikilinks.`;

    const doc = parseDocument(raw, '/v/c.md', 'c.md');
    expect(doc.wikilinks).toEqual(
      expect.arrayContaining(['Java Backend', 'Spring Boot', 'DI Concepts'])
    );
  });

  it('lanca erro se faltar campo type', () => {
    const raw = `---
title: "Sem tipo"
---

content`;
    expect(() => parseDocument(raw, '/v/x.md', 'x.md')).toThrow(/type/i);
  });

  it('lanca erro se faltar campo title', () => {
    const raw = `---
type: note
---

content`;
    expect(() => parseDocument(raw, '/v/y.md', 'y.md')).toThrow(/title/i);
  });
});
```

- [ ] **Step 7.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- parser/document`
Expected: FAIL.

- [ ] **Step 7.3: Implementar parser de documento**

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
    throw new Error(`Frontmatter sem campo 'type' em ${relativePath}`);
  }
  if (!data.title) {
    throw new Error(`Frontmatter sem campo 'title' em ${relativePath}`);
  }

  const contentLinks = extractWikilinks(content);
  const fmLinks = extractWikilinksFromFrontmatter(data);

  const allLinks = Array.from(new Set([...fmLinks, ...contentLinks]));

  return {
    path: absolutePath,
    relativePath,
    frontmatter: data as unknown as BaseFrontmatter,
    content,
    wikilinks: allLinks,
  };
}

function extractWikilinksFromFrontmatter(data: Record<string, unknown>): string[] {
  const links: string[] = [];
  for (const field of WIKILINK_FRONTMATTER_FIELDS) {
    const value = data[field];
    if (typeof value === 'string') {
      const normalized = normalizeWikilink(value);
      if (normalized && normalized !== value.replace(/^\[\[|\]\]$/g, '').split('|')[0]) {
        // valor jah era simples
      }
      if (normalized) links.push(normalized);
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

- [ ] **Step 7.4: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- parser/document`
Expected: PASS.

- [ ] **Step 7.5: Commit**

```bash
git add packages/core/src/parser/document.ts packages/core/tests/parser/document.test.ts
git commit -m "feat(core): parser de documento (frontmatter + wikilinks)"
```

---

## Tarefa 8: Vault Walker e Index

**Files:**
- Create: `packages/core/src/parser/vault.ts`
- Create: `packages/core/tests/fixtures/sample-vault/` (vault de teste com 5-6 arquivos .md)
- Test: `packages/core/tests/parser/vault.test.ts`

- [ ] **Step 8.1: Criar fixture de vault de teste**

`packages/core/tests/fixtures/sample-vault/Trilha Java.md`:
```markdown
---
type: trail
title: "Trilha Java"
description: "Aprender Java do zero"
level: beginner
status: active
---

Trilha de Java.
```

`packages/core/tests/fixtures/sample-vault/Modulo 1.md`:
```markdown
---
type: module
title: "Fundamentos"
trail: "[[Trilha Java]]"
order: 1
status: in-progress
---

Modulo de fundamentos.
```

`packages/core/tests/fixtures/sample-vault/notes/Tipos Primitivos.md`:
```markdown
---
type: note
title: "Tipos Primitivos"
trail: "[[Trilha Java]]"
module: "[[Modulo 1]]"
difficulty: 1
---

Java tem 8 tipos primitivos.
```

`packages/core/tests/fixtures/sample-vault/cards/card-001.md`:
```markdown
---
type: card
title: "Tipos primitivos"
card-type: basic
trail: "[[Trilha Java]]"
module: "[[Modulo 1]]"
source: "[[Tipos Primitivos]]"
difficulty: 1
---

## Frente
Quantos tipos primitivos Java tem?

## Verso
8.
```

`packages/core/tests/fixtures/sample-vault/_invalid/no-type.md`:
```markdown
---
title: "Sem type"
---

Documento invalido.
```

`packages/core/tests/fixtures/sample-vault/.obsidian/config.json`:
```json
{}
```

- [ ] **Step 8.2: Escrever teste**

`packages/core/tests/parser/vault.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseVault } from '../../src/parser/vault.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../fixtures/sample-vault');

describe('parseVault', () => {
  it('encontra todos os .md validos', async () => {
    const result = await parseVault(VAULT);
    const titles = result.documents.map((d) => d.frontmatter.title);
    expect(titles).toContain('Trilha Java');
    expect(titles).toContain('Fundamentos');
    expect(titles).toContain('Tipos Primitivos');
    expect(titles).toContain('Tipos primitivos'); // o card
  });

  it('ignora pastas .obsidian e arquivos nao-markdown', async () => {
    const result = await parseVault(VAULT);
    const paths = result.documents.map((d) => d.relativePath);
    expect(paths.every((p) => !p.includes('.obsidian'))).toBe(true);
  });

  it('coleta documentos invalidos em result.errors', async () => {
    const result = await parseVault(VAULT);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].path).toContain('no-type');
  });

  it('indexa por type', async () => {
    const result = await parseVault(VAULT);
    expect(result.byType.trail.length).toBe(1);
    expect(result.byType.module.length).toBe(1);
    expect(result.byType.note.length).toBe(1);
    expect(result.byType.card.length).toBe(1);
  });

  it('indexa por title', async () => {
    const result = await parseVault(VAULT);
    expect(result.byTitle.get('Trilha Java')).toBeDefined();
    expect(result.byTitle.get('Trilha Java')?.frontmatter.type).toBe('trail');
  });
});
```

- [ ] **Step 8.3: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- parser/vault`
Expected: FAIL.

- [ ] **Step 8.4: Implementar vault walker**

`packages/core/src/parser/vault.ts`:
```ts
import { readdir, readFile, stat } from 'node:fs/promises';
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

const IGNORED_DIRS = new Set([
  '.obsidian',
  '.git',
  'node_modules',
  '.trash',
  '.DS_Store',
]);

export async function parseVault(root: string): Promise<VaultIndex> {
  const documents: ParsedDocument[] = [];
  const errors: VaultParseError[] = [];
  const files = await walkMarkdownFiles(root);

  for (const file of files) {
    const relativePath = path.relative(root, file);
    try {
      const raw = await readFile(file, 'utf-8');
      const doc = parseDocument(raw, file, relativePath);
      documents.push(doc);
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
      const sub = await walkMarkdownFiles(path.join(dir, entry.name));
      result.push(...sub);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(path.join(dir, entry.name));
    }
  }

  return result;
}
```

- [ ] **Step 8.5: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- parser/vault`
Expected: PASS (5 tests).

- [ ] **Step 8.6: Atualizar index do parser e do core**

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
git commit -m "feat(core): vault walker e index por type/title"
```

---

## Tarefa 9: Validação

**Files:**
- Create: `packages/core/src/validation/schemas.ts`, `packages/core/src/validation/validate.ts`, `packages/core/src/validation/index.ts`
- Test: `packages/core/tests/validation/validate.test.ts`

- [ ] **Step 9.1: Escrever teste**

`packages/core/tests/validation/validate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { validateDocument, validateVault } from '../../src/validation/index.js';
import { parseVault } from '../../src/parser/index.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../tests/fixtures/sample-vault');

describe('validateDocument', () => {
  it('aprova trail valida', () => {
    const doc = {
      path: '/v/t.md',
      relativePath: 't.md',
      frontmatter: {
        type: 'trail',
        title: 'Java',
        level: 'beginner',
        status: 'active',
      },
      content: '',
      wikilinks: [],
    } as const;
    const issues = validateDocument(doc);
    expect(issues).toEqual([]);
  });

  it('reporta trail sem level', () => {
    const doc = {
      path: '/v/t.md',
      relativePath: 't.md',
      frontmatter: { type: 'trail', title: 'Java', status: 'active' },
      content: '',
      wikilinks: [],
    } as any;
    const issues = validateDocument(doc);
    expect(issues.some((i) => i.field === 'level')).toBe(true);
  });

  it('reporta module sem trail', () => {
    const doc = {
      path: '/v/m.md',
      relativePath: 'm.md',
      frontmatter: { type: 'module', title: 'X', order: 1, status: 'active' },
      content: '',
      wikilinks: [],
    } as any;
    const issues = validateDocument(doc);
    expect(issues.some((i) => i.field === 'trail')).toBe(true);
  });
});

describe('validateVault', () => {
  it('detecta wikilinks quebrados', async () => {
    const idx = await parseVault(VAULT);
    const result = validateVault(idx);
    // sample-vault tem links que existem; nao deveria ter broken
    expect(result.brokenLinks).toEqual([]);
  });

  it('inclui erros de parse', async () => {
    const idx = await parseVault(VAULT);
    const result = validateVault(idx);
    expect(result.parseErrors.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 9.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- validation`
Expected: FAIL.

- [ ] **Step 9.3: Implementar schemas e validação**

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
    // tipo customizado, sem schema — apenas warning
    return [
      {
        path: doc.relativePath,
        field: 'type',
        message: `Tipo customizado '${doc.frontmatter.type}' sem schema definido (ok, mas nao validado)`,
        severity: 'warning',
      },
    ];
  }

  const issues: ValidationIssue[] = [];
  const fm = doc.frontmatter as Record<string, unknown>;

  for (const [field, fieldSchema] of Object.entries(schema.fields)) {
    const value = fm[field];
    const issue = validateField(doc.relativePath, field, value, fieldSchema);
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
      return {
        path,
        field,
        message: `Campo obrigatorio '${field}' ausente`,
        severity: 'error',
      };
    }
    return null;
  }

  if (schema.type === 'string' && typeof value !== 'string') {
    return { path, field, message: `Campo '${field}' deve ser string`, severity: 'error' };
  }
  if (schema.type === 'number' && typeof value !== 'number') {
    return { path, field, message: `Campo '${field}' deve ser numero`, severity: 'error' };
  }
  if (schema.type === 'array' && !Array.isArray(value)) {
    return { path, field, message: `Campo '${field}' deve ser array`, severity: 'error' };
  }
  if (schema.type === 'wikilink' && typeof value !== 'string') {
    return { path, field, message: `Campo '${field}' deve ser wikilink string`, severity: 'error' };
  }
  if (schema.enum && typeof value === 'string' && !schema.enum.includes(value)) {
    return {
      path,
      field,
      message: `Campo '${field}' valor '${value}' nao esta em [${schema.enum.join(', ')}]`,
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

  return {
    documentIssues,
    brokenLinks,
    parseErrors: index.errors,
  };
}
```

`packages/core/src/validation/index.ts`:
```ts
export * from './schemas.js';
export * from './validate.js';
```

- [ ] **Step 9.4: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- validation`
Expected: PASS.

- [ ] **Step 9.5: Atualizar index do core**

Adicionar em `packages/core/src/index.ts`:
```ts
export * from './validation/index.js';
```

- [ ] **Step 9.6: Commit**

```bash
git add packages/core/src/validation/ packages/core/src/index.ts packages/core/tests/validation/
git commit -m "feat(core): validacao de schema e wikilinks quebrados"
```

---

## Tarefa 10: Métricas — Progresso por Trilha/Módulo

**Files:**
- Create: `packages/core/src/metrics/progress.ts`, `packages/core/src/metrics/index.ts`
- Test: `packages/core/tests/metrics/progress.test.ts`

- [ ] **Step 10.1: Escrever teste**

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
  it('calcula progresso de uma trilha (modulos completados / total)', async () => {
    const idx = await parseVault(VAULT);
    const trail = idx.byTitle.get('Trilha Java')!;
    const progress = computeTrailProgress(trail, idx);

    expect(progress.title).toBe('Trilha Java');
    expect(progress.totalModules).toBe(1);
    expect(progress.completedModules).toBe(0);
    expect(progress.inProgressModules).toBe(1);
    expect(progress.percentComplete).toBe(0);
    expect(progress.notes).toBe(1);
    expect(progress.cards).toBe(1);
  });

  it('considera modulos com status completed', async () => {
    const idx = await parseVault(VAULT);
    // simula modulo completado
    const trail = idx.byTitle.get('Trilha Java')!;
    const mod = idx.byTitle.get('Fundamentos')!;
    (mod.frontmatter as any).status = 'completed';

    const progress = computeTrailProgress(trail, idx);
    expect(progress.completedModules).toBe(1);
    expect(progress.percentComplete).toBe(100);
  });
});

describe('computeAllTrailsProgress', () => {
  it('retorna progresso de todas as trilhas', async () => {
    const idx = await parseVault(VAULT);
    const all = computeAllTrailsProgress(idx);
    expect(all.length).toBe(1);
    expect(all[0].title).toBe('Trilha Java');
  });
});
```

- [ ] **Step 10.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- metrics`
Expected: FAIL.

- [ ] **Step 10.3: Implementar métricas**

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
  const percentComplete = totalModules === 0 ? 0 : Math.round((completedModules / totalModules) * 100);

  const notes = countByTrail(index.byType.note ?? [], trailTitle);
  const cards = countByTrail(index.byType.card ?? [], trailTitle);
  const quizzes = countByTrail(index.byType.quiz ?? [], trailTitle);

  return {
    title: trailTitle,
    totalModules,
    completedModules,
    inProgressModules,
    notStartedModules,
    percentComplete,
    notes,
    cards,
    quizzes,
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

- [ ] **Step 10.4: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- metrics`
Expected: PASS.

- [ ] **Step 10.5: Atualizar index do core**

Adicionar em `packages/core/src/index.ts`:
```ts
export * from './metrics/index.js';
```

- [ ] **Step 10.6: Commit**

```bash
git add packages/core/src/metrics/ packages/core/src/index.ts packages/core/tests/metrics/
git commit -m "feat(core): metricas de progresso por trilha"
```

---

## Tarefa 11: Export Anki — Estratégia Inicial via Subprocess

**Decisão:** Para a Fase 0, evitar reimplementar geração de `.apkg` em TypeScript. Em vez disso, o `core` define a interface de export e gera um arquivo intermediário JSON; a CLI delega para o `arcana` Python existente quando disponível, ou apenas exporta JSON/CSV se não.

**Files:**
- Create: `packages/core/src/export/anki.ts`, `packages/core/src/export/index.ts`
- Test: `packages/core/tests/export/anki.test.ts`

- [ ] **Step 11.1: Escrever teste**

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
  it('extrai cards do vault em formato neutro', async () => {
    const idx = await parseVault(VAULT);
    const cards = extractCardsForExport(idx);

    expect(cards.length).toBe(1);
    expect(cards[0].cardType).toBe('basic');
    expect(cards[0].front).toContain('Quantos tipos primitivos');
    expect(cards[0].back).toContain('8');
    expect(cards[0].trail).toBe('Trilha Java');
    expect(cards[0].module).toBe('Modulo 1');
  });

  it('separa Frente/Verso pelo cabecalho ## Frente / ## Verso', async () => {
    const idx = await parseVault(VAULT);
    const cards = extractCardsForExport(idx);
    expect(cards[0].front.trim()).not.toContain('## Verso');
  });
});

describe('cardsToJSON', () => {
  it('serializa cards em JSON estruturado', async () => {
    const idx = await parseVault(VAULT);
    const cards = extractCardsForExport(idx);
    const json = cardsToJSON(cards);
    const parsed = JSON.parse(json);

    expect(parsed.version).toBe(1);
    expect(parsed.cards).toHaveLength(1);
    expect(parsed.cards[0].front).toContain('Quantos');
  });
});
```

- [ ] **Step 11.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/core test -- export`
Expected: FAIL.

- [ ] **Step 11.3: Implementar export**

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

const FRONT_HEADER = /^##\s+Frente\s*$/im;
const BACK_HEADER = /^##\s+Verso\s*$/im;

export function extractCardsForExport(index: VaultIndex): CardForExport[] {
  const cards = index.byType.card ?? [];
  return cards.map((doc) => extractCard(doc));
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
    {
      version: 1,
      generatedAt: new Date().toISOString(),
      cards,
    },
    null,
    2,
  );
}
```

`packages/core/src/export/index.ts`:
```ts
export * from './anki.js';
```

- [ ] **Step 11.4: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/core test -- export`
Expected: PASS.

- [ ] **Step 11.5: Atualizar index do core**

Adicionar em `packages/core/src/index.ts`:
```ts
export * from './export/index.js';
```

- [ ] **Step 11.6: Commit**

```bash
git add packages/core/src/export/ packages/core/src/index.ts packages/core/tests/export/
git commit -m "feat(core): extracao de cards para export (JSON neutro)"
```

---

## Tarefa 12: Setup do Package `@estudeme/cli`

**Files:**
- Create: `packages/cli/package.json`, `packages/cli/tsconfig.json`, `packages/cli/tsup.config.ts`, `packages/cli/vitest.config.ts`, `packages/cli/src/index.ts`

- [ ] **Step 12.1: Criar `packages/cli/package.json`**

```json
{
  "name": "@estudeme/cli",
  "version": "0.0.0",
  "description": "CLI do EstudeMe",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "estudeme": "./dist/index.js"
  },
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

- [ ] **Step 12.2: Criar `packages/cli/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "tests"],
  "references": [{ "path": "../core" }]
}
```

- [ ] **Step 12.3: Criar `packages/cli/tsup.config.ts`**

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

- [ ] **Step 12.4: Criar `packages/cli/vitest.config.ts`**

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

- [ ] **Step 12.5: Criar `packages/cli/src/index.ts` placeholder**

```ts
import { Command } from 'commander';

const program = new Command();
program
  .name('estudeme')
  .description('Plataforma open-core de estudo autodidata')
  .version('0.0.0');

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 12.6: Instalar deps e validar build**

```bash
npm install
npm run -w @estudeme/cli build
node packages/cli/dist/index.js --help
```

Expected: build OK, `--help` mostra usage.

- [ ] **Step 12.7: Commit**

```bash
git add packages/cli/
git commit -m "chore(cli): setup package @estudeme/cli"
```

---

## Tarefa 13: Helper de Carregamento de Vault

**Files:**
- Create: `packages/cli/src/lib/vault-loader.ts`, `packages/cli/src/lib/format.ts`
- Test: `packages/cli/tests/lib/vault-loader.test.ts`

- [ ] **Step 13.1: Escrever teste**

`packages/cli/tests/lib/vault-loader.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { resolveVaultPath } from '../../src/lib/vault-loader.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('resolveVaultPath', () => {
  it('aceita caminho absoluto', () => {
    const abs = '/tmp/vault';
    expect(resolveVaultPath(abs)).toBe(abs);
  });

  it('resolve caminho relativo a partir do cwd', () => {
    const rel = './my-vault';
    const resolved = resolveVaultPath(rel);
    expect(path.isAbsolute(resolved)).toBe(true);
  });

  it('retorna cwd quando vault path nao informado', () => {
    expect(resolveVaultPath()).toBe(process.cwd());
  });
});
```

- [ ] **Step 13.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/cli test -- vault-loader`
Expected: FAIL.

- [ ] **Step 13.3: Implementar helpers**

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
    throw new Error(`Vault nao encontrado: ${vaultPath}`);
  }
  if (!statSync(vaultPath).isDirectory()) {
    throw new Error(`Vault path deve ser um diretorio: ${vaultPath}`);
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
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
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

- [ ] **Step 13.4: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/cli test -- vault-loader`
Expected: PASS.

- [ ] **Step 13.5: Commit**

```bash
git add packages/cli/src/lib/ packages/cli/tests/lib/
git commit -m "feat(cli): helpers de vault-loader e format"
```

---

## Tarefa 14: Comando `estudeme validate`

**Files:**
- Create: `packages/cli/src/commands/validate.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/commands/validate.test.ts`

- [ ] **Step 14.1: Escrever teste**

`packages/cli/tests/commands/validate.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runValidate } from '../../src/commands/validate.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme validate', () => {
  it('retorna exit code 1 quando ha erros', async () => {
    const result = await runValidate({ vault: VAULT });
    expect(result.exitCode).toBe(1);
    expect(result.output).toContain('no-type');
  });

  it('lista erros de parse e validacao', async () => {
    const result = await runValidate({ vault: VAULT });
    expect(result.output).toMatch(/erro|invalid|sem campo/i);
  });
});
```

- [ ] **Step 14.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/cli test -- validate`
Expected: FAIL.

- [ ] **Step 14.3: Implementar comando**

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
    lines.push(c.bold('Erros de parse:'));
    for (const e of result.parseErrors) {
      lines.push(`  ${c.err('✗')} ${e.path}: ${e.error}`);
      hasError = true;
    }
    lines.push('');
  }

  const errors = result.documentIssues.filter((i) => i.severity === 'error');
  const warnings = result.documentIssues.filter((i) => i.severity === 'warning');

  if (errors.length > 0) {
    lines.push(c.bold(`Erros de validacao (${errors.length}):`));
    for (const i of errors) {
      lines.push(`  ${c.err('✗')} ${i.path} [${i.field}]: ${i.message}`);
      hasError = true;
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(c.bold(`Avisos (${warnings.length}):`));
    for (const i of warnings) {
      lines.push(`  ${c.warn('⚠')} ${i.path} [${i.field}]: ${i.message}`);
    }
    lines.push('');
  }

  if (result.brokenLinks.length > 0) {
    lines.push(c.bold(`Wikilinks quebrados (${result.brokenLinks.length}):`));
    for (const b of result.brokenLinks) {
      lines.push(`  ${c.err('✗')} ${b.path}: [[${b.link}]]`);
      hasError = true;
    }
    lines.push('');
  }

  lines.push(
    `${c.dim('Resumo:')} ${idx.documents.length} documentos, ${errors.length} erros, ${warnings.length} avisos, ${result.brokenLinks.length} links quebrados`,
  );

  const output = lines.join('\n');
  return { exitCode: hasError ? 1 : 0, output };
}
```

- [ ] **Step 14.4: Registrar comando no `index.ts`**

`packages/cli/src/index.ts`:
```ts
import { Command } from 'commander';
import { runValidate } from './commands/validate.js';

const program = new Command();
program
  .name('estudeme')
  .description('Plataforma open-core de estudo autodidata')
  .version('0.0.0');

program
  .command('validate')
  .description('Valida frontmatter, schemas e wikilinks do vault')
  .option('-v, --vault <path>', 'caminho do vault (default: cwd)')
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

- [ ] **Step 14.5: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/cli test -- validate`
Expected: PASS.

- [ ] **Step 14.6: Smoke test contra o vault real**

```bash
npm run -w @estudeme/core build
npm run -w @estudeme/cli build
node packages/cli/dist/index.js validate --vault /home/josenaldo/repos/personal/codex-technomanticus
```

Expected: lista erros/avisos do vault real (esperado ter alguns).

- [ ] **Step 14.7: Commit**

```bash
git add packages/cli/src/commands/validate.ts packages/cli/src/index.ts packages/cli/tests/commands/validate.test.ts
git commit -m "feat(cli): comando 'validate'"
```

---

## Tarefa 15: Comando `estudeme trail list/status`

**Files:**
- Create: `packages/cli/src/commands/trail.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/commands/trail.test.ts`

- [ ] **Step 15.1: Escrever teste**

`packages/cli/tests/commands/trail.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runTrailList, runTrailStatus } from '../../src/commands/trail.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme trail list', () => {
  it('lista todas as trilhas com progresso', async () => {
    const r = await runTrailList({ vault: VAULT });
    expect(r.output).toContain('Trilha Java');
    expect(r.output).toMatch(/0%/);
  });
});

describe('estudeme trail status', () => {
  it('mostra status detalhado de uma trilha', async () => {
    const r = await runTrailStatus({ vault: VAULT, trail: 'Trilha Java' });
    expect(r.output).toContain('Trilha Java');
    expect(r.output).toContain('Modulos');
    expect(r.output).toContain('Notas');
    expect(r.output).toContain('Cards');
  });

  it('retorna erro quando trilha nao existe', async () => {
    const r = await runTrailStatus({ vault: VAULT, trail: 'Inexistente' });
    expect(r.exitCode).toBe(1);
    expect(r.output).toMatch(/nao encontrada/i);
  });
});
```

- [ ] **Step 15.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/cli test -- trail`
Expected: FAIL.

- [ ] **Step 15.3: Implementar comando**

`packages/cli/src/commands/trail.ts`:
```ts
import { parseVault, computeAllTrailsProgress, computeTrailProgress } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, table, progressBar } from '../lib/format.js';

export interface TrailListOptions {
  vault?: string;
}

export interface TrailStatusOptions {
  vault?: string;
  trail: string;
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

export async function runTrailList(opts: TrailListOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  const all = computeAllTrailsProgress(idx);

  if (all.length === 0) {
    return { exitCode: 0, output: c.dim('Nenhuma trilha encontrada.') };
  }

  const rows = all.map((p) => [
    p.title,
    `${progressBar(p.percentComplete, 15)} ${p.percentComplete}%`,
    `${p.completedModules}/${p.totalModules}`,
    String(p.notes),
    String(p.cards),
  ]);

  const out = table(['Trilha', 'Progresso', 'Modulos', 'Notas', 'Cards'], rows);
  return { exitCode: 0, output: out };
}

export async function runTrailStatus(opts: TrailStatusOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  const trail = idx.byTitle.get(opts.trail);

  if (!trail || trail.frontmatter.type !== 'trail') {
    return { exitCode: 1, output: c.err(`Trilha nao encontrada: ${opts.trail}`) };
  }

  const p = computeTrailProgress(trail, idx);

  const lines = [
    c.bold(`📋 ${p.title}`),
    '',
    `Progresso: ${progressBar(p.percentComplete, 30)} ${p.percentComplete}%`,
    '',
    `${c.dim('Modulos:')}     ${p.completedModules} completos | ${p.inProgressModules} em progresso | ${p.notStartedModules} nao iniciados`,
    `${c.dim('Notas:')}       ${p.notes}`,
    `${c.dim('Cards:')}       ${p.cards}`,
    `${c.dim('Quizzes:')}     ${p.quizzes}`,
  ];

  return { exitCode: 0, output: lines.join('\n') };
}
```

- [ ] **Step 15.4: Registrar comando no `index.ts`**

Adicionar em `packages/cli/src/index.ts` antes do `program.parseAsync`:
```ts
import { runTrailList, runTrailStatus } from './commands/trail.js';

const trail = program.command('trail').description('Gerencia trilhas de estudo');

trail
  .command('list')
  .description('Lista todas as trilhas com progresso')
  .option('-v, --vault <path>', 'caminho do vault')
  .action(async (opts) => {
    const r = await runTrailList(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });

trail
  .command('status <trail>')
  .description('Mostra status detalhado de uma trilha')
  .option('-v, --vault <path>', 'caminho do vault')
  .action(async (trailName, opts) => {
    const r = await runTrailStatus({ ...opts, trail: trailName });
    console.log(r.output);
    process.exit(r.exitCode);
  });
```

- [ ] **Step 15.5: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/cli test -- trail`
Expected: PASS.

- [ ] **Step 15.6: Commit**

```bash
git add packages/cli/src/commands/trail.ts packages/cli/src/index.ts packages/cli/tests/commands/trail.test.ts
git commit -m "feat(cli): comandos 'trail list' e 'trail status'"
```

---

## Tarefa 16: Comando `estudeme cards list/export`

**Files:**
- Create: `packages/cli/src/commands/cards.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/commands/cards.test.ts`

- [ ] **Step 16.1: Escrever teste**

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
  it('lista cards com filtros opcionais', async () => {
    const r = await runCardsList({ vault: VAULT });
    expect(r.output).toContain('1 card');
  });

  it('filtra por trilha', async () => {
    const r = await runCardsList({ vault: VAULT, trail: 'Trilha Java' });
    expect(r.output).toContain('1 card');
  });
});

describe('estudeme cards export', () => {
  it('exporta cards para JSON', async () => {
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

- [ ] **Step 16.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/cli test -- cards`
Expected: FAIL.

- [ ] **Step 16.3: Implementar comando**

`packages/cli/src/commands/cards.ts`:
```ts
import { parseVault, extractCardsForExport, cardsToJSON } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, table } from '../lib/format.js';
import { writeFile } from 'node:fs/promises';

export interface CardsListOptions {
  vault?: string;
  trail?: string;
  module?: string;
}

export interface CardsExportOptions {
  vault?: string;
  output: string;
  format: 'json' | 'apkg';
  trail?: string;
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

export async function runCardsList(opts: CardsListOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  let cards = extractCardsForExport(idx);

  if (opts.trail) cards = cards.filter((c) => c.trail === opts.trail);
  if (opts.module) cards = cards.filter((c) => c.module === opts.module);

  if (cards.length === 0) {
    return { exitCode: 0, output: c.dim('Nenhum card encontrado.') };
  }

  const rows = cards.map((card) => [
    card.id,
    card.cardType,
    card.trail ?? '-',
    card.module ?? '-',
    card.front.slice(0, 50) + (card.front.length > 50 ? '...' : ''),
  ]);

  const t = table(['ID', 'Tipo', 'Trilha', 'Modulo', 'Frente'], rows);
  return {
    exitCode: 0,
    output: `${t}\n${c.dim(`${cards.length} card(s)`)}`,
  };
}

export async function runCardsExport(opts: CardsExportOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  assertVaultExists(vaultPath);

  const idx = await parseVault(vaultPath);
  let cards = extractCardsForExport(idx);
  if (opts.trail) cards = cards.filter((c) => c.trail === opts.trail);

  if (opts.format === 'json') {
    await writeFile(opts.output, cardsToJSON(cards), 'utf-8');
    return {
      exitCode: 0,
      output: c.ok(`✓ ${cards.length} cards exportados para ${opts.output}`),
    };
  }

  if (opts.format === 'apkg') {
    return {
      exitCode: 1,
      output: c.warn(
        'Export .apkg em Fase 0: use `arcana` (Python) com o JSON gerado por --format json. Suporte nativo virara em fase posterior.',
      ),
    };
  }

  return { exitCode: 1, output: c.err(`Formato desconhecido: ${opts.format}`) };
}
```

- [ ] **Step 16.4: Registrar comando**

Adicionar em `packages/cli/src/index.ts`:
```ts
import { runCardsList, runCardsExport } from './commands/cards.js';

const cards = program.command('cards').description('Gerencia flashcards');

cards
  .command('list')
  .description('Lista cards do vault com filtros opcionais')
  .option('-v, --vault <path>', 'caminho do vault')
  .option('-t, --trail <name>', 'filtra por trilha')
  .option('-m, --module <name>', 'filtra por modulo')
  .action(async (opts) => {
    const r = await runCardsList(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });

cards
  .command('export')
  .description('Exporta cards (json ou apkg)')
  .requiredOption('-o, --output <path>', 'arquivo de saida')
  .option('-f, --format <format>', 'json | apkg', 'json')
  .option('-v, --vault <path>', 'caminho do vault')
  .option('-t, --trail <name>', 'filtra por trilha')
  .action(async (opts) => {
    const r = await runCardsExport(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });
```

- [ ] **Step 16.5: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/cli test -- cards`
Expected: PASS.

- [ ] **Step 16.6: Commit**

```bash
git add packages/cli/src/commands/cards.ts packages/cli/src/index.ts packages/cli/tests/commands/cards.test.ts
git commit -m "feat(cli): comandos 'cards list' e 'cards export'"
```

---

## Tarefa 17: Comando `estudeme metrics show`

**Files:**
- Create: `packages/cli/src/commands/metrics.ts`
- Modify: `packages/cli/src/index.ts`
- Test: `packages/cli/tests/commands/metrics.test.ts`

- [ ] **Step 17.1: Escrever teste**

`packages/cli/tests/commands/metrics.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runMetricsShow } from '../../src/commands/metrics.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VAULT = path.resolve(__dirname, '../../../core/tests/fixtures/sample-vault');

describe('estudeme metrics show', () => {
  it('mostra dashboard com totais por tipo', async () => {
    const r = await runMetricsShow({ vault: VAULT });
    expect(r.output).toContain('Trilhas');
    expect(r.output).toContain('Modulos');
    expect(r.output).toContain('Notas');
    expect(r.output).toContain('Cards');
  });

  it('inclui progresso de cada trilha', async () => {
    const r = await runMetricsShow({ vault: VAULT });
    expect(r.output).toContain('Trilha Java');
  });
});
```

- [ ] **Step 17.2: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/cli test -- metrics`
Expected: FAIL.

- [ ] **Step 17.3: Implementar comando**

`packages/cli/src/commands/metrics.ts`:
```ts
import { parseVault, computeAllTrailsProgress } from '@estudeme/core';
import { resolveVaultPath, assertVaultExists } from '../lib/vault-loader.js';
import { c, progressBar } from '../lib/format.js';

export interface MetricsShowOptions {
  vault?: string;
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

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
  lines.push(c.bold('📊 Dashboard EstudeMe'));
  lines.push(c.dim(`Vault: ${vaultPath}`));
  lines.push('');
  lines.push(c.bold('Totais'));
  lines.push(`  ${c.dim('Trilhas:')}   ${totals.trails}`);
  lines.push(`  ${c.dim('Modulos:')}   ${totals.modules}`);
  lines.push(`  ${c.dim('Notas:')}     ${totals.notes}`);
  lines.push(`  ${c.dim('Cards:')}     ${totals.cards}`);
  lines.push(`  ${c.dim('Quizzes:')}   ${totals.quizzes}`);
  lines.push(`  ${c.dim('Exames:')}    ${totals.exams}`);
  lines.push(`  ${c.dim('Recursos:')}  ${totals.resources}`);
  lines.push('');

  if (all.length > 0) {
    lines.push(c.bold('Trilhas'));
    for (const p of all) {
      lines.push(
        `  ${p.title.padEnd(30)} ${progressBar(p.percentComplete, 20)} ${String(p.percentComplete).padStart(3)}%`,
      );
    }
  }

  return { exitCode: 0, output: lines.join('\n') };
}
```

- [ ] **Step 17.4: Registrar comando**

Adicionar em `packages/cli/src/index.ts`:
```ts
import { runMetricsShow } from './commands/metrics.js';

const metrics = program.command('metrics').description('Mostra metricas de estudo');

metrics
  .command('show')
  .description('Dashboard com totais e progresso por trilha')
  .option('-v, --vault <path>', 'caminho do vault')
  .action(async (opts) => {
    const r = await runMetricsShow(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });
```

- [ ] **Step 17.5: Rodar teste, esperar pass**

Run: `npm run -w @estudeme/cli test -- metrics`
Expected: PASS.

- [ ] **Step 17.6: Commit**

```bash
git add packages/cli/src/commands/metrics.ts packages/cli/src/index.ts packages/cli/tests/commands/metrics.test.ts
git commit -m "feat(cli): comando 'metrics show'"
```

---

## Tarefa 18: Templates e Comando `estudeme init`

**Files:**
- Create: `packages/cli/templates/{trail,module,note,card,quiz}.md`
- Create: `packages/cli/src/commands/init.ts`
- Modify: `packages/cli/src/index.ts`, `packages/cli/tsup.config.ts` (copy templates)
- Test: `packages/cli/tests/commands/init.test.ts`

- [ ] **Step 18.1: Criar templates**

`packages/cli/templates/trail.md`:
```markdown
---
type: trail
title: "<%* tR += await tp.system.prompt('Titulo da trilha') %>"
description: ""
level: beginner
prerequisites: []
tags: []
status: active
created: <% tp.date.now('YYYY-MM-DD') %>
---

## Objetivo

<descricao da trilha>

## Modulos

- 
```

`packages/cli/templates/module.md`:
```markdown
---
type: module
title: "<%* tR += await tp.system.prompt('Titulo do modulo') %>"
trail: "[[<%* tR += await tp.system.prompt('Trilha') %>]]"
order: 1
status: not-started
---

## Conteudo

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
title: "<%* tR += await tp.system.prompt('Titulo do card') %>"
card-type: basic
trail: ""
module: ""
source: ""
difficulty: 2
---

## Frente

<pergunta>

## Verso

<resposta>
```

`packages/cli/templates/quiz.md`:
```markdown
---
type: quiz
title: "<%* tR += await tp.system.prompt('Titulo do quiz') %>"
trail: ""
module: ""
questions: 5
passing-score: 70
---

## Q1

<pergunta>

- [ ] opcao A
- [ ] opcao B
- [x] opcao C (correta)
- [ ] opcao D
```

- [ ] **Step 18.2: Atualizar `tsup.config.ts` para copiar templates no build**

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

- [ ] **Step 18.3: Escrever teste**

`packages/cli/tests/commands/init.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { runInit } from '../../src/commands/init.js';
import { mkdtempSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

describe('estudeme init', () => {
  it('cria pasta _templates com 5 templates', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      const r = await runInit({ vault: tmp });
      expect(r.exitCode).toBe(0);

      const tpls = ['trail', 'module', 'note', 'card', 'quiz'];
      for (const t of tpls) {
        const p = path.join(tmp, '_templates', `${t}.md`);
        expect(existsSync(p)).toBe(true);
        expect(readFileSync(p, 'utf-8')).toContain(`type: ${t}`);
      }
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('cria README explicando estrutura', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      await runInit({ vault: tmp });
      const readme = path.join(tmp, 'README.md');
      expect(existsSync(readme)).toBe(true);
      expect(readFileSync(readme, 'utf-8')).toContain('EstudeMe');
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });

  it('nao sobrescreve arquivos existentes sem --force', async () => {
    const tmp = mkdtempSync(path.join(tmpdir(), 'estudeme-init-'));
    try {
      await runInit({ vault: tmp });
      const r2 = await runInit({ vault: tmp });
      expect(r2.output).toMatch(/ja existe|skip/i);
    } finally {
      rmSync(tmp, { recursive: true });
    }
  });
});
```

- [ ] **Step 18.4: Rodar teste, esperar falha**

Run: `npm run -w @estudeme/cli test -- init`
Expected: FAIL.

- [ ] **Step 18.5: Implementar comando**

`packages/cli/src/commands/init.ts`:
```ts
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveVaultPath } from '../lib/vault-loader.js';
import { c } from '../lib/format.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// templates copiados para dist/templates pelo tsup
const TEMPLATES_DIR = path.resolve(__dirname, '../templates');
const TEMPLATE_NAMES = ['trail', 'module', 'note', 'card', 'quiz'];

export interface InitOptions {
  vault?: string;
  force?: boolean;
}

export interface CommandResult {
  exitCode: number;
  output: string;
}

const README = `# Vault EstudeMe

Este vault foi inicializado pelo \`estudeme init\`.

## Estrutura

- \`_templates/\` — templates Templater para criar trail, module, note, card, quiz
- demais arquivos sao livres — o EstudeMe encontra conteudo por frontmatter, nao por pasta

## Frontmatter

Todo arquivo .md de conteudo precisa de:

\`\`\`yaml
---
type: trail | module | note | card | quiz | exam | resource
title: "Titulo"
---
\`\`\`

Veja \`_templates/\` para exemplos de cada tipo.

## Comandos uteis

- \`estudeme validate\` — valida frontmatter e wikilinks
- \`estudeme trail list\` — lista trilhas com progresso
- \`estudeme metrics show\` — dashboard de estudo
`;

export async function runInit(opts: InitOptions): Promise<CommandResult> {
  const vaultPath = resolveVaultPath(opts.vault);
  await mkdir(vaultPath, { recursive: true });

  const lines: string[] = [];
  lines.push(c.dim(`Inicializando vault em: ${vaultPath}`));

  const templatesDir = path.join(vaultPath, '_templates');
  await mkdir(templatesDir, { recursive: true });

  for (const name of TEMPLATE_NAMES) {
    const target = path.join(templatesDir, `${name}.md`);
    if (await exists(target) && !opts.force) {
      lines.push(c.dim(`  - _templates/${name}.md (ja existe, skip)`));
      continue;
    }
    const src = path.join(TEMPLATES_DIR, `${name}.md`);
    const content = await readFile(src, 'utf-8');
    await writeFile(target, content, 'utf-8');
    lines.push(c.ok(`  ✓ _templates/${name}.md`));
  }

  const readmePath = path.join(vaultPath, 'README.md');
  if (await exists(readmePath) && !opts.force) {
    lines.push(c.dim(`  - README.md (ja existe, skip)`));
  } else {
    await writeFile(readmePath, README, 'utf-8');
    lines.push(c.ok(`  ✓ README.md`));
  }

  lines.push('');
  lines.push(c.ok('Vault inicializado.'));
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

- [ ] **Step 18.6: Registrar comando**

Adicionar em `packages/cli/src/index.ts`:
```ts
import { runInit } from './commands/init.js';

program
  .command('init')
  .description('Inicializa um vault EstudeMe (cria _templates/ e README.md)')
  .option('-v, --vault <path>', 'caminho do vault (default: cwd)')
  .option('-f, --force', 'sobrescreve arquivos existentes')
  .action(async (opts) => {
    const r = await runInit(opts);
    console.log(r.output);
    process.exit(r.exitCode);
  });
```

- [ ] **Step 18.7: Build e rodar testes**

```bash
npm run -w @estudeme/cli build
npm run -w @estudeme/cli test
```

Expected: build copia `templates/` para `dist/templates/`. Tests passam.

- [ ] **Step 18.8: Commit**

```bash
git add packages/cli/templates/ packages/cli/src/commands/init.ts packages/cli/src/index.ts packages/cli/tsup.config.ts packages/cli/tests/commands/init.test.ts
git commit -m "feat(cli): comando 'init' com templates e README"
```

---

## Tarefa 19: CI no GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yaml`

- [ ] **Step 19.1: Criar workflow**

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

- [ ] **Step 19.2: Validar localmente que todos os scripts passam**

```bash
npm ci
npm run build
npm run typecheck
npm run lint
npm run test
```

Expected: tudo passa.

- [ ] **Step 19.3: Commit**

```bash
git add .github/
git commit -m "ci: workflow GitHub Actions (build, typecheck, lint, test)"
```

---

## Tarefa 20: Validação E2E contra Vault Real

**Files:**
- Create: `docs/superpowers/notes/2026-04-14-fase-0-validacao.md` (notas de validação)

- [ ] **Step 20.1: Rodar `estudeme init` em pasta temporária**

```bash
mkdir -p /tmp/estudeme-test-vault
node packages/cli/dist/index.js init --vault /tmp/estudeme-test-vault
ls -la /tmp/estudeme-test-vault/_templates/
cat /tmp/estudeme-test-vault/README.md
```

Expected: pasta criada com 5 templates e README.

- [ ] **Step 20.2: Rodar `estudeme validate` no vault codex-technomanticus**

```bash
node packages/cli/dist/index.js validate --vault /home/josenaldo/repos/personal/codex-technomanticus 2>&1 | tee /tmp/validate-codex.log
```

Esperado: lista de erros/avisos. Anotar quantidade.

- [ ] **Step 20.3: Rodar `estudeme trail list` no vault codex-technomanticus**

```bash
node packages/cli/dist/index.js trail list --vault /home/josenaldo/repos/personal/codex-technomanticus
```

Esperado: lista de trilhas (Trilha Java, Backend, etc.) com progresso. Pode ter 0% se o frontmatter atual não tem `type: trail` — anotar isso como follow-up.

- [ ] **Step 20.4: Rodar `estudeme metrics show`**

```bash
node packages/cli/dist/index.js metrics show --vault /home/josenaldo/repos/personal/codex-technomanticus
```

Esperado: dashboard com totais.

- [ ] **Step 20.5: Rodar `estudeme cards list` e `cards export`**

```bash
node packages/cli/dist/index.js cards list --vault /home/josenaldo/repos/personal/codex-technomanticus
node packages/cli/dist/index.js cards export --vault /home/josenaldo/repos/personal/codex-technomanticus --output /tmp/cards.json
cat /tmp/cards.json | head -30
```

Esperado: lista pode ser vazia se vault atual não tem `type: card` — anotar como follow-up.

- [ ] **Step 20.6: Documentar resultados**

`docs/superpowers/notes/2026-04-14-fase-0-validacao.md`:

Anotar:
- Quantos documentos parsed
- Quantos erros de validação
- Quantas trilhas/notas/cards encontrados
- Quais ajustes precisam no vault para aproveitar 100%
- Bugs encontrados
- Próximos passos

- [ ] **Step 20.7: Commit final da Fase 0**

```bash
git add docs/superpowers/notes/
git commit -m "docs: validacao e2e da Fase 0 contra vault codex-technomanticus"
```

---

## Auto-Revisão do Plano

**Cobertura do spec (Fase 0):**

| Requisito do spec | Tarefa(s) |
|-------------------|-----------|
| Monorepo TS + Turborepo | 1, 2, 12 |
| Tipos: trail, module, note, card, quiz, exam, resource, performance | 3, 4 |
| Parser de frontmatter | 5 |
| Parser de wikilinks | 6 |
| Parser de documento | 7 |
| Vault walker + index | 8 |
| Validação de schemas + links | 9 |
| Métricas de progresso | 10 |
| Export Anki (estratégia inicial: JSON neutro) | 11 |
| CLI: `init` | 18 |
| CLI: `validate` | 14 |
| CLI: `trail list/status` | 15 |
| CLI: `cards list/export` | 16 |
| CLI: `metrics show` | 17 |
| CI | 19 |
| Validação contra vault real | 20 |

**Fora de escopo (futuras fases):**
- Skills (Fase 1)
- Revisão espaçada FSRS (Fase 2)
- Quizzes interativos (Fase 2)
- Plugin Obsidian (Fase 3)
- Site/Quartz (Fase 4)
- Marketplace/API (Fase 5)
- `.apkg` nativo em TS (avaliar Fase 2 ou delegar ao arcana indefinidamente)
- Comando `ingest` (delega para KB) — adicionado em fase futura

**Decisões deliberadas para reduzir escopo:**

1. **Anki .apkg via JSON intermediário.** Em vez de portar genanki para JS, geramos JSON neutro. Quem quiser .apkg usa o arcana Python passando esse JSON. Fase posterior pode adicionar suporte nativo.
2. **Comando `ingest` postergado.** Delegação para KB vem na Fase 1 junto com as skills.
3. **Sem comando `cards generate`.** Geração de cards via IA é Fase 1 (skills).
4. **Sem comando `quiz generate/run`.** Quiz interativo é Fase 2.

**Verificação de placeholders:** Nenhum TBD/TODO/FIXME no plano. Todos os steps têm código completo.

**Consistência de tipos:** Nomes de funções (`parseVault`, `validateVault`, `validateDocument`, `computeTrailProgress`, `computeAllTrailsProgress`, `extractCardsForExport`, `cardsToJSON`) usados consistentemente entre tarefas.

**Total:** 20 tarefas, ~110 steps. Estimativa: 8-12 dias de trabalho dedicado, ou 3-4 semanas em ritmo de side project.

---

## Próximos Passos Após Conclusão da Fase 0

1. Documentar Fase 0 entregue (release notes, screenshots de output da CLI)
2. Adaptar vault codex-technomanticus para usar frontmatter EstudeMe (adicionar `type: trail` nas trilhas, etc.)
3. Iniciar planejamento da **Fase 1: Skills + IA do Usuário**
4. Considerar publicar `@estudeme/core` e `@estudeme/cli` no npm como `estudeme-core` e `estudeme-cli` (ou pacote único `estudeme`)
