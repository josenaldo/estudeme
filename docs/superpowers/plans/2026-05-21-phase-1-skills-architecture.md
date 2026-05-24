# Phase 1 — Skills Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the agent skills layer described in the design spec — three-layer context architecture, six micro-skills, one meta-skill, and an `estudeme skills install` CLI command — so AI agents (Claude Code, Gemini CLI, Copilot, Codex) can operate EstudeMe via natural language.

**Architecture:** `AGENTS.md` is the universal source of truth. Tool-specific files (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`) reference it. Skills live in `.agents/skills/<name>/SKILL.md` and are reached by Claude Code and Copilot via symlinks (`.claude/skills/` and `.github/skills/`). The CLI bundles the same skills tree and an `estudeme skills install` command copies it into a user's vault plus creates the symlinks.

**Tech Stack:** TypeScript 5, Node.js 22+, Commander.js, Vitest, gray-matter (for parsing skill frontmatter in tests), Markdown SKILL.md files.

**Spec reference:** `docs/superpowers/specs/2026-05-19-skills-architecture-design.md`
**ADR reference:** `docs/decisions/0002-skills-architecture.md`

---

## Branch

Continue on the existing `feat/skills-architecture-design` branch (where the spec and ADR were committed in commit `6b00aff`). When the implementation is complete, open a single PR to `main` covering the foundation, all skills, the install command, and the E2E test — or split into PRs at task boundaries if review load matters. The recommendation below assumes one branch with multiple commits, one PR at the end.

## Implementation order

Recapping section 8 of the spec:

1. ✅ **Design and ADR** — already committed.
2. **Foundation setup** — Task 1 of this plan.
3. **Trail micro-skills** — Task 2.
4. **Card micro-skills** — Task 3.
5. **Validation and metrics micro-skills** — Task 4.
6. **Meta-skill (`review-vault-state`)** — Task 5.
7. **Distribution (`estudeme skills install`)** — Task 6.
8. **End-to-end agent workflow test** — Task 7.

Tasks 2, 3, and 4 are independent — they can be developed in parallel if a subagent flow allows it.

## File map

| Path                                                  | Action                                  | Owner task |
| ----------------------------------------------------- | --------------------------------------- | ---------- |
| `AGENTS.md`                                           | Create                                  | Task 1     |
| `CLAUDE.md`                                           | Modify (refactor, slim down)            | Task 1     |
| `GEMINI.md`                                           | Create                                  | Task 1     |
| `.github/copilot-instructions.md`                     | Create                                  | Task 1     |
| `.agents/skills/.gitkeep`                             | Create                                  | Task 1     |
| `.claude/skills`                                      | Create symlink → `../.agents/skills`    | Task 1     |
| `.github/skills`                                      | Create symlink → `../.agents/skills`    | Task 1     |
| `.gitignore`                                          | Modify (add `packages/cli/skills/`)     | Task 1     |
| `ARCHITECTURE.md`                                     | Modify (link ADR-0002, reflect layout)  | Task 1     |
| `packages/cli/package.json`                           | Modify (add `gray-matter` dep, files)   | Task 1     |
| `packages/cli/tests/skills/catalog.test.ts`           | Create (catalog shape validation)       | Task 1     |
| `.agents/skills/list-trails/SKILL.md`                 | Create                                  | Task 2     |
| `.agents/skills/inspect-trail/SKILL.md`               | Create                                  | Task 2     |
| `.agents/skills/list-cards/SKILL.md`                  | Create                                  | Task 3     |
| `.agents/skills/export-cards/SKILL.md`                | Create                                  | Task 3     |
| `.agents/skills/validate-vault/SKILL.md`              | Create                                  | Task 4     |
| `.agents/skills/report-metrics/SKILL.md`              | Create                                  | Task 4     |
| `.agents/skills/review-vault-state/SKILL.md`          | Create                                  | Task 5     |
| `packages/cli/src/commands/skills.ts`                 | Create                                  | Task 6     |
| `packages/cli/src/lib/skills-installer.ts`            | Create                                  | Task 6     |
| `packages/cli/src/index.ts`                           | Modify (register `skills` command)      | Task 6     |
| `packages/cli/tests/commands/skills.test.ts`          | Create                                  | Task 6     |
| `packages/cli/tests/lib/skills-installer.test.ts`     | Create                                  | Task 6     |
| `packages/cli/scripts/copy-skills.mjs`                | Create (prebuild copy)                  | Task 6     |
| `packages/cli/tsup.config.ts`                         | Modify (optional, asset handling)       | Task 6     |
| `README.md`                                           | Modify (document `skills install`)      | Task 6     |
| `CHANGELOG.md`                                        | Modify (Unreleased entry)               | Task 6     |
| `docs/status/2026-MM-DD-phase-1-agent-walkthrough.md` | Create (E2E walkthrough)                | Task 7     |

---

## Task 1: Foundation setup

**Files:**
- Create: `AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.agents/skills/.gitkeep`, `packages/cli/tests/skills/catalog.test.ts`
- Modify: `CLAUDE.md`, `.gitignore`, `ARCHITECTURE.md`, `packages/cli/package.json`
- Symlinks: `.claude/skills/` and `.github/skills/`

### Step 1.1: Create `AGENTS.md`

- [ ] Create the file with this content (target: under 60 lines):

```markdown
# AGENTS.md — EstudeMe

Open-core self-directed learning platform. TypeScript monorepo:
`@estudeme/core` (agnostic library) + `@estudeme/cli` (Commander.js).

## Architecture

- `packages/core/`: vault parser, validation, metrics, export. Zero Obsidian dependencies.
- `packages/cli/`: stable CLI contract for terminals and AI agents.
- Vault (the user's Markdown + YAML frontmatter) is the source of truth.

## Critical Rules

- NEVER sign commits with `Co-Authored-By: Claude` or any AI-assistant signature.
- ALWAYS use Conventional Commits in English (`feat(scope): ...`, `fix(scope): ...`).
- ALWAYS write user-facing documentation in English. PT-BR is fine in conversation only.
- ALWAYS follow TDD in `packages/core` and `packages/cli`.
- NEVER add abstractions, features, or refactoring beyond the task at hand.
- ALWAYS update `CHANGELOG.md` (Unreleased section) on user-facing changes.
- NEVER commit secrets or `.env` files.

## Skills

Procedural knowledge at `.agents/skills/`. Loaded on demand.

**Micro-skills:** `list-trails`, `inspect-trail`, `list-cards`, `export-cards`,
`validate-vault`, `report-metrics`.

**Meta-skill:** `review-vault-state` (orchestrates validate + trails + metrics).

## Tool-specific files

- `CLAUDE.md` — Claude Code
- `GEMINI.md` — Gemini CLI
- `.github/copilot-instructions.md` — GitHub Copilot

## References

- `README.md` — project overview
- `ARCHITECTURE.md` — system design (including agent-native rationale)
- `docs/decisions/` — Architecture Decision Records
- `docs/context/` — strategic premises driving product decisions

## Fallback

If a referenced file is missing, report it briefly, use the best available
alternative, and log the assumptions you made.
```

### Step 1.2: Refactor `CLAUDE.md`

- [ ] Replace the current content with this slim version (target: under 25 lines, currently around 25 lines of mixed rules):

```markdown
# CLAUDE.md — EstudeMe (for Claude Code)

See `AGENTS.md` for universal rules, architecture, critical rules, and the skill catalog. This file adds only Claude Code specifics.

## Commands

- `npm run build` — build all packages via Turborepo
- `npm run test` — Vitest, all packages
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`

## Skills

Loaded from `.claude/skills/`, which symlinks to `.agents/skills/`. See `AGENTS.md` for the catalog.

## Conversation language

Conversation with the user may be in Portuguese (PT-BR). Code, identifiers,
file content, and commit messages are always in English.

## References

- Spec: `docs/superpowers/specs/2026-04-14-estudeme-design.md`
- Plans: `docs/superpowers/plans/`
```

### Step 1.3: Create `GEMINI.md`

- [ ] Create with this content (target: under 10 lines):

```markdown
# GEMINI.md — EstudeMe (for Gemini CLI)

See `AGENTS.md` for universal rules, architecture, and the skill catalog.

Skills live at `.agents/skills/` (read natively by Gemini CLI). Each skill is
a directory with a `SKILL.md`.

Conversation with the user may be in Portuguese; code and commits are in English.
```

### Step 1.4: Create `.github/copilot-instructions.md`

- [ ] Create with this content (target: under 15 lines):

```markdown
# Copilot Instructions — EstudeMe

Primary context source: `AGENTS.md` at the repository root. Read it for project
identity, architecture, and critical rules.

## Skills

Loaded from `.github/skills/`, which symlinks to `.agents/skills/`. The catalog
is in `AGENTS.md`.

## Notes

- This repository is a TypeScript monorepo (Turborepo). Product code lives in
  `packages/core/` and `packages/cli/`.
- All user-facing documentation is in English. Commits follow Conventional Commits.
- See `CONTRIBUTING.md` for the dev workflow.
```

### Step 1.5: Create the `.agents/skills/` directory and the symlinks

- [ ] Create the directory and a `.gitkeep` so git tracks it while empty:

```bash
mkdir -p .agents/skills
touch .agents/skills/.gitkeep
```

- [ ] Create the symlinks:

```bash
mkdir -p .claude .github
cd .claude && ln -s ../.agents/skills skills && cd ..
cd .github && ln -s ../.agents/skills skills && cd ..
```

- [ ] Verify the symlinks resolve:

```bash
ls -la .claude/skills .github/skills
# Each should show: skills -> ../.agents/skills
```

### Step 1.6: Update `.gitignore`

- [ ] Append to `.gitignore`:

```
# Skills bundled into the CLI package at build time. Canonical source is .agents/skills/.
packages/cli/skills/
```

### Step 1.7: Update `ARCHITECTURE.md`

- [ ] In the `## Agent-native design` section, replace the placeholder paragraph about "planned for Phase 1" with a paragraph that references the concrete layout and ADR-0002. Find this passage:

```markdown
The skills layer is planned for Phase 1. The universal and tool-specific layers exist today.
```

- [ ] Replace with:

```markdown
The skills layer is implemented as of Phase 1. The canonical location is `.agents/skills/`, with each skill in its own directory containing a `SKILL.md`. Claude Code and Copilot reach the skills through symlinks (`.claude/skills/` and `.github/skills/`), while Gemini CLI, OpenAI Codex, and Cursor read the canonical path natively. The full design is recorded in [ADR-0002](docs/decisions/0002-skills-architecture.md) and [its design spec](docs/superpowers/specs/2026-05-19-skills-architecture-design.md).
```

### Step 1.8: Add `gray-matter` dev dependency to `@estudeme/cli`

The catalog validation test parses YAML frontmatter from each `SKILL.md`. `gray-matter` is already a runtime dependency in `@estudeme/core`. We add it to `@estudeme/cli` as a dev dependency for tests.

- [ ] In `packages/cli/package.json`, add to `devDependencies`:

```json
"gray-matter": "^4.0.3"
```

- [ ] Run `npm install` from the repo root to update the lockfile.

### Step 1.9: Write the catalog shape validation test

- [ ] Create `packages/cli/tests/skills/catalog.test.ts` with this content:

```typescript
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const skillsDir = join(__dirname, '../../../../.agents/skills');

const skillDirs = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe('Skill catalog shape', () => {
  it('has at least one skill', () => {
    expect(skillDirs.length).toBeGreaterThan(0);
  });

  describe.each(skillDirs)('skill: %s', (skillName) => {
    const skillPath = join(skillsDir, skillName, 'SKILL.md');

    it('has a SKILL.md file', () => {
      expect(statSync(skillPath).isFile()).toBe(true);
    });

    it('has required frontmatter (name, description)', () => {
      const content = readFileSync(skillPath, 'utf-8');
      const parsed = matter(content);

      expect(parsed.data.name).toBe(skillName);
      expect(parsed.data.description).toBeDefined();
      expect(typeof parsed.data.description).toBe('string');
      expect(parsed.data.description.length).toBeGreaterThan(0);
      expect(parsed.data.description.length).toBeLessThan(1024);
      expect(parsed.data.description).not.toMatch(/[<>]/);
    });

    it('has the required body sections', () => {
      const content = readFileSync(skillPath, 'utf-8');
      const parsed = matter(content);
      const body = parsed.content;

      expect(body).toMatch(/^# Skill:/m);

      const isMeta = skillName === 'review-vault-state';
      if (isMeta) {
        expect(body).toMatch(/^## Quando usar/m);
        expect(body).toMatch(/^## Workflow/m);
      } else {
        expect(body).toMatch(/^## Instructions/m);
        expect(body).toMatch(/^## Critical/m);
        expect(body).toMatch(/^## Examples/m);
        expect(body).toMatch(/^## Troubleshooting/m);
      }
    });
  });
});
```

### Step 1.10: Run the catalog test (should pass with zero skills, fail meaningfully when skills exist)

- [ ] Run: `cd packages/cli && npx vitest run tests/skills/catalog.test.ts`
- [ ] Expected: **FAIL** with "has at least one skill" (because `.agents/skills/` is empty except `.gitkeep`). This confirms the test wires up correctly.

The test will turn green as skills are added in subsequent tasks. The `expect(skillDirs.length).toBeGreaterThan(0)` is intentional — it forces the catalog to be non-empty before merge.

### Step 1.11: Update GitHub issues to reflect the new design

The Phase 1 issues created earlier need reorganization to match the design.

- [ ] Close issue #10 (`estudeme-trail skill`) with this comment:

```
Superseded by ADR-0002. The trail skill becomes two atomic micro-skills
(`list-trails` and `inspect-trail`) per the new naming convention. See the
new tracking issue for trail micro-skills.
```

- [ ] Close issue #11 (`estudeme-cards skill`) similarly:

```
Superseded by ADR-0002. The cards skill becomes two atomic micro-skills
(`list-cards` and `export-cards`) per the new naming convention.
```

- [ ] Create the following new Phase 1 issues with the `phase-1` and appropriate area labels (`skills`, `cli`, `docs`):

  - **Trail micro-skills (`list-trails`, `inspect-trail`)** — labels: `phase-1`, `skills`. References Task 2 of this plan.
  - **Card micro-skills (`list-cards`, `export-cards`)** — labels: `phase-1`, `skills`. References Task 3.
  - **Validation and metrics micro-skills (`validate-vault`, `report-metrics`)** — labels: `phase-1`, `skills`. References Task 4.
  - **Meta-skill (`review-vault-state`)** — labels: `phase-1`, `skills`. References Task 5.
  - **Distribution: `estudeme skills install` command + bundle** — labels: `phase-1`, `skills`, `cli`. References Task 6.

Each new issue body should reference this plan path and the corresponding task number. Issue #12 (E2E test) stays open and will be closed by Task 7.

### Step 1.12: Commit the foundation in coherent chunks

Three commits keep the history clean:

- [ ] Commit A — instruction files (anti-duplication architecture):

```bash
git add AGENTS.md CLAUDE.md GEMINI.md .github/copilot-instructions.md
git commit -m "docs: AGENTS.md + L2 tool-specific files (three-layer context)"
```

- [ ] Commit B — skills directory scaffold and symlinks:

```bash
git add .agents .claude/skills .github/skills .gitignore
git commit -m "chore: scaffold .agents/skills with symlinks for Claude Code and Copilot"
```

- [ ] Commit C — ARCHITECTURE update + catalog test + gray-matter dep:

```bash
git add ARCHITECTURE.md packages/cli/package.json packages/cli/tests/skills/catalog.test.ts package-lock.json
git commit -m "test(cli): add skill catalog shape validation + update ARCHITECTURE for ADR-0002"
```

---

## Task 2: Trail micro-skills

**Files:**
- Create: `.agents/skills/list-trails/SKILL.md`, `.agents/skills/inspect-trail/SKILL.md`

### Step 2.1: Write `list-trails`

- [ ] Create `.agents/skills/list-trails/SKILL.md` with this content:

````markdown
---
name: list-trails
description: "Lists all trails (learning tracks) in an EstudeMe vault. Use when the user asks 'what trails do I have', 'list my trails', 'show me my trails', or wants an overview of their learning tracks. Don't use for progress detail on a specific trail — use inspect-trail."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: List Trails

## Instructions

### Step 1: Confirm the vault path

- [ ] If the user has not stated the vault path, ask for it. The vault is a
      directory of Markdown notes with EstudeMe frontmatter.
- [ ] Verify the directory exists. If not, surface the error and stop.

### Step 2: Run the CLI

- [ ] Execute: `estudeme trail list <vault-path>`
- [ ] Capture stdout and the exit code.

### Step 3: Report back

- [ ] On success (exit 0): present each trail with its title, level, and
      status. Keep the output compact.
- [ ] On failure: surface the error and suggest `estudeme validate <vault-path>`
      to diagnose.

## Critical

- This skill is read-only. Never invoke any command that writes to the vault.
- Never assume the vault path. Always confirm it with the user.

## Examples

### Example 1: Direct listing

User says: "What trails do I have in `~/study/my-vault`?"

Actions:
- Run `estudeme trail list ~/study/my-vault`
- Receive the trail list
- Present each trail with level and status

Result: User sees the full list of trails.

### Example 2: Missing path

User says: "List my trails."

Actions:
- Ask: "Which vault directory should I list trails from?"
- Wait for the user to provide a path before proceeding.

Result: User specifies the path; skill proceeds as in Example 1.

## Troubleshooting

**Error: `Cannot find vault directory`**
- Cause: the path does not exist or is not a directory.
- Solution: confirm the path spelling with the user; verify it with `ls`.

**Error: `No trails found in vault`**
- Cause: the vault has no Markdown files with `type: trail` in frontmatter.
- Solution: the user may not have created trails yet (suggest `estudeme init`),
  or trails are present but malformed (suggest `estudeme validate <vault>`).

## Performance Notes

- Always pass the full vault path. The CLI does not auto-discover the vault.
````

### Step 2.2: Write `inspect-trail`

- [ ] Create `.agents/skills/inspect-trail/SKILL.md`:

````markdown
---
name: inspect-trail
description: "Shows detailed progress and status for a specific trail in an EstudeMe vault: modules covered, notes per module, completion percentage. Use when the user asks 'how is my trail X', 'status of trail X', 'progress on the Java trail'. Don't use to list multiple trails — use list-trails."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: Inspect Trail

## Instructions

### Step 1: Gather inputs

- [ ] Confirm two pieces of information with the user: the vault path and the
      trail title (the value of the `title` field in the trail's frontmatter).
- [ ] If the user mentions the trail without a title (e.g., "my Java trail"),
      run `estudeme trail list <vault>` first to find the exact title.

### Step 2: Run the CLI

- [ ] Execute: `estudeme trail status <vault-path> "<trail-title>"`
- [ ] Quote the trail title — it likely contains spaces.

### Step 3: Report back

- [ ] On success: present the progress summary (modules completed, total
      notes, percent done) plus any next-step suggestions the CLI emits.
- [ ] On failure: surface the error and propose a fix (e.g., trail not found
      → check title spelling via `list-trails`).

## Critical

- Read-only skill. Never run commands that write to the vault.
- Always quote the trail title in the CLI call.

## Examples

### Example 1: Direct status

User says: "How is my Java Backend trail going in `~/study/my-vault`?"

Actions:
- Run `estudeme trail status ~/study/my-vault "Java Backend"`
- Receive the progress data
- Present completion percentage, modules done, and notes count

Result: User sees a clear progress summary.

### Example 2: Title disambiguation

User says: "Show me my Kubernetes progress" (vault path known, title approximate).

Actions:
- Run `estudeme trail list <vault>` to find the exact title
- Confirm the match with the user if multiple candidates exist
- Run `estudeme trail status <vault> "<exact-title>"`

Result: Status shown for the right trail, no ambiguity.

## Troubleshooting

**Error: `Trail not found`**
- Cause: title misspelled or trail does not exist.
- Solution: run `estudeme trail list <vault>` to see the available titles
  and re-run with the correct one.

**Error: `Cannot find vault directory`**
- Cause: bad vault path.
- Solution: confirm with the user; verify with `ls`.

## Performance Notes

- One CLI call per trail. Do not loop to "discover" trails — use `list-trails`
  for that and pass the exact title back here.
````

### Step 2.3: Run the catalog test

- [ ] Run: `cd packages/cli && npx vitest run tests/skills/catalog.test.ts`
- [ ] Expected: **PASS**, with two skills discovered (`list-trails`, `inspect-trail`) and all sections present.

### Step 2.4: Commit

```bash
git add .agents/skills/list-trails .agents/skills/inspect-trail
git commit -m "feat(skills): list-trails and inspect-trail micro-skills"
```

---

## Task 3: Card micro-skills

**Files:**
- Create: `.agents/skills/list-cards/SKILL.md`, `.agents/skills/export-cards/SKILL.md`

### Step 3.1: Write `list-cards`

- [ ] Create `.agents/skills/list-cards/SKILL.md`:

````markdown
---
name: list-cards
description: "Lists all flashcards in an EstudeMe vault. Use when the user asks 'list my cards', 'what flashcards do I have', 'show me my cards', or wants a card inventory. Don't use to export cards to an external format — use export-cards."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: List Cards

## Instructions

### Step 1: Confirm vault path

- [ ] Confirm or ask for the vault path. Do not assume.

### Step 2: Run the CLI

- [ ] Execute: `estudeme cards list <vault-path>`
- [ ] Capture stdout and exit code.

### Step 3: Report

- [ ] On success: present the card list. If the count is large (> 30),
      summarize by trail or card-type rather than listing every card.
- [ ] On failure: surface the error message.

## Critical

- Read-only skill. Never modify cards or the vault.

## Examples

### Example 1: Direct listing

User says: "List the cards in `~/study/my-vault`."

Actions:
- Run `estudeme cards list ~/study/my-vault`
- Present the cards grouped by trail (if multiple trails exist)

Result: User sees the card inventory.

## Troubleshooting

**Error: `Cannot find vault directory`**
- Cause: wrong path.
- Solution: confirm with the user.

**No cards listed but the user expected some**
- Cause: notes exist but no `type: card` documents.
- Solution: suggest creating cards in the vault or running `estudeme validate`
  to verify card frontmatter.

## Performance Notes

- For very large vaults (> 100 cards), prefer summarizing over listing each.
````

### Step 3.2: Write `export-cards`

- [ ] Create `.agents/skills/export-cards/SKILL.md`:

````markdown
---
name: export-cards
description: "Exports flashcards from an EstudeMe vault into a neutral JSON file (suitable for Anki import). Use when the user asks 'export my cards', 'export cards to Anki', 'give me a card export', or wants to take cards out of the vault. Don't use to list cards in place — use list-cards."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: Export Cards

## Instructions

### Step 1: Gather inputs

- [ ] Confirm the vault path.
- [ ] Confirm the output file path. Default to `cards.json` in the current
      working directory if the user does not specify.

### Step 2: Run the CLI

- [ ] Execute: `estudeme cards export <vault-path> --out <output-file>`
- [ ] Capture exit code and any messages.

### Step 3: Confirm

- [ ] On success: report the output file path and the count of cards exported.
- [ ] Suggest the user verify the file (e.g., `wc -l <output>` or open it).

## Critical

- The export writes a new file outside the vault — it does not modify the vault.
- If the output file already exists, the CLI overwrites it. Warn the user
  before running if they did not explicitly ask for overwrite.

## Examples

### Example 1: Default location

User says: "Export my cards from `~/study/my-vault`."

Actions:
- Confirm the output path with the user: "Save as `cards.json` here?"
- Run `estudeme cards export ~/study/my-vault --out cards.json`
- Report the file path and card count

Result: A JSON file ready for Anki import or downstream tooling.

## Troubleshooting

**Error: `Permission denied: cannot write to <path>`**
- Cause: the output directory is not writable.
- Solution: ask the user for an alternate path.

**Error: `No cards to export`**
- Cause: vault has no `type: card` documents.
- Solution: nothing to export — confirm with the user that they expected cards.

## Performance Notes

- The export is fast for typical vaults (< 1000 cards). No batching needed.
````

### Step 3.3: Run the catalog test

- [ ] Run: `cd packages/cli && npx vitest run tests/skills/catalog.test.ts`
- [ ] Expected: **PASS**, four skills discovered.

### Step 3.4: Commit

```bash
git add .agents/skills/list-cards .agents/skills/export-cards
git commit -m "feat(skills): list-cards and export-cards micro-skills"
```

---

## Task 4: Validation and metrics micro-skills

**Files:**
- Create: `.agents/skills/validate-vault/SKILL.md`, `.agents/skills/report-metrics/SKILL.md`

### Step 4.1: Write `validate-vault`

- [ ] Create `.agents/skills/validate-vault/SKILL.md`:

````markdown
---
name: validate-vault
description: "Validates an EstudeMe vault: checks frontmatter against the schema for each document type and reports broken wikilinks. Use when the user asks 'validate my vault', 'check my vault', 'any broken links', 'is my vault healthy'. Don't use to inspect a specific trail's progress — use inspect-trail."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: Validate Vault

## Instructions

### Step 1: Confirm vault path

- [ ] Ask the user for the vault path if not provided.

### Step 2: Run the CLI

- [ ] Execute: `estudeme validate <vault-path>`
- [ ] Capture stdout (structured findings) and exit code.

### Step 3: Report

- [ ] If the validation reports zero errors and warnings: confirm "vault is
      healthy" and stop.
- [ ] If errors or warnings exist: group them by file, summarize the most
      common issue type, and propose concrete fixes (e.g., "three notes
      missing `type:` field — add `type: note` to their frontmatter").

## Critical

- Read-only skill. Never auto-fix issues without explicit user approval.
- The CLI returns exit 0 for clean and non-zero for issues found. Treat both
  as successful runs of the skill; the difference is what to report.

## Examples

### Example 1: Clean vault

User says: "Validate `~/study/my-vault`."

Actions:
- Run `estudeme validate ~/study/my-vault`
- Output reports zero issues

Result: Confirm to the user: "Vault is healthy. No frontmatter errors or
broken wikilinks found."

### Example 2: Issues found

User says: "Any broken links in my vault?"

Actions:
- Run `estudeme validate ~/study/my-vault`
- Output reports 3 broken wikilinks in 2 files

Result: Present each broken link with the file path and the target that
could not be resolved. Suggest the user check the target name or create
the missing note.

## Troubleshooting

**Error: `Cannot find vault directory`**
- Cause: wrong path.
- Solution: confirm with the user.

**Validation hangs on a large vault**
- Cause: very large vault (thousands of files).
- Solution: wait — the parser is single-pass. If it truly hangs, ask the
  user to confirm the vault size and file the issue.

## Performance Notes

- Validation walks every Markdown file. For vaults under 1000 files, it
  completes in well under a second.
````

### Step 4.2: Write `report-metrics`

- [ ] Create `.agents/skills/report-metrics/SKILL.md`:

````markdown
---
name: report-metrics
description: "Reports vault-wide metrics in an EstudeMe vault: trail count, module count, notes per trail, cards per trail, overall structure summary. Use when the user asks 'show vault metrics', 'how is my progress overall', 'give me numbers on my vault'. Don't use to inspect a single trail — use inspect-trail."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: Report Metrics

## Instructions

### Step 1: Confirm vault path

- [ ] Ask the user for the vault path if not provided.

### Step 2: Run the CLI

- [ ] Execute: `estudeme metrics show <vault-path>`
- [ ] Capture stdout and exit code.

### Step 3: Report

- [ ] Present the metrics. Lead with the top-level numbers (trails, modules,
      notes, cards) and then per-trail breakdowns if the user asked for
      "overall" rather than a specific trail.
- [ ] If a metric stands out (e.g., a trail with zero notes), call it out
      gently as a suggestion ("the Kubernetes trail has no notes yet — want
      to scaffold a module?").

## Critical

- Read-only skill. Never modify the vault to "improve" metrics.

## Examples

### Example 1: Overall metrics

User says: "Show me the metrics for `~/study/my-vault`."

Actions:
- Run `estudeme metrics show ~/study/my-vault`
- Present the structured output

Result: User sees totals (trails, modules, notes, cards) and per-trail
breakdowns.

## Troubleshooting

**Error: `Cannot find vault directory`**
- Cause: bad path.
- Solution: confirm with the user.

**Metrics show zero everything**
- Cause: vault is empty or has no documents with valid frontmatter.
- Solution: suggest the user run `validate-vault` to confirm the vault has
  the expected documents.

## Performance Notes

- One CLI call. Fast for typical vaults.
````

### Step 4.3: Run the catalog test

- [ ] Run: `cd packages/cli && npx vitest run tests/skills/catalog.test.ts`
- [ ] Expected: **PASS**, six skills discovered.

### Step 4.4: Commit

```bash
git add .agents/skills/validate-vault .agents/skills/report-metrics
git commit -m "feat(skills): validate-vault and report-metrics micro-skills"
```

---

## Task 5: Meta-skill `review-vault-state`

**Files:**
- Create: `.agents/skills/review-vault-state/SKILL.md`

### Step 5.1: Write `review-vault-state`

- [ ] Create `.agents/skills/review-vault-state/SKILL.md`:

````markdown
---
name: review-vault-state
description: "Gives a complete state overview of an EstudeMe vault by orchestrating validation, trail listing, and metrics into a single coherent report. Use when the user asks 'how is my vault', 'give me an overview', 'state of my study system', 'review my vault'. Don't use for a single trail — use inspect-trail."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
metadata:
  type: meta-skill
---

# Skill: Review Vault State (Meta-Skill)

## Quando usar

- The user asks for a global view of their vault state.
- The user is starting a study session and wants to see where they stand.
- The user wants to share a vault status report with someone else.

## Inputs necessários

- The vault path.

## Workflow (execute nesta ordem)

### 1. Validate the vault

→ **Use skill:** [list-trails](../validate-vault/SKILL.md)

Confirm the vault is well-formed before reading further. If validation
surfaces errors that would distort the rest of the report (missing types,
broken wikilinks), surface them first and ask the user whether to proceed
or fix the issues first.

### 2. List the trails

→ **Use skill:** [list-trails](../list-trails/SKILL.md)

Get the catalog of trails with their levels and statuses. Keep the output
in memory — it feeds the synthesis step.

### 3. Report the vault metrics

→ **Use skill:** [report-metrics](../report-metrics/SKILL.md)

Get the top-level counts and per-trail breakdowns.

### 4. Synthesize into a single report

Combine the results from steps 1, 2, and 3 into a single prose summary with
this structure:

- **Health line:** "Vault is healthy" or "Vault has N issues (see below)".
- **Catalog line:** "X trails, Y modules total, Z notes, W cards".
- **Per-trail highlights:** for each trail, one line with the level, status,
  and rough progress hint (e.g., "Java Backend, intermediate, 4 of 6 modules
  in progress").
- **Suggested next step:** a single, concrete suggestion based on what the
  numbers reveal — e.g., the trail with the highest in-progress count, or a
  trail with broken wikilinks that should be fixed.

## Critical

- This meta-skill is read-only. It does not write to the vault.
- The final report must read as a single coherent narrative, not as three
  separate dumps from the underlying micro-skills.
- If `validate-vault` reports critical errors, stop after step 1 and surface
  them rather than proceeding to a metrics report on a broken vault.

## Examples

### Example 1: Healthy vault

User says: "Give me an overview of `~/study/my-vault`."

Actions:
- Run validate-vault: clean.
- Run list-trails: 3 trails (Java Backend, Kubernetes, English for Work).
- Run report-metrics: 14 modules, 47 notes, 22 cards.
- Synthesize.

Result: a paragraph like

> Vault is healthy. 3 trails covering 14 modules, 47 notes, and 22 cards.
> Java Backend (intermediate, active) has the most movement — 5 of 6 modules
> started. Kubernetes (beginner, active) has 2 modules but no cards yet.
> English for Work (intermediate, paused) is dormant.
>
> Suggested next step: finish the last Java Backend module to close that
> trail, or start drafting cards for Kubernetes.

## Troubleshooting

**A sub-skill fails partway through**
- Cause: vault path wrong, validation found blocking errors, or a CLI call
  errored.
- Solution: report the failure and stop. Do not continue to later steps with
  partial data; the synthesis would be misleading.

**The synthesis feels generic**
- Cause: the meta-skill is summarizing without using the specific data it
  collected.
- Solution: re-read the per-skill output and quote concrete numbers and
  trail names in the synthesis.

## Consulte também

- [list-trails](../list-trails/SKILL.md)
- [validate-vault](../validate-vault/SKILL.md)
- [report-metrics](../report-metrics/SKILL.md)
````

### Step 5.2: Run the catalog test

- [ ] Run: `cd packages/cli && npx vitest run tests/skills/catalog.test.ts`
- [ ] Expected: **PASS**, seven skills discovered (including the meta-skill, which uses the meta-specific section structure).

### Step 5.3: Commit

```bash
git add .agents/skills/review-vault-state
git commit -m "feat(skills): review-vault-state meta-skill"
```

---

## Task 6: `estudeme skills install` command

**Files:**
- Create: `packages/cli/src/commands/skills.ts`, `packages/cli/src/lib/skills-installer.ts`, `packages/cli/tests/commands/skills.test.ts`, `packages/cli/tests/lib/skills-installer.test.ts`, `packages/cli/scripts/copy-skills.mjs`
- Modify: `packages/cli/src/index.ts`, `packages/cli/package.json`, `README.md`, `CHANGELOG.md`

### Step 6.1: Add the prebuild copy script

The CLI bundles the skills at build time by copying `.agents/skills/` into `packages/cli/skills/`. The destination is `.gitignored` (see Step 1.6) and travels with the npm package.

- [ ] Create `packages/cli/scripts/copy-skills.mjs`:

```javascript
#!/usr/bin/env node
import { rmSync, cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = join(__dirname, '../../../.agents/skills');
const destination = join(__dirname, '../skills');

if (!existsSync(source)) {
  console.error(`copy-skills: source not found at ${source}`);
  process.exit(1);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true, filter: (src) => !src.endsWith('.gitkeep') });
console.log(`copy-skills: copied ${source} -> ${destination}`);
```

- [ ] Make it runnable:

```bash
chmod +x packages/cli/scripts/copy-skills.mjs
```

### Step 6.2: Wire the prebuild script into `package.json`

- [ ] In `packages/cli/package.json`, update the `scripts` and `files` sections:

```json
{
  "scripts": {
    "prebuild": "node scripts/copy-skills.mjs",
    "build": "tsup",
    "test": "vitest run",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo skills"
  },
  "files": [
    "dist",
    "templates",
    "skills"
  ]
}
```

(Keep all other fields. If a `clean` script already exists, just append `skills` to its target list.)

### Step 6.3: Verify the prebuild script works

- [ ] Run `cd packages/cli && npm run prebuild`
- [ ] Expected: console message `copy-skills: copied ...` and the directory `packages/cli/skills/` now contains the seven skill folders.

### Step 6.4: Write the failing test for the installer library

- [ ] Create `packages/cli/tests/lib/skills-installer.test.ts`:

```typescript
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, existsSync, readlinkSync, lstatSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installSkills } from '../../src/lib/skills-installer.js';

let tempDir: string;
let sourceDir: string;
let vaultDir: string;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'estudeme-skills-test-'));
  sourceDir = join(tempDir, 'source-skills');
  vaultDir = join(tempDir, 'vault');

  mkdirSync(sourceDir, { recursive: true });
  mkdirSync(join(sourceDir, 'list-trails'), { recursive: true });
  writeFileSync(
    join(sourceDir, 'list-trails', 'SKILL.md'),
    '---\nname: list-trails\ndescription: x\n---\n# Skill: List Trails\n'
  );

  mkdirSync(vaultDir, { recursive: true });
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('installSkills', () => {
  it('copies skills from source to <vault>/.agents/skills', () => {
    installSkills({ source: sourceDir, vault: vaultDir });

    const installed = join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md');
    expect(existsSync(installed)).toBe(true);
    expect(readFileSync(installed, 'utf-8')).toContain('name: list-trails');
  });

  it('creates symlinks .claude/skills and .github/skills pointing to .agents/skills', () => {
    installSkills({ source: sourceDir, vault: vaultDir });

    const claudeLink = join(vaultDir, '.claude', 'skills');
    const githubLink = join(vaultDir, '.github', 'skills');

    expect(lstatSync(claudeLink).isSymbolicLink()).toBe(true);
    expect(lstatSync(githubLink).isSymbolicLink()).toBe(true);
    expect(readlinkSync(claudeLink)).toBe('../.agents/skills');
    expect(readlinkSync(githubLink)).toBe('../.agents/skills');
  });

  it('preserves existing files by default (does not overwrite)', () => {
    const target = join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md');
    mkdirSync(join(vaultDir, '.agents', 'skills', 'list-trails'), { recursive: true });
    writeFileSync(target, 'user customization');

    installSkills({ source: sourceDir, vault: vaultDir });

    expect(readFileSync(target, 'utf-8')).toBe('user customization');
  });

  it('overwrites when force is true', () => {
    const target = join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md');
    mkdirSync(join(vaultDir, '.agents', 'skills', 'list-trails'), { recursive: true });
    writeFileSync(target, 'user customization');

    installSkills({ source: sourceDir, vault: vaultDir, force: true });

    expect(readFileSync(target, 'utf-8')).toContain('name: list-trails');
  });
});
```

### Step 6.5: Run the test to verify it fails

- [ ] Run: `cd packages/cli && npx vitest run tests/lib/skills-installer.test.ts`
- [ ] Expected: **FAIL** with module-not-found errors for `skills-installer.js`. This confirms the test wires up correctly.

### Step 6.6: Implement the installer library

- [ ] Create `packages/cli/src/lib/skills-installer.ts`:

```typescript
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, symlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';

export interface InstallSkillsOptions {
  source: string;
  vault: string;
  force?: boolean;
}

export function installSkills(options: InstallSkillsOptions): void {
  const { source, vault, force = false } = options;

  if (!existsSync(source)) {
    throw new Error(`Skill source directory not found: ${source}`);
  }

  if (!existsSync(vault) || !statSync(vault).isDirectory()) {
    throw new Error(`Vault directory not found or not a directory: ${vault}`);
  }

  const targetSkills = join(vault, '.agents', 'skills');
  mkdirSync(targetSkills, { recursive: true });

  copySkillsTree(source, targetSkills, force);
  createSymlink(join(vault, '.claude'), 'skills', '../.agents/skills');
  createSymlink(join(vault, '.github'), 'skills', '../.agents/skills');
}

function copySkillsTree(source: string, target: string, force: boolean): void {
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.name === '.gitkeep') continue;

    const sourcePath = join(source, entry.name);
    const targetPath = join(target, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(targetPath, { recursive: true });
      copySkillsTree(sourcePath, targetPath, force);
    } else if (entry.isFile()) {
      if (existsSync(targetPath) && !force) continue;
      cpSync(sourcePath, targetPath);
    }
  }
}

function createSymlink(parentDir: string, linkName: string, target: string): void {
  mkdirSync(parentDir, { recursive: true });
  const linkPath = join(parentDir, linkName);
  if (existsSync(linkPath)) return;
  symlinkSync(target, linkPath, 'dir');
}
```

### Step 6.7: Run the test to verify it passes

- [ ] Run: `cd packages/cli && npx vitest run tests/lib/skills-installer.test.ts`
- [ ] Expected: **PASS**, four tests green.

### Step 6.8: Commit the installer library

```bash
git add packages/cli/src/lib/skills-installer.ts packages/cli/tests/lib/skills-installer.test.ts
git commit -m "feat(cli): skills installer library (copy + symlinks)"
```

### Step 6.9: Write the failing test for the `skills install` command

- [ ] Create `packages/cli/tests/commands/skills.test.ts`:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Command } from 'commander';
import { registerSkillsCommand } from '../../src/commands/skills.js';

let tempDir: string;
let sourceDir: string;
let vaultDir: string;
let program: Command;

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'estudeme-skills-cmd-test-'));
  sourceDir = join(tempDir, 'bundled-skills');
  vaultDir = join(tempDir, 'vault');

  mkdirSync(sourceDir, { recursive: true });
  mkdirSync(join(sourceDir, 'list-trails'), { recursive: true });
  writeFileSync(
    join(sourceDir, 'list-trails', 'SKILL.md'),
    '---\nname: list-trails\ndescription: x\n---\n# Skill: List Trails\n'
  );

  mkdirSync(vaultDir, { recursive: true });

  program = new Command();
  registerSkillsCommand(program, () => sourceDir);
});

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true });
});

