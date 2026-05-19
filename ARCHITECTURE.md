# Architecture

This document describes how EstudeMe is structured, why the structure looks the way it does, and where to find what. It is a derivative of the [design document](docs/superpowers/specs/2026-04-14-estudeme-design.md), optimized for fast reading by someone landing on the repository cold.

For deeper context on the product decisions behind the architecture, see the [strategic context](docs/context/2026-05-01-strategic-context.md) and the [ADRs](docs/decisions/).

## Big picture

```
┌────────────────────────────────────────────────────┐
│                       User                          │
├──────────────────┬─────────────┬───────────────────┤
│       CLI        │  Obsidian   │   Web (future)    │
│  @estudeme/cli   │  Plugin     │                   │
│                  │  (planned)  │                   │
├──────────────────┴─────────────┴───────────────────┤
│                @estudeme/core                       │
│   parser · validation · metrics · export · FSRS    │
├────────────────────────────────────────────────────┤
│        Vault (Markdown + YAML frontmatter)          │
└────────────────────────────────────────────────────┘
```

Three layers, from bottom to top.

The **vault** is the source of truth. It is a directory of Markdown files with YAML frontmatter, owned and version-controlled by the user. EstudeMe never moves a vault into a proprietary store. Every operation reads from the vault, writes to the vault, or computes a derived artifact (a metric, an export, a report) from the vault.

The **core library** (`@estudeme/core`) is a TypeScript module that knows how to read, parse, validate, and operate on a vault. It has zero coupling to any specific editor or UI. The core does not know what Obsidian is. The core does not know what a CLI is. It exposes a stable API over the vault.

The **surfaces** are the things a user interacts with: a CLI (shipped in Phase 0), an Obsidian plugin (Phase 3), eventually a web app and other integrations. Each surface consumes the core library. The vault is the contract that ties them together.

## Layered design

### Why the core is agnostic

The core has no dependencies on Obsidian, on any editor, on any frontend framework. This is a deliberate constraint, not an accident of incomplete work.

Coupling the core to Obsidian would make the Obsidian plugin easier to build in the short term and impossible to escape in the long term. The product strategy depends on multiple surfaces (CLI, plugin, web, agents) reading the same vault with consistent semantics. The way to keep that promise is to put the semantics in one place — the core — and require every surface to go through it.

The cost is a small amount of indirection. A surface cannot reach into Obsidian internals to optimize a specific interaction. The benefit is that a vault parsed by the CLI and a vault parsed by the Obsidian plugin produce the same model, and any future surface inherits that consistency for free.

### Why the CLI is first-class

The CLI is not a thin wrapper around the core for power users. It is the primary scriptable interface for the entire system, used by humans in terminals and by AI agents that execute commands on their behalf.

This choice anticipates Phase 1 (agent skills). Agents need a stable contract — something they can call without parsing UI state, without managing windows, without dealing with editor lifecycles. A CLI with predictable arguments and structured output is that contract.

It also makes the system testable end-to-end. Every CLI command can be exercised in a script, against a fixture vault, in CI. The same is much harder to do for a UI.

### Why plugins are downstream

The Obsidian plugin, when it ships, will be one consumer of the core among several. It will not extend the core; it will use it. The plugin's job is to translate Obsidian-specific UI events into core API calls and to render core results in Obsidian-friendly views.

The same principle applies to any future surface. The web app does not own logic the CLI does not own. The MCP server does not invent new operations. The core is the place where behavior lives.

## Data model

### Frontmatter as contract

Every document in a vault declares what it is via its YAML frontmatter. The minimum requirement is a `type` field:

```yaml
---
type: trail
title: "Java Backend"
level: intermediate
---
```

The system finds content by `type`, not by file location. A user can organize folders however they want — by trail, by topic, by date — and the tooling still works. The frontmatter is the contract; the folder layout is convention.

This principle has practical consequences:

- `estudeme validate` checks that required fields are present and well-typed for each declared type.
- `estudeme trail status` filters all `type: note` documents that reference a given trail via `[[wikilinks]]`, regardless of where in the vault they live.
- New types can be added without changing the parser — only by extending the schema.

### Type catalog

The core ships with the V1 type catalog. Each type has a defined schema (required fields, optional fields, value constraints) enforced by validation.

