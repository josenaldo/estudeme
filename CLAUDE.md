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
