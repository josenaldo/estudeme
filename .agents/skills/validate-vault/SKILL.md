---
name: validate-vault
description: "Validates an EstudeMe vault: checks frontmatter against the schema for each document type and reports broken wikilinks. Use when the user asks 'validate my vault', 'check my vault', 'any broken links', 'is my vault healthy'. Don't use to inspect a specific trail's progress — use inspect-trail."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: Validate Vault

## Instructions

### Step 1: Confirm vault path

- [ ] Ask the user for the vault path if not provided.

### Step 2: Run the CLI

- [ ] Execute: `estudeme validate <vault-path>`
- [ ] Capture stdout (structured findings) and exit code.

### Step 3: Report

- [ ] If the validation reports zero errors and warnings: confirm "vault is
      healthy" and stop.
- [ ] If errors or warnings exist: group them by file, summarize the most
      common issue type, and propose concrete fixes (e.g., "three notes
      missing `type:` field — add `type: note` to their frontmatter").

## Critical

- Read-only skill. Never auto-fix issues without explicit user approval.
- The CLI returns exit 0 for clean and non-zero for issues found. Treat both
  as successful runs of the skill; the difference is what to report.

## Examples

### Example 1: Clean vault

User says: "Validate `~/study/my-vault`."

Actions:
- Run `estudeme validate ~/study/my-vault`
- Output reports zero issues

Result: Confirm to the user: "Vault is healthy. No frontmatter errors or
broken wikilinks found."

### Example 2: Issues found

User says: "Any broken links in my vault?"

Actions:
- Run `estudeme validate ~/study/my-vault`
- Output reports 3 broken wikilinks in 2 files

Result: Present each broken link with the file path and the target that
could not be resolved. Suggest the user check the target name or create
the missing note.

## Troubleshooting

**Error: `Cannot find vault directory`**
- Cause: wrong path.
- Solution: confirm with the user.

**Validation hangs on a large vault**
- Cause: very large vault (thousands of files).
- Solution: wait — the parser is single-pass. If it truly hangs, ask the
  user to confirm the vault size and file the issue.

## Performance Notes

- Validation walks every Markdown file. For vaults under 1000 files, it
  completes in well under a second.
