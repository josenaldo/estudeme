# EstudeMe

[![CI](https://github.com/josenaldo/estudeme/actions/workflows/ci.yaml/badge.svg)](https://github.com/josenaldo/estudeme/actions/workflows/ci.yaml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> An open-core study system for developers who need to learn constantly — for work, for certifications, for craft.

EstudeMe is built for the developer whose job demands continuous learning: someone moving between a new framework, a cloud certification, a foundational book, and a deep technical topic, often in the same week. The product treats this as the default state, not the exception.

The data lives in a plain Markdown vault with YAML frontmatter. The vault belongs to the user — portable, grep-able, version-controllable. EstudeMe is the system that turns that vault into a usable learning surface: validated structure, progress metrics, spaced repetition (planned), and integrations with the tools developers already use.

## Status

Phase 0 (Foundation) is **complete**. The core library and CLI exist and are tested end-to-end against a real Obsidian vault. The product is not yet packaged for end users — installation today means cloning this repository.

The roadmap below describes where this is going. Phase 0 is the foundation that makes the rest possible.

## Why this exists

Most study tools fall into one of two failure modes. The lightweight ones (note apps, flashcard apps) handle one piece of the workflow well but leave the orchestration to the user. The heavy ones (LMS, course platforms) impose a structure that does not survive contact with how a working developer actually learns.

EstudeMe takes a different starting point. The data format is Markdown with frontmatter — the same format developers already use for notes, READMEs, blog posts. The structure is opinionated where it has to be (typed documents: trails, modules, notes, cards, quizzes) and open everywhere else. The tooling sits on top of the vault, not around it.

The open-core model is deliberate. The data format and the engine that operates on it stay open and portable, so users never have to migrate out. The hosted SaaS surfaces (sync, web UI, collaboration) are the commercial layer. This split is documented in [ADR-0001](docs/decisions/0001-dual-goal-execution.md).

## How it works

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

`@estudeme/core` is a TypeScript library with zero coupling to Obsidian or any specific editor. It reads a vault, parses each document into a typed model (trail, module, note, card, quiz, exam, resource, performance), validates the structure, and exposes metrics and export operations.

`@estudeme/cli` is the first consumer of `core`. It provides commands to scaffold a vault, validate it, inspect trail progress, list and export cards, and report vault-wide metrics. It is the surface used by developers who live in the terminal — and by AI agents that need a stable, scriptable interface.

Future surfaces (Obsidian plugin, web app) consume the same core library. The vault is the contract; every surface honors it.

## Roadmap

| Phase | Goal                                                  | Status        |
| ----- | ----------------------------------------------------- | ------------- |
| 0     | Foundation — core library and CLI                     | Complete      |
| 1     | Agent skills layer (Claude Code, Copilot, Gemini)     | Next          |
| 2     | FSRS engine and interactive review loop               | Planned       |
| 3     | Obsidian plugin                                       | Gated         |
| 4     | Web app — Pro SaaS surface                            | Future        |
| 5     | Marketplace and community                             | Future        |

Phase 3 is **gated** — it will only start after Phase 0–2 show evidence of real use (CLI users, active issues, community signal). Building the Obsidian plugin is expensive and only earns its place once there is a pull for it. The criterion is documented in the [strategic context](docs/context/2026-05-01-strategic-context.md), premise P5.

The roadmap is scope-driven, not date-driven. A phase completes when the scope is done.

## Tech stack

| Layer        | Choice                                            |
| ------------ | ------------------------------------------------- |
| Language     | TypeScript 5                                      |
| Runtime      | Node.js 22+                                       |
| Monorepo     | Turborepo with npm workspaces                     |
| Build        | tsup                                              |
| Test         | Vitest                                            |
| CLI          | Commander.js                                      |
| Data parsing | gray-matter, js-yaml                              |
| Code quality | ESLint, Prettier                                  |
| CI           | GitHub Actions                                    |

The choices are deliberately boring for the layers that benefit from boring. The interesting parts are in the data model, the agent integration, and the FSRS engine — not in the build tooling.

A more detailed walkthrough lives in [ARCHITECTURE.md](ARCHITECTURE.md).

## Try it locally

The project is not yet published to npm. To try it in its current state:

```bash
git clone git@github.com:josenaldo/estudeme.git
cd estudeme
npm install
npm run build
npm run test
```

Once built, you can run the CLI against a sample vault:

```bash
# Scaffold a new vault
node packages/cli/dist/index.js init my-vault

# Validate a vault
node packages/cli/dist/index.js validate my-vault

# List trails and check status
node packages/cli/dist/index.js trail list my-vault
node packages/cli/dist/index.js trail status my-vault "My Trail"

# List and export cards
node packages/cli/dist/index.js cards list my-vault
node packages/cli/dist/index.js cards export my-vault --out cards.json

# Vault-wide metrics
node packages/cli/dist/index.js metrics show my-vault
```

A standalone, installable binary will arrive after Phase 1 (when there is something worth installing for an end user).

## Architecture

Three principles shape the architecture:

**Open data first.** The vault is plain Markdown with frontmatter. No proprietary format, no required database. A user can grep their vault, version it with git, edit it with any editor. EstudeMe is a layer on top, not a wrapper around.

**Core is agnostic.** `@estudeme/core` has zero Obsidian dependencies. The Obsidian plugin, when it ships, will be one consumer among several. The same is true for any future surface.

**Agent-native by design.** EstudeMe is built to be operated by AI agents (Claude Code, GitHub Copilot, Gemini) as a first-class interface, not an afterthought. The CLI is the stable contract; agents load procedural skills that map natural-language requests to CLI calls. The design follows a layered context model described in [ARCHITECTURE.md](ARCHITECTURE.md#agent-native-design).

## Contributing

Contributions are welcome once the project reaches a state where they can be meaningfully integrated (Phase 1+). For now, see [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, commit conventions, and the ADR process that governs non-trivial decisions.

## Decisions and context

Strategic premises and architectural decisions are tracked as documents in this repository, not implicit in the founder's head:

- [Strategic context](docs/context/2026-05-01-strategic-context.md) — the premises driving the product (audience, positioning, pricing model, release gates).
- [docs/decisions/](docs/decisions/) — Architecture Decision Records (ADRs).
- [Design doc](docs/superpowers/specs/2026-04-14-estudeme-design.md) — the long-form product and architecture document.
- [Phase 0 plan](docs/superpowers/plans/2026-04-14-phase-0-foundation.md) — the implementation plan that produced this foundation.

## License

[MIT](LICENSE). The open parts of EstudeMe (core library, CLI, future plugin and skills) are MIT-licensed and will stay that way. Any future hosted SaaS surfaces are a separate concern with separate licensing.
