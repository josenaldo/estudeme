---
name: inspect-trail
description: "Shows detailed progress and status for a specific trail in an EstudeMe vault: modules covered, notes per module, completion percentage. Use when the user asks 'how is my trail X', 'status of trail X', 'progress on the Java trail'. Don't use to list multiple trails — use list-trails."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: Inspect Trail

## Instructions

### Step 1: Gather inputs

- [ ] Confirm two pieces of information with the user: the vault path and the
      trail title (the value of the `title` field in the trail's frontmatter).
- [ ] If the user mentions the trail without a title (e.g., "my Java trail"),
      run `estudeme trail list <vault>` first to find the exact title.

### Step 2: Run the CLI

- [ ] Execute: `estudeme trail status <vault-path> "<trail-title>"`
- [ ] Quote the trail title — it likely contains spaces.

### Step 3: Report back

- [ ] On success: present the progress summary (modules completed, total
      notes, percent done) plus any next-step suggestions the CLI emits.
- [ ] On failure: surface the error and propose a fix (e.g., trail not found
      → check title spelling via `list-trails`).

## Critical

- Read-only skill. Never run commands that write to the vault.
- Always quote the trail title in the CLI call.

## Examples

### Example 1: Direct status

User says: "How is my Java Backend trail going in `~/study/my-vault`?"

Actions:
- Run `estudeme trail status ~/study/my-vault "Java Backend"`
- Receive the progress data
- Present completion percentage, modules done, and notes count

Result: User sees a clear progress summary.

### Example 2: Title disambiguation

User says: "Show me my Kubernetes progress" (vault path known, title approximate).

Actions:
- Run `estudeme trail list <vault>` to find the exact title
- Confirm the match with the user if multiple candidates exist
- Run `estudeme trail status <vault> "<exact-title>"`

Result: Status shown for the right trail, no ambiguity.

## Troubleshooting

**Error: `Trail not found`**
- Cause: title misspelled or trail does not exist.
- Solution: run `estudeme trail list <vault>` to see the available titles
  and re-run with the correct one.

**Error: `Cannot find vault directory`**
- Cause: bad vault path.
- Solution: confirm with the user; verify with `ls`.

## Performance Notes

- One CLI call per trail. Do not loop to "discover" trails — use `list-trails`
  for that and pass the exact title back here.
