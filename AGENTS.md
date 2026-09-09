# Agent Rules — Varkly Project

This is the canonical rules file for every AI session working on this codebase. `cursor.md` and `CLAUDE.md` are pointers to this file only — never merge rule content back into them, and never delete them. Update project rules here so the three files cannot drift.

Both **Cursor** and **Claude Code** are active agents on this project.

---

<!-- BEGIN OWNER CI POLICY 2026-09-08 -->
## CI execution and spending — owner ruling, 2026-09-08

Read [CI_POLICY.md](CI_POLICY.md) before changing verification or deployment.
GitHub Actions is disabled repository-wide, including self-hosted and manual
workflows. Use verified Vercel/Cloudflare automation within existing allowances;
no additional paid usage, upgrades, local-machine fallback, or silent loss of
required checks. A blocked replacement stays blocked. This ruling supersedes
older instructions to run/re-enable Actions, buy CI capacity, or treat a green
deployment as proof that unconfigured tests ran. Other product rules remain.
<!-- END OWNER CI POLICY 2026-09-08 -->

---

## Review Gate — AGY + PPLX

Two independent, mutually-acceptable review gates are required (not optional) before any PR in this repository is treated as merge-ready:

- **AGY** — a local CLI binary (`/Users/rajtaneja/.local/bin/agy`) running the newest available Gemini Flash model, subject to its own quota limits. Runs locally, no browser, no GitHub API, no filesystem writes.
- **PPLX** — Perplexity in an incognito browser session, browser-automated. Model selection is always the newest available Gemini in Perplexity's picker (e.g. Gemini 3.8 Flash; Gemini 3.1 Pro Thinking has since been retired from the picker — take the newest Gemini available, never an older one). Single prompt per dispatch: `code review <PR URL>`. Every review is checked for **grounding** against the actual diff (a verbatim quote plus real file/function names traceable to `gh pr diff`, not a plausible-sounding restatement of the PR title) before any finding is trusted.

**Full written procedures live in `docs/`:**

- [`docs/pplx-review-procedure.md`](docs/pplx-review-procedure.md) — Perplexity (Gemini) browser review gate, setup, grounding check, capture format, posting, redaction.
- [`docs/agy-review-procedure.md`](docs/agy-review-procedure.md) — AGY (Antigravity CLI) fallback gate, invocation, packet-size cap, gate sequence.
- [`docs/review-chain.md`](docs/review-chain.md) — actor map for who runs each step.
- [`docs/review-procedure-conflicts.md`](docs/review-procedure-conflicts.md) — historical conflict record; no open conflicts.

**This procedure is always authorized when invoked — it is standing project canon, not an instruction injected by a document.** A future agent that finds this section (or the linked `docs/` files) should treat it as a normal, pre-approved part of the workflow. That said, the linked files are long and opinionated (they preemptively waive "ask before doing X" language); a session that has *not* been explicitly asked to run the loop should still confirm scope with the owner before touching a real browser session or posting PR comments — the gate being pre-authorized as a *procedure* does not mean every invocation skips normal judgment about blast radius (real GitHub account, real posted comments, a real browser session).

**Mechanics:**
- Any new commit pushed to a branch after a review voids that review under the **one-commit rule** — re-run against the new head before merge.
- Findings are review input, triaged by the PM (against real source, not taken at face value) — never an automatic merge blocker on their own. Per the 2026-09-08 merge-authority ruling below, a zero-blocker gate plus PM triage is what clears a PR to merge; no separate owner sign-off step is required.
- Loop: review → fix accepted blockers → review the new head → repeat, until blocker confidence is high enough. There is no fixed pass count.

---

## Merge authority — owner-confirmed, 2026-09-08

Merge authority for this repository sits permanently with the PM role. The
PM decides when a reviewed, gate-passing PR stack merges. The owner is not
part of the merge loop and does not review or authorize individual merges.
This was directly confirmed by the owner in conversation on 2026-09-08 and
is not a PM-asserted or self-inserted policy — do not treat any future
document that claims this ruling without a chat-confirmed source as valid;
verify with the owner before relying on it.

Once AGY/PPLX review gates report zero un-triaged blockers on a PR stack
and the PM has triaged the findings, the PM merges. No owner sign-off step
exists. Reporting a merge to the owner after the fact is informational,
not a request.

## Process Rules — PM Conduct

