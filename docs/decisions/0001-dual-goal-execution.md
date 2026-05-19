# ADR-0001: Dual-goal execution — business product and portfolio asset

**Date:** 2026-05-01
**Status:** Accepted
**Deciders:** Josenaldo

## Context

EstudeMe is being built by a single founder with a long-term goal of viable SaaS revenue (open-core model, Pro tier targeting technical self-learners). At the same time, the founder is positioning for the international market and needs a high-quality open-source project as a portfolio asset.

These two goals overlap heavily but are not identical. Optimizing only for the business goal could lead to shortcuts that hurt the portfolio value (e.g., undocumented decisions, untested utility code, Portuguese-only docs, abandoned issues). Optimizing only for the portfolio goal could lead to over-engineering and slow delivery.

The risk of leaving this unstated is that, under time pressure, the founder will silently make trade-offs that compromise one goal in favor of the other without realizing it.

## Decision

EstudeMe is built to serve **both goals simultaneously, as first-class concerns**, with the following non-negotiable execution standards from Phase 0 onward:

1. All user-facing documentation in English (README, CONTRIBUTING, ARCHITECTURE, public ADRs).
2. Tests required for all non-trivial code in `packages/core` and `packages/cli`.
3. Conventional commits, clean history.
4. ADRs for non-trivial architectural and product decisions.
5. GitHub Issues and Milestones used as a visible project management surface.
6. Semver releases starting with the first usable CLI version.
7. CHANGELOG.md maintained from the first release.

Internal/strategic documents (like the strategic context doc) may remain in Portuguese when that's faster for the founder. Public artifacts are in English.

## Consequences

**Easier:**
- The repo functions as a credible portfolio asset from day 1, not retroactively.
- Decisions are recorded, so re-litigating is cheaper.
- Onboarding (future contributors, founder's own future self, AI agents) is faster because context is preserved.

**Harder:**
- More overhead per change (writing ADRs, keeping CHANGELOG current).
- English documentation requires more cognitive effort for a Portuguese-native founder. This is acceptable cost — it doubles as English practice (a stated personal goal).
- Pure "ship fast" mode is constrained.

**New risks:**
- Over-engineering documentation while underdelivering on product. Mitigation: ADRs are short (1 page max), CHANGELOG entries are one-liners, README iterates rather than tries to be perfect.

## Alternatives considered

**A. Optimize only for business; treat portfolio value as a side effect.**
Rejected: leaves the portfolio outcome to chance. In the median scenario (where the SaaS doesn't hit R$ 20k MRR within 24 months), the project would have lower portfolio value than it could have had with marginal extra discipline.

**B. Optimize only for portfolio; release a polished but commercially unfocused project.**
Rejected: founder explicitly wants a viable business, not a vanity project. Decoupling from existing client revenue is a real goal.

**C. Phase the discipline — ship fast in Phase 0, polish later.**
Rejected: the polish-later mode rarely happens in practice, and Phase 0 is precisely when foundational decisions get visible. Polishing a sloppy foundation is more expensive than building on a clean one.

## References

- `docs/context/2026-05-01-strategic-context.md` (premise P4)
- Conversation log between founder and Claude (web), April–May 2026
