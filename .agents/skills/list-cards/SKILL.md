---
name: list-cards
description: "Lists all flashcards in an EstudeMe vault. Use when the user asks 'list my cards', 'what flashcards do I have', 'show me my cards', or wants a card inventory. Don't use to export cards to an external format — use export-cards."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: List Cards

## Instructions

### Step 1: Confirm vault path

- [ ] Confirm or ask for the vault path. Do not assume.

### Step 2: Run the CLI

- [ ] Execute: `estudeme cards list <vault-path>`
- [ ] Capture stdout and exit code.

### Step 3: Report

- [ ] On success: present the card list. If the count is large (> 30),
      summarize by trail or card-type rather than listing every card.
- [ ] On failure: surface the error message.

## Critical

- Read-only skill. Never modify cards or the vault.

## Examples

### Example 1: Direct listing

User says: "List the cards in `~/study/my-vault`."

Actions:
- Run `estudeme cards list ~/study/my-vault`
- Present the cards grouped by trail (if multiple trails exist)

Result: User sees the card inventory.

## Troubleshooting

**Error: `Cannot find vault directory`**
- Cause: wrong path.
- Solution: confirm with the user.

**No cards listed but the user expected some**
- Cause: notes exist but no `type: card` documents.
- Solution: suggest creating cards in the vault or running `estudeme validate`
  to verify card frontmatter.

## Performance Notes

- For very large vaults (> 100 cards), prefer summarizing over listing each.
