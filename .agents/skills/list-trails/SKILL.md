---
name: list-trails
description: "Lists all trails (learning tracks) in an EstudeMe vault. Use when the user asks 'what trails do I have', 'list my trails', 'show me my trails', or wants an overview of their learning tracks. Don't use for progress detail on a specific trail — use inspect-trail."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: List Trails

## Instructions

### Step 1: Confirm the vault path

- [ ] If the user has not stated the vault path, ask for it. The vault is a
      directory of Markdown notes with EstudeMe frontmatter.
- [ ] Verify the directory exists. If not, surface the error and stop.

### Step 2: Run the CLI

- [ ] Execute: `estudeme trail list <vault-path>`
- [ ] Capture stdout and the exit code.

### Step 3: Report back

- [ ] On success (exit 0): present each trail with its title, level, and
      status. Keep the output compact.
- [ ] On failure: surface the error and suggest `estudeme validate <vault-path>`
      to diagnose.

## Critical

- This skill is read-only. Never invoke any command that writes to the vault.
- Never assume the vault path. Always confirm it with the user.

## Examples

### Example 1: Direct listing

User says: "What trails do I have in `~/study/my-vault`?"

Actions:
- Run `estudeme trail list ~/study/my-vault`
- Receive the trail list
- Present each trail with level and status

Result: User sees the full list of trails.

### Example 2: Missing path

User says: "List my trails."

Actions:
- Ask: "Which vault directory should I list trails from?"
- Wait for the user to provide a path before proceeding.

Result: User specifies the path; skill proceeds as in Example 1.

## Troubleshooting

**Error: `Cannot find vault directory`**
- Cause: the path does not exist or is not a directory.
- Solution: confirm the path spelling with the user; verify it with `ls`.

**Error: `No trails found in vault`**
- Cause: the vault has no Markdown files with `type: trail` in frontmatter.
- Solution: the user may not have created trails yet (suggest `estudeme init`),
  or trails are present but malformed (suggest `estudeme validate <vault>`).

## Performance Notes

- Always pass the full vault path. The CLI does not auto-discover the vault.
