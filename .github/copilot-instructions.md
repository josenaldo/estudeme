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
