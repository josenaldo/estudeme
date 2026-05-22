---
name: review-vault-state
description: "Gives a complete state overview of an EstudeMe vault by orchestrating validation, trail listing, and metrics into a single coherent report. Use when the user asks 'how is my vault', 'give me an overview', 'state of my study system', 'review my vault'. Don't use for a single trail — use inspect-trail."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
metadata:
  type: meta-skill
---

# Skill: Review Vault State (Meta-Skill)

## Quando usar

- The user asks for a global view of their vault state.
- The user is starting a study session and wants to see where they stand.
- The user wants to share a vault status report with someone else.

## Inputs necessários

- The vault path.

## Workflow (execute nesta ordem)

### 1. Validate the vault

→ **Use skill:** [list-trails](../validate-vault/SKILL.md)

Confirm the vault is well-formed before reading further. If validation
surfaces errors that would distort the rest of the report (missing types,
broken wikilinks), surface them first and ask the user whether to proceed
or fix the issues first.

### 2. List the trails

→ **Use skill:** [list-trails](../list-trails/SKILL.md)

Get the catalog of trails with their levels and statuses. Keep the output
in memory — it feeds the synthesis step.

### 3. Report the vault metrics

→ **Use skill:** [report-metrics](../report-metrics/SKILL.md)

Get the top-level counts and per-trail breakdowns.

### 4. Synthesize into a single report

Combine the results from steps 1, 2, and 3 into a single prose summary with
this structure:

- **Health line:** "Vault is healthy" or "Vault has N issues (see below)".
- **Catalog line:** "X trails, Y modules total, Z notes, W cards".
- **Per-trail highlights:** for each trail, one line with the level, status,
  and rough progress hint (e.g., "Java Backend, intermediate, 4 of 6 modules
  in progress").
- **Suggested next step:** a single, concrete suggestion based on what the
  numbers reveal — e.g., the trail with the highest in-progress count, or a
  trail with broken wikilinks that should be fixed.

## Critical

- This meta-skill is read-only. It does not write to the vault.
- The final report must read as a single coherent narrative, not as three
  separate dumps from the underlying micro-skills.
- If `validate-vault` reports critical errors, stop after step 1 and surface
  them rather than proceeding to a metrics report on a broken vault.

## Examples

### Example 1: Healthy vault

User says: "Give me an overview of `~/study/my-vault`."

Actions:
- Run validate-vault: clean.
- Run list-trails: 3 trails (Java Backend, Kubernetes, English for Work).
- Run report-metrics: 14 modules, 47 notes, 22 cards.
- Synthesize.

Result: a paragraph like

> Vault is healthy. 3 trails covering 14 modules, 47 notes, and 22 cards.
> Java Backend (intermediate, active) has the most movement — 5 of 6 modules
> started. Kubernetes (beginner, active) has 2 modules but no cards yet.
> English for Work (intermediate, paused) is dormant.
>
> Suggested next step: finish the last Java Backend module to close that
> trail, or start drafting cards for Kubernetes.

## Troubleshooting

**A sub-skill fails partway through**
- Cause: vault path wrong, validation found blocking errors, or a CLI call
  errored.
- Solution: report the failure and stop. Do not continue to later steps with
  partial data; the synthesis would be misleading.

**The synthesis feels generic**
- Cause: the meta-skill is summarizing without using the specific data it
  collected.
- Solution: re-read the per-skill output and quote concrete numbers and
  trail names in the synthesis.

## Consulte também

- [list-trails](../list-trails/SKILL.md)
- [validate-vault](../validate-vault/SKILL.md)
- [report-metrics](../report-metrics/SKILL.md)
