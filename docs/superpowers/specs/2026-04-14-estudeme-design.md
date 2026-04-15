# EstudeMe — Design Document

**Date:** 2026-04-14
**Status:** Draft (under review)
**Author:** Josenaldo de Oliveira Matos Filho

---

## 1. Identity and Vision

**Name:** EstudeMe (`estudeme.com` / `estudeme.com.br`)

**Tagline:** "Your study grimoire — organize trails, master content, measure progress."

### What it is

An open-core self-directed learning platform where a Markdown vault is the universal data format. The student is the protagonist — they create, organize, and study their own content. The tool removes mechanical work from the path and provides visibility on where the student is and where they are going.

### Audience (in priority order)

1. **Self-learner** — wants to learn on their own, needs structure and direction
2. **Teacher** — wants to generate study materials for students and publish them as a site
3. **Expert / Creator** — a self-learner who succeeded and now shares or sells curated vaults

### Foundational Principle: Student-First

The product serves the student first. Content creators are self-learners who succeeded — they don't need separate authoring tools because the curated vault is a natural artifact of studying. The marketplace emerges organically: whoever studied well already has content to share. This solves the cold-start problem and guarantees content legitimacy.

### Open-Core Model

- **Open:** core library + CLI + skills + Obsidian plugin
- **Closed:** web app (SaaS with free/pro/max tiers) + B2B API
- **Vault always belongs to the user:** open data, Markdown format, portable

### Differentiator vs. existing tools

Existing Obsidian plugins (obsidian-spaced-repetition, flashcards-obsidian, quiz-generator) do isolated things. **None integrates learning analytics with study orchestration** — trail progress, topic retention, next-step recommendations, and most importantly the **Study Buddy**: a conversational, context-aware study chat that understands the vault and the student's performance.

---

## 2. Architecture

**Approach:** Core Lib + multiple frontends.

```
┌─────────────────────────────────────────────────┐
│                     User                         │
├──────────┬──────────┬──────────┬────────────────┤
│ Obsidian │   CLI    │  Skills  │   Site/Web     │
│  Plugin  │          │  (.md)   │   (future)     │
├──────────┴──────────┴──────────┴────────────────┤
│              Core Lib (TypeScript)               │
│  ┌─────────┬──────────┬─────────┬─────────────┐ │
│  │ Vault   │ Spaced   │ Metrics │  Content    │ │
│  │ Parser  │ Rep(FSRS)│ Engine  │  Generator  │ │
│  └─────────┴──────────┴─────────┴─────────────┘ │
├─────────────────────────────────────────────────┤
│           Vault (Markdown + Frontmatter)         │
└─────────────────────────────────────────────────┘
```

### Layers

**Core Lib** (TypeScript, agnostic) — does not depend on Obsidian. Modules:

- **Vault Parser** — walks the vault, indexes by frontmatter, resolves wikilinks
- **Spaced Repetition Engine** — FSRS algorithm, review scheduling
- **Metrics Engine** — progress per trail/module, scores, retention
- **Content Generator** — templates for cards, quizzes, notes (no AI — AI belongs to the user)

**CLI** — first-class, not an afterthought:

- `estudeme init` — initialize vault with structure and templates
- `estudeme trail list/create/status` — manage trails
- `estudeme cards generate/review/export` — flashcards
- `estudeme quiz generate/run` — quizzes
- `estudeme metrics show` — progress dashboard
- `estudeme site build/publish` — generate site from vault
- `estudeme ingest` — delegates to KB when available

**Skills** — `.md` files that teach agents (Claude Code, Gemini, Copilot) how to use the CLI.

**Obsidian Plugin** — visual frontend, calls the core lib directly.

**MCP Server** — exposes study tools to any MCP-compatible agent.

**Site/Web** (future) — another frontend using the core lib or the API.

### KB Integration (Wendel)

LLM-knowledge-base (github.com/wendeus0/LLM-knowledge-base) is the recommended ingestion engine. MIT, Python, 223 tests, 96% coverage. Pipeline: ingest → compile → Q&A → heal/lint. Output is Markdown with wikilinks.

**Three levels of integration:**

1. KB as documented upstream
2. A skill that orchestrates KB + EstudeMe
3. `estudeme ingest` delegates to KB when installed

No plan to internalize ingestion. If other systems emerge later, discuss an interoperability standard.

---

## 3. Data Model

**Principle:** frontmatter as contract, templates as convenience. The plugin/CLI finds content by metadata, not by location. Users organize folders however they want.

### Core Types (MVP)

**Trail**

```yaml
---
type: trail
title: "Java Backend"
description: "From zero to deploy"
level: intermediate        # beginner | intermediate | advanced
prerequisites: []          # wikilinks to other trails
tags: [java, backend]
status: active             # active | completed | paused
created: 2026-04-14
---
```

