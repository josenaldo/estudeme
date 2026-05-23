# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Monorepo foundation: Turborepo, npm workspaces, TypeScript 5, tsup, Vitest, ESLint, Prettier.
- `@estudeme/core` package: base types and per-document types (trail, module, note, card, quiz, exam, resource, performance).
- `@estudeme/core` parser: YAML frontmatter, wikilinks, document parsing, vault walker with index by type and title.
- `@estudeme/core` validation: schema validation and broken-link detection.
- `@estudeme/core` metrics: trail progress.
- `@estudeme/core` export: card extraction to neutral JSON.
- `@estudeme/cli` package with commands `init`, `validate`, `trail list`, `trail status`, `cards list`, `cards export`, `metrics show`.
- CLI templates for trail, module, note, card, and quiz documents (used by `init`).
- GitHub Actions CI workflow running build, typecheck, lint, and test on pull requests.
- End-to-end validation against the `codex-technomanticus` Obsidian vault.
- Strategic context document (`docs/context/2026-05-01-strategic-context.md`).
- ADR-0001: Dual-goal execution (business product and portfolio asset).
- ADR template (`docs/decisions/0000-template.md`).
- Production README, CONTRIBUTING, ARCHITECTURE, CHANGELOG, LICENSE (MIT).
- Agent skills layer under `.agents/skills/` (canonical source): six micro-skills (`list-trails`, `inspect-trail`, `list-cards`, `export-cards`, `validate-vault`, `report-metrics`) and one meta-skill (`review-vault-state`).
- Three-layer context documentation: `AGENTS.md` as the universal source of truth, with `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md` as thin tool-specific pointers.
- `@estudeme/cli` `skills install <vault>` command — copies bundled skills into `<vault>/.agents/skills` and creates `.claude/skills` and `.github/skills` symlinks (with `--force` to overwrite).
- CLI prebuild step that bundles the canonical skills into the `@estudeme/cli` npm package.
- Catalog test that validates every skill's frontmatter (name, description) and required sections.
- ADR-0002: Skills architecture (three-layer context, single canonical source).

### Fixed

- Vault parser walker now skips `.agents/`, `.claude/`, and `.github/` directories, so installed agent skills are not flagged as malformed EstudeMe documents.
