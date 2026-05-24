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

→ **Use skill:** [validate-vault](../validate-vault/SKILL.md)
→ **CLI:** `estudeme validate <vault-path>`

Confirm the vault is well-formed before reading further. If validation
surfaces errors that would distort the rest of the report (missing types,
broken wikilinks), surface them first and ask the user whether to proceed
or fix the issues first.

### 2. List the trails

→ **Use skill:** [list-trails](../list-trails/SKILL.md)
→ **CLI:** `estudeme trail list <vault-path>`

Get the catalog of trails with their levels and statuses. Keep the full
table output in memory — it feeds the synthesis step verbatim.

### 3. Report the vault metrics

→ **Use skill:** [report-metrics](../report-metrics/SKILL.md)
→ **CLI:** `estudeme metrics show <vault-path>`

Get the top-level counts and per-trail breakdowns. Keep the totals table and
per-trail progress block verbatim — they feed the synthesis step.

### 4. Synthesize into a single report

Combine the results from steps 1, 2, and 3 into a single coherent report.
Tables and rendered output from the underlying CLI must be preserved as-is —
do **not** summarize them away. Use this structure:

- **Header:** `Vault Overview — <vault-path>`.
- **Health line:** "Vault is healthy" or "Vault has N issues (see below)";
  if there are issues, list them as bullets.
- **Totals table:** include the totals table from `estudeme metrics show`
  verbatim (the box-drawn table with Trails / Modules / Notes / Cards /
  Quizzes / Exams / Resources counts). Do not collapse it into prose.
- **Trails table:** include the trail table from `estudeme trail list`
  verbatim (the box-drawn table with Trail / Progress / Modules / Notes /
  Cards columns). Do not collapse it into bullets.
- **Per-trail highlights:** one short paragraph per trail with the level,
  status, and a one-line read of the numbers (e.g., "Java Backend,
  intermediate, 4 of 6 modules in progress — strongest movement"). This is
  prose that complements the table, not a replacement for it.
- **Suggested next step:** a single, concrete suggestion based on what the
  numbers reveal — e.g., the trail with the highest in-progress count, or a
  trail with broken wikilinks that should be fixed.

## Critical

- This meta-skill is read-only. It does not write to the vault.
- The final report must include the rendered tables from the underlying
  CLI verbatim — never paraphrase a table into prose, and never drop a
  table because "earlier output already covered it". If a previous prompt
  in the session already produced the table, re-run the command anyway so
  the synthesis is self-contained.
- The report should still read as one coherent document — tables flow with
  the prose around them, they are not three separate dumps.
- If `validate-vault` reports critical errors, stop after step 1 and surface
  them rather than proceeding to a metrics report on a broken vault.

## Examples

### Example 1: Healthy vault

User says: "Give me an overview of `~/study/my-vault`."

Actions:
- Run `estudeme validate ~/study/my-vault` → clean (0 errors, 0 warnings).
- Run `estudeme trail list ~/study/my-vault` → keep the table.
- Run `estudeme metrics show ~/study/my-vault` → keep the totals table.
- Synthesize.

Expected result (note the tables are kept verbatim, prose surrounds them):

> **Vault Overview — ~/study/my-vault**
>
> **Health:** Vault is healthy. 63 documents scanned — 0 errors, 0 warnings,
> 0 broken wikilinks.
>
> **Totals**
>
> ```
> ┌───────────┬───────┐
> │   Type    │ Count │
> ├───────────┼───────┤
> │ Trails    │ 3     │
> │ Modules   │ 14    │
> │ Notes     │ 47    │
> │ Cards     │ 22    │
> │ Quizzes   │ 0     │
> │ Exams     │ 0     │
> │ Resources │ 0     │
> └───────────┴───────┘
> ```
>
> **Trails**
>
> ```
> ┌────────────────────┬────────────────────┬─────────┬───────┬───────┐
> │ Trail              │ Progress           │ Modules │ Notes │ Cards │
> ├────────────────────┼────────────────────┼─────────┼───────┼───────┤
> │ Java Backend       │ ███████████░░░ 83% │ 5/6     │ 28    │ 18    │
> │ Kubernetes         │ ░░░░░░░░░░░░░░  0% │ 0/2     │ 6     │ 0     │
> │ English for Work   │ ███████░░░░░░░ 47% │ 3/6     │ 13    │ 4     │
> └────────────────────┴────────────────────┴─────────┴───────┴───────┘
> ```
>
> **Per-trail highlights:**
> - **Java Backend** — intermediate, active. Strongest movement: 5 of 6
>   modules in progress.
> - **Kubernetes** — beginner, active. 2 modules but no cards yet.
> - **English for Work** — intermediate, paused. Dormant for now.
>
> **Suggested next step:** finish the last Java Backend module to close that
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