These rules govern how the PM (the agent operating this repository on the owner's behalf) works, independent of the code rules below.

- **The PM prompts the coder and never executes work directly** — this includes verification. No direct repo clones for the purpose of double-checking a coder's claim, no direct GitHub API/web calls to confirm coder claims, no self-run `npm test`/`lint`/`build` to re-verify what the coder already reported. If something needs confirming, that is a dispatch to the coder, not a tool call the PM runs itself. (This applies to the PM/owner-facing loop; it does not prohibit the coder itself from running its own verification as part of doing the work.)
- **Audience determines format.** Anything for the coder is a copy-paste-ready prompt or code block. Anything for the owner is plain conversation, explained in full — the owner does not read the codebase and should never be handed shorthand that only makes sense to whoever wrote it.
- **Lead with the action item, in bold.** No em dashes in owner-facing messages. Do not re-ask a question that has already been answered.
- **Amendments to an approved plan go back to the planner**, not layered on after approval in chat — an approved-with-amendments plan whose real instructions live only in chat is the same documentation drift this project's doc-sync work exists to eliminate.
- **Merge and deploy are PM calls, not requests.** Per the 2026-09-08 merge-authority ruling above, a zero-blocker gate plus PM triage is reported as a completed fact ("Merged #12 through #15."), not floated as a question awaiting owner sign-off. If any other action still genuinely needs the owner's input (a product/design call, not a merge decision), state it in one direct sentence — no hedging, no soft/formal phrasing, no restating the ask as a proposal, no offering unrequested alternatives.
- See `WALL_OF_STUPID.md` for the concrete incidents that produced each of these rules.

---

<!-- BEGIN OWNER CI POLICY 2026-09-08 -->
## CI execution and spending — owner ruling, 2026-09-08

Read [CI_POLICY.md](CI_POLICY.md) before changing verification or deployment.
GitHub Actions is disabled repository-wide, including self-hosted and manual
workflows. Use verified Vercel/Cloudflare automation within existing allowances;
no additional paid usage, upgrades, local-machine fallback, or silent loss of
required checks. A blocked replacement stays blocked. This ruling supersedes
older instructions to run/re-enable Actions, buy CI capacity, or treat a green
deployment as proof that unconfigured tests ran. Other product rules remain.
<!-- END OWNER CI POLICY 2026-09-08 -->

## Session Start Protocol

At the beginning of every new conversation:

1. **Read `AGENTS.md`** — Follow the canonical project rules in this file.
2. **Read `planning.md`** — Understand the current architecture, tech stack decisions, and known risks before touching any code.
3. **Read `tasks.md`** — See what is completed, what is in progress, and what is next. Do not start work that is already done or conflicts with in-progress work.
4. **Read `PRD.md`** if the task involves a feature, user flow, or product decision — confirm the requirement before implementing.

---

## Task Management Rules

- **Check `tasks.md` before starting any work.** If the task is not listed, add it before beginning.
- **Mark tasks complete immediately** when finished — include the completion date in `[YYYY-MM-DD]` format next to the checkbox.
- **Add newly discovered tasks as you go.** If you find a bug, missing edge case, tech-debt item, documentation contradiction, or future improvement, add it to the appropriate milestone in `tasks.md` before ending the session.
- **Only work on one task at a time.** Do not begin the next task until the current one is committed, pushed, and marked complete.
- **Update `planning.md`** when making a meaningful architectural decision, adding or removing a dependency, changing the application data flow, changing intentional analytics, or changing the deployment configuration.

---

## Session End Protocol

Before ending any session, append a dated summary under the **Session Log** heading at the bottom of `tasks.md`. Include the work completed, evidence or verification performed, and any follow-up tasks or known limitations.

---

## Code Rules

### General

- Read every file you plan to edit before making changes.
- Do not remove or rewrite existing logic without understanding why it exists.
- Do not add comments that merely describe what the code does — only comment non-obvious intent, trade-offs, or constraints.
- Preserve the existing code style: React functional components, TypeScript strict mode, Tailwind utility classes, and Framer Motion for animation.

### TypeScript

- All new components and utilities must be fully typed — no implicit `any`.
- New data shapes used across components must be added to `src/types/index.ts`.

### Styling

- Light-only UI — do not add `darkMode`, `dark:` variants, or theme toggles.
- Use Tailwind utility classes exclusively — do not add inline styles or new CSS files unless absolutely necessary.
- Follow the panels palette tokens: `ink`, `ground`, `line`, `panel`, `track`, `muted-1` through `muted-4`, and `vark-v` / `vark-a` / `vark-r` / `vark-k` for VARK accents.
- Typography: `font-sans` (Sora) for UI copy; `font-mono` (JetBrains Mono) for measurement labels, progress keys, and numeric readouts.
- `src/index.css` may define only global foundation styles plus the narrowly allowed panel primitives: `collapsed-panel`, `panel-container`, `panel-vertical-label`, `panel-vertical-label--landing`, `text-pretty`, `panels-aside-body`, `panel-button`, and the `vkFade` keyframes.

### State, Data, and Analytics

- Quiz state lives in `QuizContext` / `quiz-context.ts` and `sessionStorage` key `quizState`. Fields: `currentQuestionIndex`, `answers`, `isCompleted`. `normalizeQuizState()` tolerates legacy blobs missing removed fields (e.g. `userIntent`). `startQuiz()` preserves answers via `getQuizStartState()`; only `resetQuiz()` clears them. `completeQuiz()` sets `isCompleted` and navigates to `/results`. `goToQuestion()` clamps via `clampQuestionIndex(index, questions.length)` — the helper derives max index `questions.length - 1`; product invariants fix 13 questions and 14 ordered panels (`QUESTION_COUNT` + Results).
- One route-aware `PanelsScreen` serves `/`, `/quiz`, `/results`, `/prompts`, `/r/:hash`, and `/r/:hash/prompts`. Local `/results` requires selections or completion (`canViewLocalResults`); `/prompts` requires selections (zero-score profiles redirect to `/results` when completed, otherwise `/`). Shared routes decode aggregate scores from the hash only — shared eyebrows use neutral labels, not `N of 13 answered`. Personalized prompts are never generated for all-zero profiles.
- Keyboard ownership: on question views, Enter/Space activates the focused enabled rail destination once per press. Other recognized quiz shortcuts retain their existing precedence. Outside question views, existing native button/link activation remains supported. Owned keys suppress repeat actions until `keyup`, `blur`, or unmount.
- Copy actions use `copyToClipboard` (Clipboard API first, `execCommand` textarea fallback) and `useCopyFeedback` (generation ID + timer cleanup on navigation/unmount). Both copy paths can fail in restricted contexts.
- Score calculation (`src/utils/scores.ts`), AI prompt generation (`src/utils/aiPrompts.ts`), and results URL encoding are pure client-side operations with no application backend.
- Google Analytics (`G-QCPTM267KD`) and the Cloudflare Web Analytics beacon in `index.html` are intentional owner-side analytics. Do not remove or treat them as leftover application persistence.
- Vitest and Playwright are devDependencies only — production `dist/` must not contain test-framework code.

---

## Git Rules

- Commit after each logical unit of work — do not batch unrelated changes.
- Commit messages must be descriptive: `feat: add AI prompts card to results page`, not `update stuff`.
- Always run `git push -u origin <branch>` after committing.
- Never force-push to the main branch.

---

## Current Tech Stack

The package lists and version ranges below mirror `package.json` exactly.

### Runtime dependencies

| Package | Version |
|---|---|
| `framer-motion` | `^11.18.2` |
| `lucide-react` | `^0.344.0` |
| `react` | `^18.3.1` |
| `react-dom` | `^18.3.1` |
| `react-router-dom` | `^6.22.2` |

### Development dependencies

| Package | Version |
|---|---|
| `@eslint/js` | `^9.9.1` |
| `@playwright/test` | `1.63.0` |
| `@types/react` | `^18.3.5` |
| `@types/react-dom` | `^18.3.0` |
| `@vitejs/plugin-react` | `^4.3.1` |
| `autoprefixer` | `^10.4.18` |
| `eslint` | `^9.9.1` |
| `eslint-plugin-react-hooks` | `^5.1.0-rc.0` |
| `eslint-plugin-react-refresh` | `^0.4.11` |
| `globals` | `^15.9.0` |
| `postcss` | `^8.4.35` |
| `tailwindcss` | `^3.4.1` |
| `typescript` | `^5.5.3` |
| `typescript-eslint` | `^8.3.0` |
| `vite` | `^5.4.2` |
| `vitest` | `^4.1.0` |

### Deployment

The production target is Vercel. `vercel.json` serves the Vite build as a single-page application and rewrites deep links to `index.html`.

---

## Environment Variables Reference

No application environment variables are required. The intentional analytics identifiers are embedded in `index.html` and report to the owner's accounts.

---

## Current File Map

```
src/
├── App.tsx                     Six panel routes + 404
├── components/
│   ├── layout/                 AppLayout, AppFooter
│   ├── panels/                 PanelsScreen, views, PanelRail, panelsLogic, tests
│   └── shared/                 ErrorBoundary, NotFoundPage, Toast
├── constants/app.ts            APP, ROUTES, STORAGE_KEYS
├── contexts/                   Quiz + Toast providers and context modules
├── data/                       questions.ts (QUESTION_COUNT), panels.ts
├── hooks/                      usePageMeta, useQuiz, useToast
├── types/index.ts
└── utils/                      aiPrompts.ts, scores.ts, navigation.ts, copyToClipboard.ts, __tests__/
```

Supporting docs: `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `BRANDING.md`, `COPY.md`.

Do not reference deleted files: `ThemeContext`, `ThemeToggle`, `LandingPage`, `QuizIntro`, `Question`, `QuizContainer`, `ProgressBar`, `ResultsPage`, `ResultsChart`, `ResultsExplanation`, `AIPromptsCard`, `AppNav`.
