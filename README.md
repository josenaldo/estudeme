# EstudeMe

> Your study grimoire — organize trails, master content, measure progress.

Open-core self-directed learning platform. Markdown vault + frontmatter as the universal data format. The student is the protagonist — they create, organize, and study their own content. The tool removes mechanical work from the path and provides visibility on where the student is and where they are going.

## Status

Under development — Phase 0 (Foundation).

See the [design doc](docs/superpowers/specs/2026-04-14-estudeme-design.md) and the [Phase 0 plan](docs/superpowers/plans/2026-04-14-phase-0-foundation.md).

---

## Architecture Overview

EstudeMe is a TypeScript monorepo with a layered architecture:

```
┌──────────────────────────────────────────────────┐
│                     User                          │
├──────────┬───────────┬──────────┬────────────────┤
│ Obsidian │    CLI    │  Skills  │   Site/Web     │
│  Plugin  │           │  (.md)   │   (future)     │
├──────────┴───────────┴──────────┴────────────────┤
│              Core Lib (TypeScript)                │
│  ┌─────────┬──────────┬─────────┬─────────────┐  │
│  │  Vault  │  Spaced  │ Metrics │   Content   │  │
│  │  Parser │  Rep     │ Engine  │  Generator  │  │
│  └─────────┴──────────┴─────────┴─────────────┘  │
├──────────────────────────────────────────────────┤
│          Vault (Markdown + Frontmatter)           │
└──────────────────────────────────────────────────┘
```

**Packages:**

| Package | Purpose |
|---|---|
| `@estudeme/core` | Core lib — vault parser, FSRS, metrics, export. Zero Obsidian dependencies. |
| `@estudeme/cli` | CLI — `init`, `validate`, `trail`, `cards`, `quiz`, `metrics`, `site`, `ingest` |

---

## The Agent Workflow

EstudeMe is designed to be operated by AI agents (Claude Code, GitHub Copilot, Gemini, etc.) via a **context engineering architecture** rather than only through direct CLI commands.

### What this means

A student installs the CLI and a matching set of **skills** into their AI agent. Then they interact in natural language:

> "Create a trail on Java Backend with beginner difficulty."

The agent loads the `estudeme-trail` skill, which guides it step-by-step to invoke the CLI correctly. No memorization of commands. No context lost between sessions.

### Why this architecture works

This design follows the principles of **context engineering** — the discipline of curating what an agent sees *before* it responds, so results are consistent and predictable without requiring the user to re-explain the project every session.

It is not about asking better questions. It is about the environment you create for the agent to work in.

### The Three Context Layers

EstudeMe's agent workflow is organized in three layers, following the [three-layer context architecture](https://josenaldo.github.io/blog/context-engineering-guia-completo):

```
Layer 1 — Universal (AGENTS.md / CLAUDE.md)
  ├── Project identity: what EstudeMe is, the stack, the structure
  ├── Critical constraints: what agents must NEVER do
  ├── Essential commands: the 5-6 most-used CLI commands
  └── References to layers 2 and 3 (never duplicates them)

Layer 2 — Tool-Specific
  ├── CLAUDE.md              → Claude Code
  ├── .github/copilot-instructions.md  → GitHub Copilot
  └── GEMINI.md              → Gemini CLI

Layer 3 — Procedural Skills (loaded on demand)
  └── skills/
      ├── estudeme-trail/SKILL.md   → manage learning trails
      ├── estudeme-cards/SKILL.md   → flashcard operations
      ├── estudeme-quiz/SKILL.md    → quiz generation and review
      └── estudeme-ingest/SKILL.md  → ingest content from external sources
```

Each layer is loaded at the right moment, not all at once. An agent helping create a flashcard does not need to load the quiz skill. This **progressive disclosure of context** is what allows the system to scale without overloading the agent's context window.

### The Five Types of Context

Each layer provides a different type of context the agent needs:

| Type | What it answers | Where it lives |
|---|---|---|
| **Identity** | "Where am I? How does this project work?" | `CLAUDE.md` / `AGENTS.md` |
| **Constraints** | "What must I NEVER do?" | `CLAUDE.md` / `AGENTS.md` |
| **Procedural** | "How do I execute this specific operation?" | `skills/*/SKILL.md` |
| **State** | "What decisions were already made?" | `docs/` ADRs and memory files |
| **Temporary** | "What is open right now? What is the current task?" | Managed automatically by the agent tool |

### How Skills Work

A skill is a unit of procedural knowledge loaded on demand. Think of it as an operations runbook: the agent does not read it every session — only when it needs to perform that specific operation.

```markdown
---
name: estudeme-trail
description: "Manage learning trails in an EstudeMe vault. Use when the user asks to
create, list, update, or check the status of a trail. Not for card or quiz operations."
---

# Skill: estudeme-trail

## Step 1: Identify the operation
- [ ] Determine if the user wants to create, list, or check status of a trail

## Step 2: Execute the CLI command
- [ ] `estudeme trail create --title "..." --level beginner|intermediate|advanced`
- [ ] Confirm the file was created in the vault

## Step 3: Report result
- [ ] Show the user the created trail frontmatter
```

The agent loads the frontmatter description for all available skills. When the task matches, it loads the full body. This is **progressive disclosure**: only the needed context enters the window.

### The Anti-Duplication Principle

Every rule has exactly one source of truth. All other files reference it — never duplicate it.

If a constraint lives in `CLAUDE.md`, the `AGENTS.md` does not repeat the constraint — it points to `CLAUDE.md`. When you need to update the rule, you update it in one place.

### The Constraint Skill

At Stage 3, there is a `enforce-boundary` constraint-skill that the agent runs before finalizing any change. It checks that the output respects the vault schema, frontmatter types, and CLI conventions — architectural violations are caught by the agent itself, not in a code review.

---

## Development Workflow (TDD)

```
write failing test → minimal implementation → passing test → commit
```

Each TDD cycle can be its own commit. Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `test:`, `refactor:`.

**Commands:**

```bash
pnpm build        # build all packages
pnpm test         # run all tests
pnpm lint         # ESLint
pnpm typecheck    # TypeScript type check
```

---

## Open-Core Model

| Layer | License |
|---|---|
| Core Lib + CLI + Skills + Obsidian Plugin | Open source (MIT) |
| Web App (SaaS) + B2B API | Proprietary |

The vault always belongs to the user: open data, Markdown format, portable.

---

## License

MIT