**Module**

```yaml
---
type: module
title: "Java Fundamentals"
trail: "[[Java Backend]]"
order: 1
status: in-progress
---
```

**Note**

```yaml
---
type: note
title: "Primitive Types in Java"
trail: "[[Java Backend]]"
module: "[[01 - Java Fundamentals]]"
difficulty: 1
tags: [java, fundamentals]
---
```

**Card (flashcard)**

```yaml
---
type: card
card-type: basic           # basic | cloze | vocab | scenario | pitfall
trail: "[[Java Backend]]"
module: "[[01 - Java Fundamentals]]"
source: "[[Primitive Types]]"
difficulty: 2
---
## Front
What is the difference between `int` and `Integer` in Java?

## Back
`int` is a primitive type (stack, no null). `Integer` is a wrapper object (heap, nullable, autoboxing).
```

**Quiz**

```yaml
---
type: quiz
title: "Quiz - Java Fundamentals"
trail: "[[Java Backend]]"
module: "[[01 - Java Fundamentals]]"
questions: 10
passing-score: 70
---
```

**Exam (mock test)**

```yaml
---
type: exam
title: "Mock - Java SE 21 Certification"
trail: "[[Java Backend]]"
time-limit: 90             # minutes
questions: 50
passing-score: 68
tags: [certification, oracle]
---
```

**Resource (external reference)**

```yaml
---
type: resource
resource-type: video       # video | book | article | course | podcast | paper | repo
title: "Spring Boot Tutorial - Amigoscode"
url: "https://youtube.com/..."
trail: "[[Java Backend]]"
status: watched            # to-consume | in-progress | consumed | watched | read
rating: 4
---
```

**Performance (generated by the system)**

```yaml
---
type: performance
date: 2026-04-14
trail: "[[Java Backend]]"
module: "[[01 - Java Fundamentals]]"
activity: card-review      # card-review | quiz | exam
---
```

### Extensible Type Catalog

The type system is open — frontmatter defines the type, and new types can be added without changing the architecture.

- **Core (MVP):** trail, module, note, card, quiz, exam, performance, resource
- **User notes:** atomic-note, literature-note, permanent-note, summary, cornell-note, mindmap, moc, glossary, learning-log
- **Review:** card, cloze, quiz, feynman-explanation
- **Practice:** exercise, code-kata, project, lab, mock-interview, case-study, challenge
- **Assessment:** exam, competency-checklist, self-assessment, certificate
- **Planning:** trail, sprint, review-template, kanban

### Two roles per resource

1. **Cataloging** (local, free) — register that the resource exists, metadata
2. **Processing** (API, paid) — summary, note-taking, card extraction, transcription

### Model Principles

1. **Frontmatter as contract** — `type` defines what the system expects
2. **Wikilinks for relationships** — trail → module → note → card, all via `[[links]]`
3. **Extensible** — new types added without architectural changes
4. **Validatable** — `estudeme validate` flags incomplete frontmatter
5. **Generated and editable** — `performance` is generated by the system but human-readable; cards may be AI-generated but remain editable

---

## 4. Delivery Phases

Each phase delivers something **usable and complete on its own**.

### Phase 0 — Foundation (Core Lib + CLI)

Monorepo `estudeme` with working core lib and CLI. Vault codex-technomanticus as the test subject.

- `estudeme init` — vault with templates and default frontmatter
- `estudeme validate` — frontmatter, broken links, types
- `estudeme trail list/status` — trails and progress
- `estudeme cards list/export` — list cards, export `.apkg` (absorbs arcana)
- `estudeme metrics show` — terminal dashboard

**Criterion:** you use it with your vault. Skills work with agents.

### Phase 1 — Skills + User's AI

Skills that let agents operate the system.

- `estudeme-trail`, `estudeme-cards`, `estudeme-quiz`, `estudeme-ingest`
- All call the CLI under the hood

**Criterion:** a student installs CLI + skills, talks to Claude/Gemini, and the agent does the work.

### Phase 2 — Spaced Repetition + Interactive Quizzes

FSRS engine in the core lib + interactive commands in the CLI.

- `estudeme review` — card review session in the terminal
- `estudeme quiz run` — interactive quiz in the terminal
- FSRS engine updates card frontmatter
- Performance recorded as `performance` notes
- Retention metrics and recommendations

**Criterion:** complete study loop via terminal/agent.

### Phase 3 — Obsidian Plugin

Plugin that brings everything inside Obsidian with a visual interface.

- 5 views: Study Buddy panel, Trail Map, Card Review, Quiz Runner, Dashboard
- MCP Server for integration with external agents
- Published to the Obsidian community marketplace