describe('estudeme skills install', () => {
  it('installs skills into <vault>/.agents/skills', async () => {
    await program.parseAsync(['node', 'estudeme', 'skills', 'install', vaultDir]);
    expect(existsSync(join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md'))).toBe(true);
  });

  it('creates the .claude/skills and .github/skills symlinks', async () => {
    await program.parseAsync(['node', 'estudeme', 'skills', 'install', vaultDir]);
    expect(existsSync(join(vaultDir, '.claude', 'skills'))).toBe(true);
    expect(existsSync(join(vaultDir, '.github', 'skills'))).toBe(true);
  });

  it('accepts --force', async () => {
    await program.parseAsync(['node', 'estudeme', 'skills', 'install', vaultDir, '--force']);
    expect(existsSync(join(vaultDir, '.agents', 'skills', 'list-trails', 'SKILL.md'))).toBe(true);
  });

  it('fails clearly when the vault does not exist', async () => {
    const missing = join(tempDir, 'does-not-exist');
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`);
    }) as never);

    await expect(
      program.parseAsync(['node', 'estudeme', 'skills', 'install', missing])
    ).rejects.toThrow(/exit 1/);

    exitSpy.mockRestore();
  });
});
```

### Step 6.10: Run the test to verify it fails

- [ ] Run: `cd packages/cli && npx vitest run tests/commands/skills.test.ts`
- [ ] Expected: **FAIL** with `registerSkillsCommand` not found. This confirms the test wires up correctly.

### Step 6.11: Implement the command

- [ ] Create `packages/cli/src/commands/skills.ts`:

```typescript
import { Command } from 'commander';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { installSkills } from '../lib/skills-installer.js';

export type SkillsSourceResolver = () => string;

const defaultSourceResolver: SkillsSourceResolver = () => {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', '..', 'skills');
};

export function registerSkillsCommand(
  program: Command,
  sourceResolver: SkillsSourceResolver = defaultSourceResolver
): void {
  const skills = program.command('skills').description('Manage EstudeMe skills for AI agents.');

  skills
    .command('install <vault>')
    .description('Install the EstudeMe skills into a vault directory (copies + creates symlinks).')
    .option('-f, --force', 'overwrite existing skill files in the vault', false)
    .action((vault: string, options: { force?: boolean }) => {
      try {
        installSkills({
          source: sourceResolver(),
          vault,
          force: options.force ?? false,
        });
        console.log(`Skills installed into ${vault}/.agents/skills (with .claude and .github symlinks).`);
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
}
```

### Step 6.12: Register the command in the CLI entry

- [ ] In `packages/cli/src/index.ts`, add the import and call:

```typescript
import { registerSkillsCommand } from './commands/skills.js';

// after the other registerXxxCommand calls:
registerSkillsCommand(program);
```

(The existing `program` is the top-level Commander instance. Place `registerSkillsCommand(program);` next to the other registrations.)

### Step 6.13: Run the test to verify it passes

- [ ] Run: `cd packages/cli && npx vitest run tests/commands/skills.test.ts`
- [ ] Expected: **PASS**, four tests green.

### Step 6.14: Run the full CLI test suite

- [ ] Run: `cd packages/cli && npx vitest run`
- [ ] Expected: **PASS**, all suites green (skills catalog + skills installer + skills command + the existing Phase 0 suites).

### Step 6.15: Manual end-to-end check of the install command

- [ ] Build the CLI from scratch:

```bash
cd packages/cli && npm run clean && npm run build
```

- [ ] Run the bundled CLI against a temporary vault:

```bash
mkdir -p /tmp/estudeme-test-vault
node packages/cli/dist/index.js skills install /tmp/estudeme-test-vault
ls -la /tmp/estudeme-test-vault/.agents/skills /tmp/estudeme-test-vault/.claude/skills
```

- [ ] Expected: seven skill directories in `.agents/skills/`, and `.claude/skills` resolving as a symlink to `../.agents/skills`.

- [ ] Clean up:

```bash
rm -rf /tmp/estudeme-test-vault
```

### Step 6.16: Update `README.md`

- [ ] In the "Try it locally" section, after the existing CLI examples, add:

```markdown
For users who want to operate EstudeMe via an AI agent (Claude Code, Gemini, Copilot), install the skills into a vault:

```bash
estudeme skills install ./my-vault
```

This copies the skill catalog into `<vault>/.agents/skills/` and creates symlinks at `<vault>/.claude/skills` and `<vault>/.github/skills` so each AI tool can discover the skills natively. See [ARCHITECTURE.md — Agent-native design](ARCHITECTURE.md#agent-native-design) for details.
```

### Step 6.17: Update `CHANGELOG.md`

- [ ] In the `Unreleased` section, add under `Added`:

```markdown
- `AGENTS.md` (universal), `GEMINI.md`, and `.github/copilot-instructions.md` — three-layer context architecture for multi-tool agent support.
- Agent skills layer at `.agents/skills/` with six micro-skills (`list-trails`, `inspect-trail`, `list-cards`, `export-cards`, `validate-vault`, `report-metrics`) and one meta-skill (`review-vault-state`).
- Symlinks `.claude/skills/` and `.github/skills/` to the canonical `.agents/skills/`.
- `estudeme skills install <vault>` command for installing the skill catalog into a user's vault.
- Skill catalog shape validation test in `packages/cli/tests/skills/catalog.test.ts`.
- ADR-0002: Agent skills architecture.
```

### Step 6.18: Final commit for the distribution unit

```bash
git add packages/cli/src/commands/skills.ts \
        packages/cli/src/index.ts \
        packages/cli/tests/commands/skills.test.ts \
        packages/cli/scripts/copy-skills.mjs \
        packages/cli/package.json \
        package-lock.json \
        README.md \
        CHANGELOG.md
git commit -m "feat(cli): estudeme skills install command + bundle skills in package"
```

---

## Task 7: End-to-end agent workflow test

The validation criterion for Phase 1 (from the design doc, section 4 — Delivery Phases): *"a student installs CLI + skills, talks to Claude or Gemini, and the agent does the work."*

**Files:**
- Create: `docs/status/<YYYY-MM-DD>-phase-1-agent-walkthrough.md` (replace `<YYYY-MM-DD>` with the actual date when the walkthrough is executed)

### Step 7.1: Prepare a sample vault

- [ ] Pick or create a vault for the walkthrough. The `codex-technomanticus` vault (used to validate Phase 0) is ideal. If not available, run `estudeme init /tmp/walkthrough-vault` to scaffold a fresh one and add at least one trail with a module and a few notes/cards.

### Step 7.2: Install the skills

- [ ] From the EstudeMe repo (after a fresh build):

```bash
node packages/cli/dist/index.js skills install <path-to-vault>
```

- [ ] Confirm the symlinks resolved:

```bash
ls -la <path-to-vault>/.claude/skills
ls -la <path-to-vault>/.github/skills
```

### Step 7.3: Run the walkthrough with Claude Code

- [ ] Open the vault directory in a new Claude Code session: `cd <path-to-vault> && claude`.
- [ ] Run this sequence of natural-language prompts and capture the agent's responses:

  1. "What trails do I have here?" — should trigger `list-trails`.
  2. "How is my <trail-name> trail going?" — should trigger `inspect-trail`.
  3. "List my cards." — should trigger `list-cards`.
  4. "Export the cards as cards.json." — should trigger `export-cards`.
  5. "Validate the vault." — should trigger `validate-vault`.
  6. "Show me the metrics." — should trigger `report-metrics`.
  7. "Give me a complete overview of this vault." — should trigger `review-vault-state`.
  8. Recovery test: "Show me the trail called `FoobarThatDoesNotExist`." — agent should gracefully report not-found and suggest running `list-trails`.

### Step 7.4: Document the walkthrough

- [ ] Create `docs/status/<YYYY-MM-DD>-phase-1-agent-walkthrough.md` with this structure:

```markdown
# Phase 1 — Agent Walkthrough

**Date:** <YYYY-MM-DD>
**Vault:** <description: codex-technomanticus or generated fixture>
**Agent:** Claude Code (Opus 4.7) — <other agents if re-run>

## Summary

One paragraph summarizing whether the agent operated the system as expected.
Note which skills triggered correctly, which under-triggered, which
over-triggered, and any rough edges in the synthesis quality.

## Walkthrough

For each prompt, record:

- The exact prompt issued.
- Which skill the agent loaded (from its visible reasoning if available).
- A brief assessment of the response (correct / acceptable / wrong).

### Prompt 1: "What trails do I have here?"
Skill loaded: `list-trails`
Response: <paste or summarize>
Assessment: <correct / acceptable / wrong + notes>

### Prompt 2: ...

(Continue for all eight prompts.)

## Issues found

A list of issues filed against this PR or the skills. Link each issue.

## Decisions

If the walkthrough reveals a needed change to a skill's description (under-
or over-triggering), document the change and the rationale.

## Next steps

What this validates for Phase 2 entry, and what should be deferred.
```

### Step 7.5: Commit the walkthrough document

```bash
git add docs/status/<YYYY-MM-DD>-phase-1-agent-walkthrough.md
git commit -m "docs: Phase 1 agent walkthrough (<YYYY-MM-DD>)"
```

### Step 7.6: Optional — repeat with a second agent

The criterion does not require multiple agents, but it strengthens the validation. If time allows, repeat steps 7.2–7.4 with Gemini CLI and append a section to the same walkthrough document.

### Step 7.7: Close issue #12 and the open Phase 1 tracking issues

- [ ] Close issue #12 with a comment referencing the walkthrough document.
- [ ] Close each of the new Phase 1 tracking issues created in Step 1.11 as their tasks complete.

---

## Wrap-up

After Task 7 completes:

- [ ] Run the full test suite one more time: `npm run test` from the repo root.
- [ ] Run `npm run typecheck` and `npm run lint`.
- [ ] Confirm all checks pass.
- [ ] Push the branch and open a single PR titled "Phase 1: skills architecture, six micro-skills, one meta-skill, distribution command, and E2E validation" against `main`.
- [ ] In the PR description, link the spec, the ADR, this plan, and the walkthrough.
- [ ] Close the Phase 1 milestone in GitHub once the PR merges.

The Phase 1 status report (companion to `docs/status/2026-05-19-phase-0-status.md`) is written **after** the PR merges — it summarizes what shipped, what was deferred (constraint-skills, global install, Windows native support), and what Phase 2 inherits from this foundation.

---

## References

- Spec: `docs/superpowers/specs/2026-05-19-skills-architecture-design.md`
- ADR: `docs/decisions/0002-skills-architecture.md`
- Context engineering guide: https://josenaldo.github.io/blog/context-engineering-guia-completo
- Phase 0 plan (precedent for plan style): `docs/superpowers/plans/2026-04-14-phase-0-foundation.md`
