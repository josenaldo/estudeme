# Agent Skills Architecture — Design

**Date:** 2026-05-19
**Status:** Draft (under review)
**Author:** Josenaldo de Oliveira Matos Filho
**Related:** [ADR-0002](../../decisions/0002-skills-architecture.md), [strategic context P3](../../context/2026-05-01-strategic-context.md), [ARCHITECTURE.md — Agent-native design](../../../ARCHITECTURE.md#agent-native-design)

---

## 1. Context

EstudeMe is designed to be operated by AI agents (Claude Code, Gemini CLI, GitHub Copilot, OpenAI Codex, Cursor) as a first-class interface. The Phase 0 foundation shipped the CLI that agents will call. This design defines the layer between the user's natural-language request and the CLI command: **agent skills** — discrete, on-demand procedural knowledge that translates intent into the right CLI invocation.

The design follows the context-engineering principles articulated in [Josenaldo's context engineering guide](https://josenaldo.github.io/blog/context-engineering-guia-completo). Where the guide gives the universal pattern, this spec applies it to EstudeMe's specific surface.

This spec defines:
- Where context lives (the three-layer model)
- The locations and discovery mechanisms for each AI tool
- The catalog of skills shipped in Phase 1
- The format each skill follows
- How end users get the skills into their own setup

It does not define the implementation plan — that is the output of the writing-plans skill in a follow-up step.

## 2. Goals and non-goals

### Goals

- **Multi-tool consistency.** A single source of truth for skills, with every supported AI tool discovering the same set without duplication or drift.
- **Progressive disclosure.** The agent loads only the context it needs for the current task. Skill bodies are not in the universal context; only their `name` + `description` are.
- **Anti-duplication.** Every rule has one location. Tool-specific files reference, never repeat.
- **Stable contract.** Skills call the CLI under the hood. Behavior lives in the CLI; skills only translate.
- **Distribution path for end users.** A user who installs `@estudeme/cli` can install the skills into their own vault, not just contributors who clone this repo.

### Non-goals (Phase 1)

- Constraint-skills with programmatic validation. The Phase 1 workflow is read-only — nothing mutates the vault. Constraint-skills become useful in Phase 2 when `estudeme review` writes performance notes.
- Global skill installation (`~/.claude/skills/`).
- Automatic detection of which AI tool the user has.
- Native Windows support for the symlink pattern. WSL or equivalent is required. Documented as a known limitation.
- Skill marketplace, sharing, or community-contributed skills.

## 3. Architecture

### Three layers

| Layer | Purpose                                       | Source of truth                                                | Loaded                          |
| ----- | --------------------------------------------- | -------------------------------------------------------------- | ------------------------------- |
| L1    | Universal rules every agent must follow       | `AGENTS.md`                                                    | Every session                   |
| L2    | Tool-specific framing                         | `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`    | Every session, by its own tool  |
| L3    | Procedural knowledge for specific operations  | `.agents/skills/<name>/SKILL.md`                               | On demand, when description matches |

L1 is the canonical universal source. L2 files reference L1 — they never duplicate rules. L3 lives at a single canonical path and is reached by every tool either natively or through a symlink.

### Locations

```
estudeme/
├── AGENTS.md                              ← L1 source of truth
│
├── CLAUDE.md                              ─┐
├── GEMINI.md                               ├─ L2, reference AGENTS.md
├── .github/copilot-instructions.md        ─┘
│
└── .agents/
    └── skills/                            ← L3 source of truth (read natively by
        ├── list-trails/SKILL.md             Codex, Cursor, Gemini)
        ├── inspect-trail/SKILL.md
        ├── ... (one folder per skill)
        └── review-vault-state/SKILL.md

    .claude/skills/  →  ../.agents/skills/  (symlink, for Claude Code)
    .github/skills/  →  ../.agents/skills/  (symlink, for Copilot)
```

The symlinks are part of the architecture, not optional. Without them, Claude Code looks for skills under `.claude/skills/` and Copilot looks under `.github/skills/`, neither of which would resolve to the canonical content. The symlink is the bridge.

### Discovery, per tool

| Tool          | Reads context from              | Reads skills from        | Mechanism                |
| ------------- | ------------------------------- | ------------------------ | ------------------------ |
| Claude Code   | `CLAUDE.md` (primary)           | `.claude/skills/`        | Symlink to `.agents/skills/` |
| GitHub Copilot| `.github/copilot-instructions.md` | `.github/skills/`      | Symlink to `.agents/skills/` |
| Gemini CLI    | `GEMINI.md` (primary), `AGENTS.md` (fallback) | `.agents/skills/` | Native               |
| OpenAI Codex  | `AGENTS.md`                     | `.agents/skills/`        | Native                   |
| Cursor        | `.cursorrules` (not provided in Phase 1) | `.agents/skills/` | Native                  |

Phase 1 ships the three L2 files plus the L1. Cursor users get partial coverage (skills work, but rules come only via `AGENTS.md`). This is documented, not hidden.

## 4. Skill catalog (Phase 1)

The catalog comprises six micro-skills, one meta-skill, and zero constraint-skills.

### Six micro-skills

Each micro-skill is atomic, follows verb-noun naming, and translates a natural-language request into a single CLI invocation. The body is a numbered checklist with one or two `## Critical` rules, an `## Examples` section with at least one realistic user phrase, and `## Troubleshooting` covering the two most common failure modes.

| Skill            | Triggering phrases                                              | CLI invoked                                                |
| ---------------- | --------------------------------------------------------------- | ---------------------------------------------------------- |
| `list-trails`    | "list my trails", "what trails do I have"                       | `estudeme trail list <vault>`                              |
| `inspect-trail`  | "status of trail X", "how is my trail X going"                  | `estudeme trail status <vault> "<name>"`                   |
| `list-cards`     | "list my cards", "what flashcards do I have"                    | `estudeme cards list <vault>`                              |
| `export-cards`   | "export cards to Anki", "give me a card export"                 | `estudeme cards export <vault> --out <file>`               |
| `validate-vault` | "validate my vault", "any broken links", "check vault integrity" | `estudeme validate <vault>`                                |
| `report-metrics` | "vault metrics", "overall progress", "show my numbers"          | `estudeme metrics show <vault>`                            |

### One meta-skill

| Skill                | Triggering phrases                                          | Orchestrates                                       |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| `review-vault-state` | "how is my vault", "give me an overview", "state of my study system" | `validate-vault` → `list-trails` → `report-metrics`, then a prose synthesis |

The meta-skill has no detailed checklist of its own. It points to the three micro-skills it orchestrates and instructs the agent to synthesize the results into a single coherent answer. This honors the blog rule that meta-skills hold sequence, not detail.

### Zero constraint-skills

The Phase 1 surface is read-only — nothing mutates the vault. Constraint-skills (with `## Validação Automatizada` via shell scripts that exit non-zero on violation) become useful in Phase 2, when `estudeme review` starts writing performance notes. At that point, an `enforce-vault-schema` constraint-skill will be introduced and any Phase 2 meta-skill that mutates the vault (e.g., a future `run-card-review`) will call it as the final step. The `review-vault-state` meta-skill defined here does not mutate and does not need it. The omission in Phase 1 is recorded so it is read as a decision, not an oversight.

## 5. Skill format

Each skill is one directory under `.agents/skills/` with a `SKILL.md` at minimum, and optionally `references/`, `scripts/`, and `assets/` subdirectories (loaded only when `SKILL.md` instructs).

### Frontmatter

```yaml
---
name: <kebab-case-verb-noun>           # required, must match directory name
description: <under 1024 chars>        # required, no XML, "what + when + don't use for"
# optional:
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
allowed-tools: "Bash(estudeme:*)"
metadata: { version: "0.1.0", category: "trail" }
---
```

The `description` is the only field the agent reads before deciding whether to load the body. It must be slightly "pushy" — the agent tends to under-trigger when in doubt. The structure that works is: **what it does** + **when to use** (phrases the user would say) + **don't use for X** (if there is overtriggering risk).

### Body sections (micro-skill)

- `# Skill: <Title>` — single H1
- `## Instructions` — numbered steps with concrete, imperative actions. Each step is a checkbox.
- `## Critical` — high-impact rules with brief justifications. No CAPS as substitute for explanation.
- `## Examples` — at least one in the format "User says: ... / Actions: ... / Result: ...".
- `## Troubleshooting` — two or three most common errors. Format: Error / Cause / Solution.
- `## Performance Notes` — optional, used when the agent tends to skip steps.
- `## Consulte também` — cross-references, max one level deep, no cycles.

### Body sections (meta-skill)

- `# Skill: <Title> (Meta-Skill)`
- `## Quando usar` — the workflow scope
- `## Inputs necessários` — what the agent needs before starting
- `## Workflow (execute nesta ordem)` — each step points to a micro-skill via wikilink, no detailed checklists
- Final step (in Phase 2+): a call to a constraint-skill

### Size discipline

- `AGENTS.md`: target under 60 lines.
- `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`: target under 80 lines each.
- `SKILL.md`: target under 500 lines and under 5000 words. Examples over 20 lines of code move to `references/`.

## 6. Tool-specific instruction files

### `AGENTS.md` (L1)

The canonical universal layer. Contains: project identity (one line), architecture (three to four lines), five to seven critical rules in `NEVER`/`ALWAYS` style with no justifications, the skill catalog as one-liners, pointers to the L2 files and other repo docs, and a fallback paragraph.

The critical rules are migrated from the current `CLAUDE.md` (commits in English, no AI co-author signatures, conventional commits, TDD, English documentation, no over-engineering, no committed secrets).

### `CLAUDE.md` (L2, refactored)

A thin tool-specific file. Says "see `AGENTS.md` for universal rules", adds Claude-specific items: the npm commands list, a note that `.claude/skills/` symlinks to `.agents/skills/`, the conversation-language exception (PT-BR in conversation, English in code), and a pointer to the memory directory.

The existing `CLAUDE.md` shrinks from ~25 lines of mixed rules to ~20 lines of tool-specific framing.

### `GEMINI.md` (L2, new)

A pointer file. Says "source of truth: `AGENTS.md`", notes that skills are at `.agents/skills/` (Gemini reads natively, no symlink needed), and reiterates the conversation-language convention. Around seven lines.

### `.github/copilot-instructions.md` (L2, new)

A pointer file with Copilot-specific notes. Primary context source: `AGENTS.md`. Skills load from `.github/skills/` (symlink). Two or three notes specific to Copilot (monorepo layout, conventional commits, pointer to `CONTRIBUTING.md`). Around twelve lines.

## 7. Distribution

### Canonical source

Skills live at `.agents/skills/` in this repository. The build of `@estudeme/cli` bundles this directory into the npm package — the same pattern the CLI already uses for `templates/`. The skill files travel with the published package.

### `estudeme skills install`

A new CLI command shipped in Phase 1:

```
estudeme skills install <vault>
  → copies bundled skills into <vault>/.agents/skills/
  → creates <vault>/.claude/skills/ as a symlink to ../.agents/skills/
  → creates <vault>/.github/skills/ as a symlink to ../.agents/skills/
  → default skips files that already exist in <vault>/.agents/skills/
    (preserves user customizations); --force overwrites unconditionally
```

The command is idempotent and safe to re-run. It does not touch the user's `AGENTS.md` / `CLAUDE.md` / `GEMINI.md` / `copilot-instructions.md` — those are the user's to author for their own context. The command's scope is the `.agents/skills/` tree and the two symlinks.

### Without npm

For users who prefer not to install the CLI globally, the same skills are available by cloning this repository and copying `.agents/skills/` manually. The README documents the path. This is the fallback, not the recommended path.

### Symlinks on Windows

Symlinks require elevated permissions or developer mode on Windows. Phase 1 documents the limitation and recommends WSL. A future enhancement can use Windows Junctions or duplicate directories as a fallback. Not in Phase 1 scope.

## 8. Implementation order

The implementation breaks into six work units, executed roughly in the order below. The full plan (TDD tasks, file lists, acceptance criteria) is the output of the writing-plans skill in a follow-up step.

1. **Design and ADR** — this spec (in `docs/superpowers/specs/`) plus ADR-0002 (in `docs/decisions/`). Both ship together. Implementation begins with unit 2.
2. **Foundation setup** — `AGENTS.md`, refactored `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, empty `.agents/skills/` directory, symlinks `.claude/skills/` and `.github/skills/`, update to `ARCHITECTURE.md#agent-native-design`.
3. **Trail micro-skills** — `list-trails` and `inspect-trail`.
4. **Card micro-skills** — `list-cards` and `export-cards`.
5. **Validation and metrics micro-skills** — `validate-vault` and `report-metrics`.
6. **Meta-skill** — `review-vault-state` (depends on units 3, 4, 5).
7. **Distribution** — `estudeme skills install` command, CLI bundle of the skills directory.
8. **End-to-end agent workflow test** — issue #12, the existing Phase 1 validation issue.

Units 3, 4, and 5 can be developed in parallel once unit 2 lands.

### Issue reorganization

The four Phase 1 issues created earlier are revised in light of this design:

- #9 (skills architecture) stays open until this design and ADR-0002 are merged.
- #10 (`estudeme-trail`) and #11 (`estudeme-cards`) close as superseded — their scope is replaced by units 3 and 4 above plus the new naming convention.
- #12 (E2E agent test) stays as the final unit.
- New issues replace #10 and #11 and add coverage for units 2, 5, 6, and 7.

## 9. Trade-offs and risks

**Symlink portability.** Symlinks work cleanly on Linux and macOS. Windows requires WSL or Junctions. Phase 1 accepts WSL as the supported path and defers a native Windows solution. Risk: users on Windows without WSL cannot use the skills natively. Mitigation: the manual-copy fallback works on any OS.

**Maintenance overhead.** Every new skill is a directory with a SKILL.md, plus its mention in `AGENTS.md`'s catalog. Adding many skills inflates AGENTS.md beyond the 60-line target. Mitigation: the catalog uses one line per skill; if the count grows past ten, AGENTS.md links to a separate `skills/INDEX.md` instead of listing all.

**Description quality determines usability.** A skill with a poor `description` is invisible to the agent. The risk is silent under-triggering. Mitigation: the design enforces the "what + when + don't use for" structure and recommends the debugging trick from the blog (ask the agent when it would use the skill and adjust if the answer doesn't match expectations).

**Coupling between meta and micro.** The meta-skill `review-vault-state` references three specific micro-skills by name. If a micro-skill is renamed or removed, the meta-skill breaks. Mitigation: changes to the catalog are reviewed against the meta-skill, and the meta-skill's cross-references are checked in CI as a future enhancement.

**Drift between the canonical AGENTS.md skill list and the actual skills/ directory.** If a new skill lands without updating AGENTS.md, the agent will not know it exists. Mitigation: documented in CONTRIBUTING (a new skill always updates AGENTS.md) and verifiable via a script in a future iteration.

## 10. Open questions

These are noted but do not block Phase 1.

- **CI verification of skill catalog consistency.** Should a script verify that every directory under `.agents/skills/` is listed in `AGENTS.md`? Likely yes, deferred to a follow-up issue.
- **Skill versioning.** Each skill has an optional `metadata.version` field. Phase 1 does not enforce semver on skills. Open for Phase 2 when distribution matters more.
- **Skill internationalization.** Skills are authored in English. User-facing output is the agent's choice (Portuguese if the conversation is in Portuguese). No localization machinery in Phase 1.

## 11. References

- [Context Engineering guide](https://josenaldo.github.io/blog/context-engineering-guia-completo) — the philosophy this design applies.
- [ADR-0001: Dual-goal execution](../../decisions/0001-dual-goal-execution.md) — the discipline that requires this layer of documentation.
- [Strategic context P3](../../context/2026-05-01-strategic-context.md) — Study Buddy is a feature, not the moat; this design supports the broader agent-native positioning.
- [ARCHITECTURE.md — Agent-native design](../../../ARCHITECTURE.md#agent-native-design) — the section this design grounds in concrete files and locations.
- [Anthropic Skills guide](https://anthropic.com/skills-guide) — the upstream format reference.
- Design doc [§Phase 1](2026-04-14-estudeme-design.md#phase-1--skills--users-ai) — the original phase definition.
