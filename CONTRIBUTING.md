# Contributing to EstudeMe

Thank you for considering a contribution. This document describes how the project is developed and what is expected from changes that land in the repository.

EstudeMe is a single-founder project in early stages (Phase 0). External contributions are welcome, but the scope is still narrow and direction can shift. Open an issue to discuss before investing in a significant change.

## Development environment

Requirements:

- Node.js 22 or newer
- npm 10 or newer
- Git

Setup:

```bash
git clone git@github.com:josenaldo/estudeme.git
cd estudeme
npm install
```

The repository is a Turborepo monorepo. After install, the standard scripts are available at the root:

```bash
npm run build      # build all packages
npm run test       # run all test suites
npm run typecheck  # TypeScript type checking
npm run lint       # ESLint
npm run clean      # remove build artifacts and node_modules
```

Most scripts are routed through Turborepo and benefit from its caching. Running `npm run test` a second time without changes will reuse the previous result.

To work on a single package:

```bash
cd packages/core   # or packages/cli
npm run test
npm run build
```

## Branching

The default branch is `main` and reflects the current released state of the project. All work happens on feature branches and is integrated via pull requests.

Branch names follow the pattern `<type>/<short-slug>`:

- `feat/<slug>` for new features (`feat/fsrs-engine`)
- `fix/<slug>` for bug fixes (`fix/wikilink-parser-crash`)
- `docs/<slug>` for documentation
- `chore/<slug>` for maintenance and tooling
- `refactor/<slug>` for refactoring with no behavior change

Avoid long-lived branches. Merge to `main` frequently. Phases (`feat/phase-0-foundation`) are an exception because they group a large body of related work, but the inner workflow is still many small commits.

## Pull requests

Open a pull request as early as feasible. The description should answer:

- What changed and why (a short paragraph, not just the commit log)
- How it was tested (commands run, results)
- Any decisions that deserve a follow-up — link or inline note

CI must be green before merge. CI runs build, typecheck, lint, and the full test suite on every PR. See `.github/workflows/ci.yaml`.

For non-trivial changes (new architecture, breaking change, public API), open or update an ADR first. See the [ADR process](#decisions-and-adrs) below.

The default merge strategy is a merge commit, which preserves the granular history. Squash is used only when a branch contains exploratory churn that should not be preserved.

## Conventional commits

Every commit message follows the Conventional Commits format:

```
<type>(<scope>): <subject>
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`, `perf`.

Scope is the package or area touched: `core`, `cli`, `docs`, `ci`. Scope is optional but encouraged when it adds clarity.

Examples from recent history:

```
feat(core): vault walker and index by type/title
fix(cli): resolve templates dir in both src and dist contexts
docs: add MIT LICENSE
ci: GitHub Actions workflow (build, typecheck, lint, test)
```

Each TDD cycle (failing test → minimal implementation → passing test) is a good candidate for its own commit. Small commits are preferred over large ones; the commit history is treated as a project artifact.

Commit messages are in English. Do not sign commits with AI assistant attributions (`Co-Authored-By: Claude` and similar). The project history reflects human authorship.

## Code style

Code is in TypeScript, formatted by Prettier and linted by ESLint. The configurations live at the repository root (`.prettierrc`, `eslint.config.js`) and apply to all packages.

There is no need to manually format — `npm run lint` reports issues, and your editor should pick up Prettier from the standard configuration. CI enforces both lint and typecheck.

Conventions:

- Identifiers, function names, type names, comments: English.
- Prefer explicit types at module boundaries; let inference handle the inside.
- Avoid `any`. When unavoidable, comment why.
- Keep modules small and focused. A file should answer one question.

## Tests

EstudeMe follows test-driven development for the core library and the CLI. The cycle is:

1. Write a failing test that describes the desired behavior.
2. Write the minimum implementation that makes it pass.
3. Refactor if needed; tests must stay green.
4. Commit.

Test framework is Vitest. Tests live next to the package they cover (`packages/<name>/tests/`). Fixtures (sample vaults, sample documents) live in `tests/fixtures/`.

Tests are not optional for new code in `packages/core` and `packages/cli`. Documentation changes do not require tests.

## Decisions and ADRs

Non-trivial architectural or product decisions are recorded as Architecture Decision Records (ADRs) in [docs/decisions/](docs/decisions/). An ADR captures the context, the decision, the consequences (easier/harder/risks), and the alternatives considered.

When to write an ADR:

- New cross-cutting architectural choice (new package, new boundary, new external dependency that affects the data model).
- Product decision that constrains future work (positioning, pricing layer, license boundary).
- A reversal of an earlier ADR (the new ADR supersedes the old one explicitly).

Day-to-day implementation choices do not require an ADR. The bar is "would a new contributor in six months wonder why this was decided this way?" If yes, write the ADR.

Use [`docs/decisions/0000-template.md`](docs/decisions/0000-template.md) as the starting point. Number ADRs sequentially.

## Reporting issues

Bug reports and feature requests go through GitHub Issues. Use the provided templates in `.github/ISSUE_TEMPLATE/`. Include:

- A clear title.
- Reproduction steps for bugs (or motivation for feature requests).
- Expected vs. actual behavior.
- Environment (Node version, OS) when relevant.

## Project documentation

Beyond this file, the repository contains:

- [README.md](README.md) — what the project is, how to try it, where the roadmap is going.
- [ARCHITECTURE.md](ARCHITECTURE.md) — how the system is structured and why.
- [docs/context/](docs/context/) — strategic premises behind product decisions.
- [docs/decisions/](docs/decisions/) — ADRs.
- [docs/superpowers/specs/](docs/superpowers/specs/) — long-form design documents.
- [docs/superpowers/plans/](docs/superpowers/plans/) — phase implementation plans.

Read the relevant document before opening a PR that touches the area it covers.

## License

By contributing to EstudeMe, you agree that your contributions will be licensed under the [MIT License](LICENSE), the same license that covers the rest of the open codebase.
