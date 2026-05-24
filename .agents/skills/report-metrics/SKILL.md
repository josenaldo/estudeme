---
name: report-metrics
description: "Reports vault-wide metrics in an EstudeMe vault: trail count, module count, notes per trail, cards per trail, overall structure summary. Use when the user asks 'show vault metrics', 'how is my progress overall', 'give me numbers on my vault'. Don't use to inspect a single trail — use inspect-trail."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: Report Metrics

## Instructions

### Step 1: Confirm vault path

- [ ] Ask the user for the vault path if not provided.

### Step 2: Run the CLI

- [ ] Execute: `estudeme metrics show <vault-path>`
- [ ] Capture stdout and exit code.

### Step 3: Report

- [ ] Present the metrics. Lead with the top-level numbers (trails, modules,
      notes, cards) and then per-trail breakdowns if the user asked for
      "overall" rather than a specific trail.
- [ ] If a metric stands out (e.g., a trail with zero notes), call it out
      gently as a suggestion ("the Kubernetes trail has no notes yet — want
      to scaffold a module?").

## Critical

- Read-only skill. Never modify the vault to "improve" metrics.

## Examples

### Example 1: Overall metrics

User says: "Show me the metrics for `~/study/my-vault`."

Actions:
- Run `estudeme metrics show ~/study/my-vault`
- Present the structured output

Result: User sees totals (trails, modules, notes, cards) and per-trail
breakdowns.

## Troubleshooting

**Error: `Cannot find vault directory`**
- Cause: bad path.
- Solution: confirm with the user.

**Metrics show zero everything**
- Cause: vault is empty or has no documents with valid frontmatter.
- Solution: suggest the user run `validate-vault` to confirm the vault has
  the expected documents.

## Performance Notes

- One CLI call. Fast for typical vaults.
