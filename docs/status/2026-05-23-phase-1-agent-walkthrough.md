# Phase 1 — Agent Walkthrough

**Date:** 2026-05-23
**Vault:** `/tmp/walkthrough-vault` — scaffolded via `estudeme init` and populated with two trails (Java Spring Foundations, AWS Solutions Architect), each with one module, two notes, and two or three cards. The default `_templates/` directory created by `init` was left in place so the walkthrough exercises a vault as a real user receives it.
**Agent:** Claude Code (Opus 4.7) — _to be filled in by walkthrough runner_

## Summary

_One paragraph after the walkthrough runs. Note which skills triggered correctly, which under-triggered, which over-triggered, and any rough edges in the synthesis quality._

## Walkthrough

### Prompt 1: "What trails do I have here?"

- **Expected skill:** `list-trails`
- **Expected CLI:** `estudeme trail list`
- **Skill loaded:** list-trail
- **Response:** 
---
	You have 2 trails in /tmp/walkthrough-vault:

	  - AWS Solutions Architect — intermediate, active. SAA-C03 cert prep.
	  - Java Spring Foundations — intermediate, active. Spring Boot core concepts.

	  (Listed directly from Trails/ since the estudeme CLI isn't installed here.)

	✻ Baked for 16s
	❯ Que trilhas nós temos aqui?

	Você tem 2 trilhas em /tmp/walkthrough-vault:
	  - AWS Solutions Architect — intermediário, ativa. Preparação para a certificação SAA-C03.
	  - Java Spring Foundations — intermediário, ativa. Conceitos fundamentais do Spring Boot.
 ---

- **Assessment:** correct 

### Prompt 2: "How is my Java Spring Foundations trail going?"

- **Expected skill:** `inspect-trail`
- **Expected CLI:** `estudeme trail status "Java Spring Foundations"`
- **Skill loaded:** inspect-trail
- **Response:** _paste or summarize_
---
	● Java Spring Foundations — status: active

	  - Modules: 1 (Spring Boot Basics — in-progress)
	  - Notes: 2 (Bean lifecycle, Dependency injection)
	  - Cards: 2 (DI vs IoC, What is a Spring Bean)

	  You've got the foundational notes covered (bean lifecycle + DI), but the trail itself only lists a
	  single module so far. Next natural step would be a second module — application context /  configuration would round out the "mental model" goal stated in the trail.
---	 

- **Assessment:** correct

### Prompt 3: "List my cards."

- **Expected skill:** `list-cards`
- **Expected CLI:** `estudeme cards list`
- **Skill loaded:** list-cards
- **Response:**
---
	You have 3 cards:

	  AWS Solutions Architect (1)
	  - CIDR notation — basic, difficulty 2 (from Networking Primer / VPC fundamentals)

	  Java Spring Foundations (2)
	  - What is a Spring Bean — basic, difficulty 2 (from Spring Boot Basics / Bean lifecycle)
	  - DI vs IoC — basic, difficulty 3 (from Spring Boot Basics / Dependency injection)
---
- **Assessment:** correct

### Prompt 4: "Export the cards as cards.json."

- **Expected skill:** `export-cards`
- **Expected CLI:** `estudeme cards export --output cards.json`
- **Skill loaded:** export-cards
- **Response:** 
---

❯ Export the cards as cards.json

● Skill(export-cards)
  ⎿  Successfully loaded skill

● I'll export cards from the vault at /tmp/walkthrough-vault to cards.json in the current
  directory.

● Bash(estudeme cards export /tmp/walkthrough-vault --out cards.json; echo "EXIT: $?")
  ⎿  error: required option '-o, --output <path>' not specified
     EXIT: 1

● The CLI uses -o/--output, not --out. Let me correct that:

● Bash(estudeme cards export /tmp/walkthrough-vault --output cards.json; echo "EXIT: $?")
  ⎿  ✓ 4 cards exported to cards.json
     EXIT: 0

  Listed 1 directory (ctrl+o to expand)

● Exported 4 cards to cards.json (1.8K, current directory).

  Note: the skill documented the flag as --out, but the actual CLI expects -o/--output — I
   used the correct one. Verify with cat cards.json or open it directly; it's ready for
  Anki import.
---
- **Assessment:** correct

### Prompt 5: "Validate the vault."

- **Expected skill:** `validate-vault`
- **Expected CLI:** `estudeme validate`
- **Skill loaded:** validate-vault
- **Response:** 
---
❯ Validate the vault

● Skill(validate-vault)
  ⎿  Successfully loaded skill

● Bash(estudeme validate /tmp/walkthrough-vault; echo "EXIT: $?")
  ⎿  Vault: /tmp/walkthrough-vault

     Summary: 15 documents, 0 errors, 0 warnings, 0 broken links
     EXIT: 0

● Vault is healthy. ✓

  15 documents scanned — 0 errors, 0 warnings, 0 broken links. No frontmatter issues, no
  broken wikilinks.
---
- **Assessment:** correct

### Prompt 6: "Show me the metrics."

- **Expected skill:** `report-metrics`
- **Expected CLI:** `estudeme metrics show`
- **Skill loaded:** report-metrics
- **Response:** 
---
● Skill(report-metrics)
  ⎿  Successfully loaded skill

● Bash(estudeme metrics show /tmp/walkthrough-vault; echo "EXIT: $?")
  ⎿  📊 EstudeMe Dashboard
     Vault: /tmp/walkthrough-vault
     … +14 lines (ctrl+o to expand)

● Here are your vault metrics:

  Totals

  ┌───────────┬───────┐
  │   Type    │ Count │
  ├───────────┼───────┤
  │ Trails    │ 3     │
  ├───────────┼───────┤
  │ Modules   │ 3     │
  ├───────────┼───────┤
  │ Notes     │ 4     │
  ├───────────┼───────┤
  │ Cards     │ 4     │
  ├───────────┼───────┤
  │ Quizzes   │ 1     │
  ├───────────┼───────┤
  │ Exams     │ 0     │
  ├───────────┼───────┤
  │ Resources │ 0     │
  └───────────┴───────┘

  Per-trail progress — all three trails are at 0%:
  - AWS Solutions Architect
  - Java Spring Foundations
  - My Trail

  A couple of things stand out: with 3 trails but only 3 modules and 4 notes total, the
  content is thin and spread across tracks — and every trail is showing 0% completion. If
  you'd like, I can inspect a specific trail to see where the gaps are, or help scaffold
  modules/notes into one of them.
---
- **Assessment:** correct

### Prompt 7: "Give me a complete overview of this vault."

- **Expected skill:** `review-vault-state` (meta — should orchestrate `validate-vault` → `list-trails` → `report-metrics`)
- **Skill loaded:** review-vault-state
- **Response:** 
---
❯ Give me a complete overview of this vault

● Skill(review-vault-state)
  ⎿  Successfully loaded skill

● I already have fresh validation (healthy, 0 issues) and metrics from moments ago. The
  missing piece is the trail catalog with levels/statuses — let me get that.

● Bash(estudeme trails list /tmp/walkthrough-vault 2>&1 || estudeme list-trails
      /tmp/walkthrough-vault 2>&1; echo "EXIT: $?")
  ⎿  error: unknown command 'trails'
     (Did you mean trail?)
     error: unknown command 'list-trails'
     EXIT: 1

● Bash(estudeme --help 2>&1; echo "==="; estudeme trail --help 2>&1)
  ⎿  Usage: estudeme [options] [command]

     EstudeMe — self-directed learning vault CLI
     … +26 lines (ctrl+o to expand)

● The command is estudeme trail list. Let me get the trail catalog:

● Bash(estudeme trail list /tmp/walkthrough-vault; echo "EXIT: $?")
  ⎿  ┌─────────────────────────┬────────────────────┬─────────┬───────┬───────┐
     │ Trail                   │ Progress           │ Modules │ Notes │ Cards │
     ├─────────────────────────┼────────────────────┼─────────┼───────┼───────┤
     … +7 lines (ctrl+o to expand)

● Vault Overview — /tmp/walkthrough-vault

  Health: Vault is healthy. 15 documents scanned — 0 errors, 0 warnings, 0 broken
  wikilinks.

  Catalog: 3 trails spanning 3 modules, 4 notes, and 4 cards (plus 1 quiz; no exams or
  resources yet). All three trails sit at 0% progress — every module is still unstarted
  (0/1 each).

  Per-trail breakdown:
  - Java Spring Foundations — the most developed trail: 2 notes, 2 cards across its single
   module (0/1 started).
  - AWS Solutions Architect — lightly seeded: 1 note, 1 card (0/1 started).
  - My Trail — empty scaffold: 0 notes, 0 cards. Looks like a placeholder from estudeme
  init.

  Suggested next step: Java Spring Foundations has the most material already in place —
  completing its one module would give you your first non-zero trail and validate the
  workflow end to end. Separately, My Trail is an empty placeholder; consider renaming it
  to a real topic or removing it to keep the catalog meaningful.
 ---
- **Assessment:** pode melhorar

### Prompt 8 (recovery): "Show me the trail called FoobarThatDoesNotExist."

- **Expected behavior:** agent runs `inspect-trail`, surfaces the not-found error, and suggests `list-trails`.
- **Skill loaded:** inspect-trail
- **Response:** 
---
Show me the trail called FoobarThatDoesNotExist

● Skill(inspect-trail)
  ⎿  Successfully loaded skill

● Bash(estudeme trail status /tmp/walkthrough-vault "FoobarThatDoesNotExist"; echo "EXIT:
      $?")
  ⎿  Trail not found: /tmp/walkthrough-vault
     EXIT: 1

● That trail doesn't exist in the vault. The CLI returned "Trail not found" (exit 1).

  The three available trails are:
  - AWS Solutions Architect
  - Java Spring Foundations
  - My Trail

  Did you mean one of these? Tell me which and I'll pull its status.
---
- **Assessment:** correct

## Issues found

- `review-vault-state` paraphrased the totals table into prose and dropped the rendered table from its output (Prompt 7). It also guessed wrong CLI command names (`estudeme trails list`, `estudeme list-trails`) before falling back to `estudeme --help` to discover the right form.
- `export-cards/SKILL.md` documented the output flag as `--out`, but the actual CLI flag is `--output` / `-o`. The agent self-corrected at runtime (Prompt 4), but every future agent run would hit and recover from the same error.
- Known Phase-0 issue surfaced during fixture prep (not introduced by Phase 1): `estudeme init` writes a `_templates/` directory that the parser walks as real content, so vaults end up with phantom trails / modules / cards. Recommended as a follow-up for Phase 2.

## Decisions

Two fixes applied in this session before opening the Phase 1 PR:

- **Commit `d96df18`** — `review-vault-state` now lists the exact CLI command alongside each sub-skill reference (so agents do not need to re-derive command names), requires the totals and trails tables to appear verbatim in the synthesis, and updates the worked example to show the expected layout. The internal label mismatch (Step 1 was labeled `list-trails` but linked to `validate-vault`) was also fixed in the same commit.
- **Commit `7a21c79`** — `export-cards/SKILL.md` now documents the flag as `--output`, matching the CLI.

The `_templates/` phantom-content issue is deferred to a Phase 2 follow-up; it predates Phase 1 and is out of scope for the skills architecture work.

## Next steps

- Re-run Prompt 7 in a future walkthrough (Phase 2 entry) to confirm the meta-skill now keeps the metrics and trail tables in its output.
- File a Phase 2 issue for the `_templates/` walker behavior.