**Criterion:** plugin in the marketplace, first wide visibility.

### Phase 4 — Site Generator

`estudeme site build/publish` — static site generator via Quartz/Astro.

- Renders trails as interactive visual roadmaps
- Cards and quizzes work in the browser
- Automatic deploy to GitHub Pages
- Templates for different profiles (student, teacher, certification)

**Criterion:** teachers publish materials for students. codex-technomanticus-site is replaced by this.

### Phase 5 — Marketplace + API (SaaS)

Web platform to share/sell vaults + services API.

- **Marketplace:** browse, one-click import, rating, reviews
- **Tiers:** Free (1 trail) / Pro (2-10) / Max (10+, sharing, import)
- **Pro:** access to the Study Buddy using our API (OpenRouter under the hood)
- **B2B API:** ingestion, summaries, note-taking, open-answer evaluation
- **Mobile web:** card and quiz review in the mobile browser

**Criterion:** first paying customer.

---

## 5. Tech Stack

### Monorepo Structure

```
estudeme/
├── packages/
│   ├── core/              ← Core Lib (TS, zero Obsidian deps)
│   │   └── src/
│   │       ├── parser/    ← reads vault, indexes frontmatter
│   │       ├── spaced/    ← FSRS engine
│   │       ├── metrics/   ← progress, retention, recommendations
│   │       ├── content/   ← templates, generation
│   │       ├── export/    ← .apkg, JSON, CSV
│   │       └── types/     ← schemas, validation
│   ├── cli/               ← CLI (uses core)
│   │   └── src/commands/  ← init, trail, cards, quiz, review, metrics, ingest, site, validate
│   └── obsidian-plugin/   ← Obsidian plugin (uses core)
│       └── src/
│           ├── views/     ← Study Buddy panel, Trail Map, Cards, Quiz, Dashboard
│           └── commands/  ← command palette
├── skills/                ← Skills for agents
├── templates/             ← Obsidian templates (Templater-compatible)
├── docs/                  ← Specs, ADRs, guides
├── turbo.json
├── package.json           ← workspace root
└── tsconfig.base.json
```

### Technical Choices

| Decision          | Choice                | Why                                  |
| ----------------- | --------------------- | ------------------------------------ |
| Language          | TypeScript            | Obsidian plugin requires TS          |
| Monorepo          | Turborepo             | Simple, fast, caching                |
| Bundler core/cli  | tsup                  | Fast build, ESM + CJS                |
| Bundler plugin    | esbuild               | Standard for Obsidian plugins        |
| Tests             | Vitest                | Fast, native ESM                     |
| CLI framework     | Commander.js          | Lightweight, mature                  |
| FSRS              | ts-fsrs               | FSRS-5 in TypeScript                 |
| Anki export       | genanki-js (evaluate) | Generate .apkg without Python        |
| Lint              | ESLint + Prettier     | Standard                             |
| CI                | GitHub Actions        | Lint, test, build on PRs             |

### External Integrations

| Tool         | Relationship                     |
| ------------ | -------------------------------- |
| KB (Wendel)  | Ingestion engine (CLI delegates) |
| Obsidian     | Plugin host                      |
| Quartz/Astro | Site generator (Phase 4)         |
| Anki         | Card export                      |
| OpenRouter   | Pro AI backend (Phase 5)         |

### What is intentionally **not** in the stack

- No database — everything is Markdown + frontmatter
- No embedded AI — AI belongs to the user (via agent/skills) or to Pro (OpenRouter)
- No web framework — only arrives in Phase 5

---

## 6. Plugin UX / Visual

### Principle: The editor is sacred; the Study Buddy is the single touch point

The plugin **does not** interfere with the Obsidian editor. All interaction happens through the side panel.

- Panel hidden → pure Obsidian
- Panel open → studying with the Study Buddy
- Text selection → contextual menu (the only exception, and always user-initiated)
- Study Mode = natural conversation between peers in the side panel

### Positioning: Study Buddy, not Copilot

Copilot helps you *do*. The Study Buddy helps you *understand*. A student doesn't want a robot — they want a peer who studied more than they did.

### Views

**1. Study Buddy panel (right sidebar) — single entry point**

Always visible. Contextual. Changes based on what is open:

- Note open → note context, related cards, actions, chat
- Card open → review, edit, view source
- Trail open → progress, recommendations
- Nothing open → student home (cards due today, streak, next steps)

Layout:

- 📊 Today (due cards, streak, review shortcut)
- 📋 Active trail (progress bar, next step)
- 💬 Chat with the Study Buddy (bidirectional questions)
- ⚡ Contextual actions (generate cards, create quiz, etc.)
- 🔗 Related (nearby notes, previous/next)

**2. Trail Map (editor tab)**