| Type          | Purpose                                              |
| ------------- | ---------------------------------------------------- |
| `trail`       | A learning track, top-level container                |
| `module`      | A section within a trail                             |
| `note`        | An atomic concept written by the student            |
| `card`        | A flashcard (basic, cloze, vocab, scenario, pitfall) |
| `quiz`        | A multiple-question assessment                       |
| `exam`        | A timed mock test (e.g., certification practice)     |
| `resource`    | An external reference (book, video, course)          |
| `performance` | A system-generated record of a study session        |

Each type's full schema (required fields, defaults, validation rules) lives in `packages/core/src/types/` and is mirrored in the [design document](docs/superpowers/specs/2026-04-14-estudeme-design.md#3-data-model). The design doc is the long-form reference; the code is the source of truth.

The catalog is open: new types (atomic-note, cornell-note, code-kata, sprint, etc.) can be added without architectural changes. The design doc lists candidates for future expansion.

### Wikilinks as glue

Relationships between documents are expressed via Obsidian-style wikilinks: `[[Java Backend]]`. A note references the trail it belongs to; a module references its parent trail; a card references its source note.

The wikilink resolver is part of the core parser. It treats wikilinks as references by title, with the title derived from the frontmatter `title` field, the filename, or the heading — in that order. Broken wikilinks (pointing to a document that does not exist) are flagged by `estudeme validate`.

This keeps relationships portable. A user can rename a file, move it to a different folder, even export a subset of the vault, and the relationships continue to make sense as long as the titles match.

### Validation surface

`estudeme validate` is the single entry point for structural checks against a vault. It currently reports:

- Documents missing a `type` field.
- Documents whose frontmatter does not match the declared type's schema.
- Wikilinks pointing to non-existent documents.
- Documents in the vault that the parser cannot read at all.

The output is structured (JSON-friendly) so it can be consumed by CI, by editors, or by agents that need to react to validation failures programmatically.

## Agent-native design

EstudeMe is built to be operated by AI agents (Claude Code, GitHub Copilot, Gemini, MCP-compatible tools) as a first-class interface, not an afterthought. This shapes how the surfaces are designed and how the documentation is organized.

### The problem with default AI integration

Most tools that add "AI features" treat the agent as a chat window over the product. The agent gets a system prompt, maybe a few function calls, and is expected to figure out the rest from scratch each session. The result is brittle: the agent does not know the project's conventions, asks the same setup questions repeatedly, and produces inconsistent results.

The alternative is **context engineering**: deliberately curating what the agent sees before it responds, so the environment supplies the context the agent needs to act correctly without re-explaining.

### Three context layers

EstudeMe organizes agent-facing context in three layers. Each layer is loaded at a different moment and answers a different question.

**Layer 1 — Universal.** Files at the repository root that any agent reads on every session. `CLAUDE.md`, `AGENTS.md`, and equivalents declare what the project is, its critical constraints, and its essential commands. This is the smallest layer — it must fit comfortably in every session.

