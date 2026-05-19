# EstudeMe — Strategic Context (Handoff)

**Date:** 2026-05-01
**Status:** Active — drives Phase 0+ decisions
**Source:** Strategic discussion between Josenaldo and Claude (web), summarized for in-repo work with Claude Code

---

## Why this document exists

EstudeMe is being built with two parallel goals that must be kept explicit, because they pull in slightly different directions:

1. **Business goal:** build a viable open-core SaaS in the self-directed learning space
2. **Portfolio goal:** produce a high-quality open-source project that works as a hiring/positioning asset for the international market, regardless of whether the SaaS reaches commercial success

Both goals are real. Both must be respected in design and execution decisions. When they conflict, this document records how the conflict is resolved.

---

## Strategic premises (decided)

### P1 — Target audience for V1 is the technical self-learner

**Decision:** V1 targets developers, IT professionals, researchers, postgrad students, and other technically inclined autodidacts. Not "students from vestibular to concurso" — that is a future market, not a V1 market.

**Rationale:** the product as designed (Obsidian plugin + CLI + Markdown vault + frontmatter) has a high technical floor that makes mass-market adoption structurally implausible in V1. The technical self-learner already lives in this stack, has willingness to pay USD 10–20/month, and matches the founder's lived experience.

**Implication:** marketing copy, examples in docs, persona references, default trail templates, and onboarding all assume a technical audience. Examples should be cloud certifications, programming languages, technical books, CS topics, English for international work — not ENEM or concurso público.

**Future expansion:** mass market is plausible only as a 5+ year horizon, and would require a separate product (web/mobile, zero-friction) sharing the same engine. EstudeMe stays as the "pro" tier in that future. Not in V1 scope.

### P2 — Group/family plans are V2, not V1

**Decision:** all pricing, features, and architecture for group/family plans are deferred to a future phase (post-marketplace, post-PMF on individual plan).

**Rationale:** group plans only work after the individual plan has product-market fit. Spotify Family followed Spotify Individual at scale. Inverting this order is a known anti-pattern. Study groups also have structural churn (they dissolve after the exam), making them a poor early-revenue target.

**Implication:** Phase 5 plan in the design doc should reflect Free/Pro/Max for individuals only. Group/family becomes a separate, later phase.

### P3 — Study Buddy is a feature, not the moat

**Decision:** the moat of EstudeMe is the combination of (a) open data format, (b) integrated FSRS + analytics + trail orchestration, (c) eventual marketplace and community of serious autodidacts. The Study Buddy is one expression of this, not the differentiator on its own.

**Rationale:** conversational AI over a vault is trivially copyable. The defensible asset is the system and the community, not the chat surface.

**Implication:** README, landing page copy, and design docs should position EstudeMe as a "system for serious self-directed learners," not as "an AI study chat plugin." The Study Buddy gets prominence in UX, not in positioning.

### P4 — Both goals (business + portfolio) drive execution standards

**Decision:** every artifact in this repo is built to a standard that serves both goals simultaneously.

**Rationale:** even in the median scenario where the SaaS does not reach R$ 20k/month MRR, the project must function as a credible portfolio piece for international hiring/consulting. This requires production discipline from day 1, not "we'll polish it later."

**Implication (concrete):**
- All user-facing documentation in English
- README, CONTRIBUTING, ARCHITECTURE, CHANGELOG present and maintained from Phase 0
- Tests are not optional, even for Phase 0 utility code
- Commit history clean, conventional commits, signed where possible
- ADRs (Architecture Decision Records) for non-trivial decisions
- Issues and milestones used as a real project management surface, visible to outside observers
- Releases tagged and versioned (semver) starting with the first usable CLI version

### P5 — Validation gates exist before each major phase

**Decision:** before committing to Phase 3 (Obsidian plugin), there must be evidence that the CLI + skills layer (Phase 0–2) has actual users.

**Rationale:** the Obsidian plugin is the most expensive surface to build and maintain. It only earns its place if there's demand pulling for it.

**Implication:** define a measurable threshold (e.g., "N active CLI users / N stars / N active issues") before kicking off Phase 3. Document the threshold. If it's not met, reassess direction instead of building on inertia.

### P6 — A short-term revenue stream runs in parallel

**Decision:** a separate digital product (course, paid newsletter, or boilerplate) on a related theme (e.g., "Building production AI applications with TypeScript") runs in parallel with EstudeMe. EstudeMe is used as the case study in that content.

**Rationale:** EstudeMe has a long curve to revenue. The parallel product produces income in 3–6 months, builds audience that later becomes EstudeMe's first users, and keeps the founder financially decoupled from the existing client.

**Implication:** content from the EstudeMe build process (architecture posts, decisions, lessons) is a deliberate output, not a byproduct. Plan for it.

---

## Open questions (not yet decided)

These need the founder's explicit input, not Claude Code's guess. Listed in priority order.

1. **Specific niche-of-niche for V1.** "Technical self-learner" is still broad. Concrete options:
   - Devs studying for cloud certifications (AWS/GCP/Azure)
   - Devs studying English for international work
   - Self-learners working through technical books (SICP, CTM, DDIA, etc.)
   - Postgrad students managing literature reviews
   Pick 1, document persona, build first trail templates around it.

2. **Conflict-of-interest boundary with MedEspecialista.** Even with a different audience, is there any feature or scope where EstudeMe touches medical exam preparation? If yes, write the boundary explicitly. If no, document that it's not in scope.

3. **Validation method.** How will we talk to 20 real autodidates before/during Phase 0? Through which channels (LinkedIn, Twitter, communities, podcasts)? Interview script? Decide before launching.

4. **Pricing intuition.** What price feels right for Pro? USD 10/mo? USD 15/mo? R$ 39/mo? This is a starting hypothesis to test, not a final answer, but we need a number to validate against.

5. **Release threshold for Phase 3 trigger.** Concrete metric. Stars are vanity; active users matter. Define what "evidence of pull" looks like.

---

## What this document is NOT

- It's not a replacement for the design doc (`2026-04-14-estudeme-design.md`). It's a strategic layer above it.
- It's not a roadmap. The phase plan in the design doc remains.
- It's not immutable. When premises change, this document is updated with a date and rationale, not silently overwritten.
