# CLAUDE.md

Instructions for AI agents working in this repository.

## Commits

- **Never** sign commits with `Co-Authored-By: Claude` or any other AI-assistant signature. Commits must reflect human authorship of the project.
- **All commit messages in English.** Use Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, `test:`, `refactor:`.
- Prefer small, frequent commits. Each TDD cycle (failing test → minimal impl → passing test) can be a commit.

## Language

- **All documentation in English**: README, specs, plans, ADRs, inline docs.
- Code, identifiers, function names, type names: English.
- Conversation with the user can be in Portuguese (PT-BR).

## Development Standards

- TDD: write failing test → minimal implementation → passing test → commit.
- Scale response size to the task — don't over-engineer.
- Follow the existing monorepo structure and patterns.

## References

- Spec: `docs/superpowers/specs/2026-04-14-estudeme-design.md`
- Phase 0 plan: `docs/superpowers/plans/2026-04-14-fase-0-fundacao.md`
