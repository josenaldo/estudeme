# ADR-0002: Agent skills architecture

**Date:** 2026-05-19
**Status:** Accepted
**Deciders:** Josenaldo

## Context

EstudeMe is designed to be operated by AI agents as a first-class interface. The Phase 0 foundation shipped the CLI; the agent layer between user intent and CLI invocation is the work of Phase 1. That layer needs a defined shape: where context lives for each tool, where skills live and how each tool discovers them, what format a skill takes, and how end users get the skills into their own setup.

Without a defined shape, each new skill drifts in format, each tool finds (or misses) skills differently, and the project loses the multi-tool consistency that is part of its agent-native positioning. The risk is not abstract — the AI tools in use (Claude Code, Gemini CLI, Copilot, Codex, Cursor) each have their own conventions, and ad-hoc accommodation produces duplication and drift.

The full design lives in [the design spec](../superpowers/specs/2026-05-19-skills-architecture-design.md). This ADR records the decision in short form.

## Decision

EstudeMe adopts a three-layer context architecture, with a single canonical location for skills and tool-specific bridges where needed.

**Layer 1 — universal:** `AGENTS.md` at the repository root is the source of truth for project identity, critical rules, the skill catalog, and pointers to other docs.

**Layer 2 — tool-specific:** `CLAUDE.md`, `GEMINI.md`, and `.github/copilot-instructions.md` each contain only the framing specific to their tool. None of them repeats rules from `AGENTS.md` — they reference it.

**Layer 3 — procedural:** Skills live in `.agents/skills/<name>/SKILL.md`. Codex, Cursor, and Gemini read this location natively. Claude Code and Copilot reach it through symlinks (`.claude/skills/` and `.github/skills/` respectively).

The Phase 1 catalog ships six micro-skills (`list-trails`, `inspect-trail`, `list-cards`, `export-cards`, `validate-vault`, `report-metrics`) and one meta-skill (`review-vault-state`). No constraint-skill in Phase 1, because the workflow is read-only; a constraint-skill enters in Phase 2 when card review starts writing performance notes.

Distribution to end users happens through a new CLI command, `estudeme skills install <vault>`, which copies the bundled skills into the user's vault and creates the symlinks. The CLI bundles the skills the same way it already bundles `templates/`.

## Consequences

**Easier:**
- A single place to add or change a skill. The same `.agents/skills/<name>/SKILL.md` reaches every tool.
- Critical rules live in one file. Updates do not need to be propagated to every L2 file.
- Adding a new tool later (e.g., another AI assistant) is a question of "does it read AGENTS.md or need a thin L2 file?", not a redesign.
- End users get a one-command install path that does not depend on cloning the repo.

**Harder:**
- Adding a skill requires updating two files: the skill itself and the catalog one-liner in `AGENTS.md`. Drift between them is possible.
- Symlinks need explicit setup and are not portable to Windows without WSL. Phase 1 documents WSL as the supported path.
- The `description` field of each skill becomes load-bearing — a poorly-written description means the agent silently fails to use the skill.

**New risks:**
- The meta-skill `review-vault-state` references three micro-skills by name. Renaming or removing a referenced micro-skill silently breaks the meta-skill until exercised by the E2E test.
- Distribution via CLI bundle assumes the user installs the npm package. Users who clone the repo and don't install the CLI need the documented manual path.

## Alternatives considered

**A. Per-tool skill directories with no canonical source** (e.g., `.claude/skills/`, `.gemini/skills/`, `.github/skills/` each with their own SKILL.md). Rejected: maximizes drift, multiplies maintenance, and contradicts the anti-duplication principle that drives this whole architecture.

**B. Single canonical without symlinks, relying on each tool to support a generic path.** Rejected: Claude Code and Copilot do not read `.agents/skills/` natively, so without symlinks they would not see the skills at all. Waiting for upstream support is unbounded.

**C. Skills as a separate npm package (`@estudeme/skills`)** instead of bundled with `@estudeme/cli`. Rejected for Phase 1 — the extra package machinery is not justified when there is one consumer and one distribution path. The decision can be revisited if the skill catalog grows large enough to warrant independent versioning.

**D. Defer the design and ship two skills (`estudeme-trail`, `estudeme-cards`) ad-hoc** per the original Phase 1 issues. Rejected: the design cost is small, the consistency benefit is large, and Phase 1 is the right moment to set the pattern before more skills land.

## References

- [Design spec — Agent Skills Architecture](../superpowers/specs/2026-05-19-skills-architecture-design.md)
- [Context Engineering guide](https://josenaldo.github.io/blog/context-engineering-guia-completo)
- [ADR-0001 — Dual-goal execution](0001-dual-goal-execution.md)
- [ARCHITECTURE.md — Agent-native design](../../ARCHITECTURE.md#agent-native-design)
