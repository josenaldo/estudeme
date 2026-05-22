---
name: export-cards
description: "Exports flashcards from an EstudeMe vault into a neutral JSON file (suitable for Anki import). Use when the user asks 'export my cards', 'export cards to Anki', 'give me a card export', or wants to take cards out of the vault. Don't use to list cards in place — use list-cards."
license: MIT
compatibility: claude-code, gemini-cli, copilot, codex
---

# Skill: Export Cards

## Instructions

### Step 1: Gather inputs

- [ ] Confirm the vault path.
- [ ] Confirm the output file path. Default to `cards.json` in the current
      working directory if the user does not specify.

### Step 2: Run the CLI

- [ ] Execute: `estudeme cards export <vault-path> --out <output-file>`
- [ ] Capture exit code and any messages.

### Step 3: Confirm

- [ ] On success: report the output file path and the count of cards exported.
- [ ] Suggest the user verify the file (e.g., `wc -l <output>` or open it).

## Critical

- The export writes a new file outside the vault — it does not modify the vault.
- If the output file already exists, the CLI overwrites it. Warn the user
  before running if they did not explicitly ask for overwrite.

## Examples

### Example 1: Default location

User says: "Export my cards from `~/study/my-vault`."

Actions:
- Confirm the output path with the user: "Save as `cards.json` here?"
- Run `estudeme cards export ~/study/my-vault --out cards.json`
- Report the file path and card count

Result: A JSON file ready for Anki import or downstream tooling.

## Troubleshooting

**Error: `Permission denied: cannot write to <path>`**
- Cause: the output directory is not writable.
- Solution: ask the user for an alternate path.

**Error: `No cards to export`**
- Cause: vault has no `type: card` documents.
- Solution: nothing to export — confirm with the user that they expected cards.

## Performance Notes

- The export is fast for typical vaults (< 1000 cards). No batching needed.