Trail visualization as a graph (inspired by roadmap.sh). Nodes colored by status (✅ complete, 🔄 in progress, ⬚ not started). Clicking opens the module.

**3. Card Review (tab/modal)**

Minimalist interface: question → flip → rate (1-4 = Again / Hard / Good / Easy). Keyboard shortcuts.

**4. Quiz Runner (tab/modal)**

Interactive quiz: question + options → confirm → immediate feedback → next. Optional timer for mock tests.

**5. Dashboard (tab)**

High-level view: streaks, active trails, last-30-days retention, recommendations, recent activity.

### Study Mode

When active, the Study Buddy reads the open note and asks questions in the side panel, like a genuine peer:

> Study Buddy: "Hey, I see you're reading about primitives. Want to check if it's sticking? How many primitive types does Java have?"

Accepts open answers (evaluated by AI) and multiple choice. Records performance silently. The student also asks questions — bidirectional.

### Mobile (Obsidian Mobile)

Same views, adapted layout:

- Study Buddy panel → full-screen with swipe gesture
- Card Review → swipe left/right to rate
- Quiz → touch-friendly buttons
- Trail Map → list with indicators (not full graph)
- Dashboard → vertically stacked cards

### AI Integration (3 tiers)

1. **Free local** — user uses their own AI (OpenAI/Anthropic API key, local Ollama, CLI agents like Claude Code)
2. **MCP Server** — any MCP-compatible agent can use study tools
3. **Pro** — Study Buddy using our API (OpenRouter under the hood), no configuration, integrated context

---

## 7. Risks and Mitigations

| # | Risk                              | Probability | Impact | Mitigation                                                      |
| - | --------------------------------- | :---------: | :----: | --------------------------------------------------------------- |
| 1 | Dependency on Obsidian            | Low         | High   | Core lib is separate — frontends are replaceable                |
| 2 | Scope vs. team (1 person, 6 phases) | High      | High   | Incremental phases, each one is a complete product              |
| 3 | User cost of AI                   | Medium      | Medium | AI is optional, local models available, Pro has fixed pricing   |
| 4 | Marketplace cold start            | Medium      | Medium | Marketplace only in Phase 5; own vaults as seed content         |
| 5 | "Just another flashcard plugin"   | Medium      | High   | Positioning: study platform, not flashcard plugin               |
| 6 | Performance on large vaults       | Low         | Medium | Cache, lazy index, Dataview precedent                           |
| 7 | Obsidian Mobile limitations       | Medium      | Medium | Test early, site (Phase 4) as mobile fallback                   |

### Key Points

**Risk 2 (scope):** The goal is not to ship everything. The goal is to ship Phase 0 and see what happens. Each phase can be a viable stopping point.

**Risk 5 (positioning):** The differentiator is not the flashcards — it's the **Study Buddy + analytics + orchestration**. No existing plugin combines contextual conversational study chat, retention metrics per trail/module, and a path toward a marketplace.

---

## 8. Relationship to Existing Repositories

The three existing repos are seeds of the idea, not the final product:

- **codex-technomanticus** → first example vault / proof of concept
- **codex-technomanticus-site** → proof that publishing a vault as a site works; will be replaced by the Phase 4 generator
- **codex-technomanticus-arcana** → proof that card generation works; exists as a separate repo to share `.apkg` via GitHub releases. In the future, `.apkg` export becomes a plugin feature

---

## 9. Next Steps

1. Approve this design
2. Write a detailed implementation plan for **Phase 0** (writing-plans skill)
3. Start Phase 0 implementation in the `estudeme` repo
4. Validate against the codex-technomanticus vault

---

## Appendix A — Inspirations and References

- **Karpathy's memory / second brain** — intelligent ingestion, /raw folder, "humans curate, machines do the rest"
- **graphify** (safishamsi) — knowledge graph of any folder, 71.5x fewer tokens
- **MemPalace** (Milla Jovovich) — verbatim memory with ChromaDB, palace architecture
- **LLM-knowledge-base** (Wendel) — ingestion engine, direct partner
- **flashcards-obsidian** (reuseman) — Anki integration, MIT
- **obsidian-spaced-repetition** — mature, FSRS
- **Quiz Generator** — AI-powered quizzes
- **roadmap.sh** — visual roadmaps, click tracking, two axes (role + skill)
- **Copilot for Obsidian** / **BMO Chatbot** — chat sidebar as UX reference

## Appendix B — Origin of the Idea

Emerged from a conversation in the RESPEITOSO TECH group (2026-04-13). Multiple people converging on the same need from different paths — a signal of real market validation.

## Appendix C — Status

Brainstorming / ideation phase complete. Awaiting approval to start the Phase 0 implementation plan.