**Layer 2 — Tool-specific.** Each AI tool has its own conventions and its own file: `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI. These files reference Layer 1; they do not duplicate it.

**Layer 3 — Procedural skills.** Files in `skills/` that describe how to execute specific operations: `estudeme-trail/SKILL.md`, `estudeme-cards/SKILL.md`, etc. An agent loads a skill only when the task matches it. This is **progressive disclosure**: the context an agent needs to create a flashcard does not enter the window when the user is just listing trails.

The skills layer is planned for Phase 1. The universal and tool-specific layers exist today.

### Why a CLI under the agent

Every skill ultimately calls the CLI. The agent does not invent new operations; it translates natural language into CLI calls and presents the result. This pattern has two properties worth keeping:

- The same operation produces the same outcome regardless of which agent invoked it. Behavior lives in the CLI, not in the prompt.
- A skill is testable. The skill describes which CLI calls to make and how to interpret the output. A test can exercise the same path.

The full reasoning, with examples, is in the [context engineering article](https://josenaldo.github.io/blog/context-engineering-guia-completo) that informs this design.

## What is intentionally NOT in the stack

A list of choices that are easier to misread as omissions than as deliberate decisions.

**No database.** The vault is the source. Adding a database would require synchronization, migrations, and a story for users who want to take their data and go. None of those are worth their cost in V1. If query performance becomes a real problem, the answer is an index sidecar (a derived artifact, regenerable from the vault), not a database of record.

**No proprietary format.** Every artifact a user creates or imports is plain Markdown with frontmatter. Exports (Anki, JSON, CSV) are open formats. Lock-in is not a design choice.

**No course player UI in V1.** EstudeMe is not a Coursera. The system organizes and measures study; it does not stream lectures. A "study session" in V1 is a card review, a quiz, a metrics check — terminal-first in Phase 0–2, visual in Phase 3+.

**No backend service in Phase 0–3.** Everything runs locally. The CLI reads a local vault. The plugin reads a local vault. There is no server to deploy, no auth to manage, no costs to absorb. A hosted SaaS layer is Phase 4–5, when there is a product worth hosting.

**No payment surface in Phase 0–3.** Open-core means open until there is something worth paying for. A web app with Study Buddy, sync, and a marketplace earns the right to charge. A CLI with no FSRS engine does not.

**No bundled ingestion engine.** Ingesting external content (PDFs, videos, web pages) is the job of [LLM-knowledge-base](https://github.com/wendeus0/LLM-knowledge-base). EstudeMe will integrate with it as a downstream dependency in Phase 1+, not absorb it.

**FSRS, not SM-2.** When the spaced repetition engine arrives in Phase 2, it will be FSRS, not the older SM-2 algorithm used by Anki by default. FSRS has stronger evidence for retention quality and gives more headroom for the Study Buddy to make data-informed recommendations.

**No mobile app in V1.** Mobile is a separate product surface with its own constraints. The web app in Phase 4 will be mobile-responsive. A dedicated mobile app, if it ever ships, is post-Phase-5.

## Repository tour

A folder-by-folder map for navigating the code.

```
estudeme/
├── README.md              — project overview
├── ARCHITECTURE.md        — this document
├── CONTRIBUTING.md        — how to contribute
├── CHANGELOG.md           — release notes
├── LICENSE                — MIT
├── CLAUDE.md              — Claude Code instructions
├── package.json           — workspace root
├── turbo.json             — Turborepo build config
├── tsconfig.base.json     — shared TypeScript config
│
├── .github/
│   ├── workflows/         — CI definitions
│   ├── ISSUE_TEMPLATE/    — bug report, feature request
│   └── pull_request_template.md
│
├── packages/
│   ├── core/              — @estudeme/core
│   │   ├── src/
│   │   │   ├── types/         — type definitions and base types
│   │   │   ├── parser/        — frontmatter, wikilinks, document, vault
│   │   │   ├── validation/    — schemas and validate()
│   │   │   ├── metrics/       — trail progress
│   │   │   └── export/        — card extraction for Anki/JSON
│   │   └── tests/             — Vitest suites + fixture vault
│   │
│   └── cli/               — @estudeme/cli
│       ├── src/
│       │   ├── commands/      — init, validate, trail, cards, metrics
│       │   └── lib/           — vault loader, format helpers
│       ├── templates/         — files emitted by `init`
│       └── tests/             — command tests
│
└── docs/
    ├── context/           — strategic premises
    ├── decisions/         — ADRs (and template)
    ├── superpowers/
    │   ├── specs/         — long-form design documents
    │   └── plans/         — phase implementation plans
    └── status/            — phase status reports
```

The packages follow a uniform layout: `src/` with the source, `tests/` with the suites, `package.json`, `tsconfig.json`, `tsup.config.ts`, `vitest.config.ts`. Adding a new package follows the same shape.

## References

- [Design document](docs/superpowers/specs/2026-04-14-estudeme-design.md) — the long-form product and architecture document.
- [Phase 0 plan](docs/superpowers/plans/2026-04-14-phase-0-foundation.md) — the implementation plan that produced this foundation.
- [Strategic context](docs/context/2026-05-01-strategic-context.md) — the premises that drive product decisions.
- [docs/decisions/](docs/decisions/) — Architecture Decision Records.
- [Context engineering article](https://josenaldo.github.io/blog/context-engineering-guia-completo) — the agent-native design rationale.
