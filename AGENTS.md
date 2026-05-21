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
