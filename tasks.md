# Tasks — Varkly

**Last updated:** 2026-09-08 (Milestone 8 panels redesign planning)

Tasks are organized by milestone. Check off items as they are completed and add the date: `[x] Task description [2026-03-14]`.

---

## Milestone 0 — Project Setup & Documentation

- [x] Create repository and initial Vite + React + TypeScript scaffold [pre-2026]
- [x] Configure Tailwind CSS v3 [pre-2026]
- [x] Configure React Router v6 [pre-2026]
- [x] Configure Vercel deployment with SPA rewrites (`vercel.json`) [pre-2026]
- [x] Add Google Fonts (Inter) and base HTML meta tags [pre-2026]
- [x] Add dark/light mode with flash-prevention inline script [pre-2026]
- [x] Write `README.md` [2026-03-14]
- [x] Write `PRD.md` [2026-03-14]
- [x] Write `cursor.md` [2026-03-14]
- [x] Write `planning.md` [2026-03-14]
- [x] Write `tasks.md` [2026-03-14]
- [x] Establish `AGENTS.md` as the canonical rules file, with pointer-only `cursor.md` and `CLAUDE.md`, and synchronize the memory bank with the repository [2026-09-07]

---

## Milestone 1 — Core Quiz

- [x] Write 13 VARK quiz questions with humorous scenario framing [pre-2026]
- [x] Implement `QuizContext` with full state management (answers, navigation, scoring) [pre-2026]
- [x] Persist quiz state to `sessionStorage` (survive accidental refresh) [pre-2026]
- [x] Build `QuizIntro` screen (question index `-1`) [pre-2026]
- [x] Build `Question` component with multi-select answer support [pre-2026]
- [x] Build `ProgressBar` component [pre-2026]
- [x] Build `QuizContainer` orchestration with back / forward / skip controls [pre-2026]
- [x] Implement `calculateScores()` — tally V/A/R/K counts from selected options [pre-2026]
- [x] Navigate to `/results` on quiz completion [pre-2026]

---

## Milestone 2 — Results Page

- [x] Build `ResultsPage` component [pre-2026]
- [x] Implement shareable URL encoding: `btoa("V-A-R-K")` → `/r/:hash` [pre-2026]
- [x] Implement hash decoding on `/r/:hash` with validation and redirect-to-home on invalid hash [pre-2026]
- [x] Build `ResultsChart` — VARK score bar chart with Recharts [pre-2026]
- [x] Build `ResultsExplanation` — per-style descriptions, tips, and RayRayRay quote [pre-2026]
- [x] Add copy-to-clipboard button for results URL [pre-2026]
- [x] Add Web Share API integration with clipboard fallback [pre-2026]
- [x] Add "Retake Quiz" button [pre-2026]
- [x] Show loading spinner while initialising results [pre-2026]

---

## Milestone 3 — Landing Page

- [x] Build `LandingPage` with hero, VARK style grid, and CTA [pre-2026]
- [x] Add Enter key shortcut to start quiz from landing page [pre-2026]

---

## Milestone 4 — Stateless Refactor (remove email, DB, and analytics)

Remove all code that depends on Supabase, email delivery, or application-side server persistence. Varkly is stateless with respect to application user data, while the intentional Google Analytics and Cloudflare Web Analytics scripts continue reporting traffic to the owner's accounts.

- [x] Remove email capture modal from `LandingPage.tsx` entirely [2026-03-14]
- [x] Remove "My results" link from the landing page nav [2026-03-14]
- [x] Remove `EmailCapture` type and all email-related fields from `src/types/index.ts` [2026-03-14]
- [x] Remove email capture state (`emailCapture`, `setEmailCapture`) from `QuizContext.tsx` [2026-03-14]
- [x] Remove save status banner (saving / saved / error) from `ResultsPage.tsx` [2026-03-14]
- [x] Remove email status banner (sending / sent / error) from `ResultsPage.tsx` [2026-03-14]
- [x] Remove all Supabase calls from `ResultsPage.tsx` (`updateQuizResponse`, `saveQuizResponse`, `sendVarkReport`) [2026-03-14]
- [x] Delete `src/utils/supabase.ts` [2026-03-14]
- [x] Delete `src/utils/analytics.ts` [2026-03-14]
- [x] Delete `src/types/supabase.ts` [2026-03-14]
- [x] Delete `src/types/analytics.ts` [2026-03-14]
- [x] Delete `src/components/my-results/MyResultsPage.tsx` [2026-03-14]
- [x] Delete `src/components/unsubscribe/UnsubscribePage.tsx` [2026-03-14]
- [x] Delete `src/components/analytics/VisitorTracker.tsx` [2026-03-14]
- [x] Delete `src/components/analytics/AnalyticsPage.tsx` [2026-03-14]
- [x] Remove `/my-results`, `/u/:id`, and `/analytics` routes from `App.tsx` [2026-03-14]
- [x] Remove `VisitorTracker` from `App.tsx` [2026-03-14]
- [x] Remove `@supabase/supabase-js` from `package.json` [2026-03-14]
- [x] Remove `ua-parser-js` and `@types/ua-parser-js` from `package.json` [2026-03-14]
- [x] Remove reCAPTCHA script loading and all `grecaptcha` references from `LandingPage.tsx` [2026-03-14]
- [x] Update `cursor.md` tech stack table to reflect removed dependencies [2026-03-14]
- [x] Update `README.md` to reflect stateless architecture and simplified setup [2026-03-14]
- [x] Document intentional owner-side Google Analytics (`G-QCPTM267KD`) and Cloudflare Web Analytics alongside the stateless user-data architecture [2026-09-07]

---

## Milestone 5 — AI Prompts Feature

- [x] Define system prompt and conversation prompt template strings for each VARK style (V, A, R, K) [2026-03-14]
- [x] Define multimodal prompt templates for all two-style combinations [2026-03-14]
- [x] Define broad multimodal prompt template for three-or-more-style ties [2026-03-14]
- [x] Create `generateAIPrompts(scores: VarkScores): { systemPrompt: string; conversationPrompt: string }` in `src/utils/aiPrompts.ts` [2026-03-14]
- [x] Write unit tests for `generateAIPrompts` covering all 4 pure styles + key multimodal combinations (Vitest) [2026-03-14]
- [x] Build `AIPromptsCard` component with clearly labeled System Prompt and Conversation Prompt blocks [2026-03-14]
- [x] Add one-click copy button to each prompt block [2026-03-14]
- [x] Add copy-with-feedback state: button text changes to "Copied!" for 2 seconds after click [2026-03-14]
- [x] Add explanatory text above each prompt block explaining what it is and when to use it [2026-03-14]
- [x] Insert `AIPromptsCard` in `ResultsPage` between `ResultsExplanation` and "Retake Quiz" card [2026-03-14]
- [x] Confirm `AIPromptsCard` renders correctly on the shareable `/r/:hash` results page [2026-03-14]
- [x] Add full dark mode styling to `AIPromptsCard` [2026-03-14]
- [ ] Test System Prompt manually with ChatGPT, Claude, and Gemini — confirm AI behavior matches VARK style
- [ ] Test Conversation Prompt manually in a live session — confirm mid-session reorientation works
- [ ] Update `PRD.md` with final approved prompt copy once wording is confirmed

---

## Milestone 6 — Quality & Polish

- [x] Add shareable results link card at bottom of results page — `/r/:hash` URL with copy-to-clipboard [2026-03-14]
- [x] Codebase audit — remove all non-production scaffolding and dead files [2026-03-14]
- [ ] Add Vitest + React Testing Library — unit tests for `calculateScores` and `generateAIPrompts`
- [x] Add proper 404 page for unmatched routes [2026-03-14]
- [ ] Add `<meta>` Open Graph tags to `index.html` for better social sharing previews on the `/r/:hash` URL
- [x] Audit and remove all `console.log` statements from production code [2026-09-07]
- [ ] Add E2E test for the full quiz → results → copy prompt flow with Playwright (good-to-have)
- [x] Fix dark mode flickering during quiz navigation (unstable useEffect deps) [2026-03-14]
- [x] Fix scroll jump on answer selection (useEffect re-firing window.scrollTo) [2026-03-14]
- [x] Add missing dark: variants across QuizIntro, QuizContainer, ResultsExplanation, ResultsChart [2026-03-14]
- [x] Guard /results route against direct access without quiz completion [2026-03-14]
- [x] Fix all-zero scores edge case in ResultsPage (dominantStyles) [2026-03-14]
- [x] Wrap QuizContext functions in useCallback for stable references [2026-03-14]
- [x] Create BRANDING.md — full brand style guide for designer handoff [2026-03-14]
- [ ] Reconcile `README.md` claims that the app makes no network calls with the intentional Google Analytics and Cloudflare Web Analytics requests in `index.html`
- [ ] Fix current ESLint findings: unused `scenario` in `src/components/quiz/Question.tsx`, unused `_` in `src/components/results/ResultsPage.tsx`, and Fast Refresh export warnings in the three context files
- [ ] Review and remediate the 22 dependency vulnerabilities reported by `npm ci` (3 low, 4 moderate, 15 high) without applying unreviewed breaking upgrades

---

## Milestone 7 — Backlog

### Correctness and honesty

- [ ] README claims "no API calls during the quiz or results flow" but GA, Cloudflare, and Google Fonts load on every page. Decide wording vs code fix.
- [ ] The `/r/:hash` results URL encodes VARK scores in the path, and GA reports full page paths by default. Scope GA to exclude `/r/` paths so scores are not sent to Google.
- [ ] Sync `COPY.md` with the current in-app copy.

### Quality

- [ ] Fix 2 ESLint unused-variable errors and 3 Fast Refresh warnings.
- [ ] Add Open Graph and Twitter card meta tags to `index.html` for `/r/:hash` sharing.
- [ ] Add unit tests for `calculateScores` (`src/contexts/QuizContext.tsx`).
- [ ] Playwright E2E for quiz to results to copy-prompt flow.
- [ ] Review 22 npm audit advisories. Low priority, static client app, do not upgrade packages speculatively.
- [ ] Remove dead `userIntent` state: `setUserIntent` writes to context, nothing reads it, and `aiPrompts.ts` never references it. Delete `setUserIntent`, the `userIntent` field on `QuizState`, and the `UserIntent` type.

### Product

- [ ] Manually test the System Prompt and Conversation Prompt against ChatGPT, Claude, and Gemini, then update `PRD.md` with final copy.
- [ ] Custom domain on Vercel to replace `varkly-eight.vercel.app`.
- [ ] Investigate JJ's conversational voice agent work: does it still exist, what state is it in, what is reusable.
- [ ] Voice conversation rebuild. The `voice-UI` branch is a per-question TTS/STT bridge, not a conversation. Keep the branch, do not merge it. Reusable parts are the question content and the VARK classification logic only.
- [ ] Restore an "About VARK" entry point on the landing view. Deferred pending a designer round and not part of the panels redesign. The design code hides the button, while the design screenshot shows it. On a one-screen app it is the only place the credibility argument can live, and VARK as a taxonomy is contested.
- [ ] Reinstate a condensed results explanation. Deferred pending a designer round and not part of the panels redesign. The panels redesign reduces each VARK style to a single blurb, so a user who scores Kinesthetic learns little about what that means.
- [ ] Preserve `ResultsExplanation.tsx` copy in `COPY.md` before the component is deleted in the panels redesign, so reinstating the deferred explanation is copy-paste work rather than git archaeology.

### Repo hygiene

- [ ] Decide whether to leave the fork network. Permanent, and loses the 10 PRs and their review threads. Deferred, not urgent.

---

## Milestone 8 — VARK Panels Redesign

The approved panels redesign replaces the multi-page violet UI with one screen and four views (landing, question, results, prompts) in a fixed two-column layout. Presentation replacement only — product scope, scoring, share-hash encoding, and prompt generation are unchanged. Delivery is three PRs (A → B → C), each reviewed before merge.

### PR A — `feat/panels-foundation`

- [ ] Add `PRODUCT.md` with Impeccable product schema and confirmed product truth (no palette, fonts, or component details)
- [ ] Verify `COPY.md` §16–22 against `ResultsExplanation.tsx`; add any missing strings before the component is deleted in PR B
- [ ] Convert 14 design PNGs to WebP (`public/panels/NN-slug.webp`) with `cwebp -q 78 -resize 720 0`; record raw image total (`du -ch`) and landing transfer weight (DevTools Network on `/`, target under 1.2 MB)
- [ ] Create `src/data/panels.ts` mapping panel index 01–14 to title and image slug (preserve design source order)
- [ ] Foundation styling: Sora + JetBrains Mono fonts, slate light-only tokens in `tailwind.config.js` and `index.css`; remove gradients, `.card`, `.btn-*`, `.quiz-option`; add `vkFade` keyframes and `screens.panels = '1100px'`
- [ ] Update `index.html`: swap Google Fonts link, remove dark-mode inline script, set `theme-color` to `#f3f3f5`, add Open Graph and Twitter card meta tags with `public/og-image.png` (1200×630)
- [ ] Remove `ThemeContext`, `ThemeToggle`, `STORAGE_KEYS.theme`, and all `dark:` styling rules from AGENTS.md
- [ ] Rewrite `AppFooter` to `© 2026 AI Brain Coach, All Rights Reserved` on every route including 404
- [ ] Extract pure score/share utilities to `src/utils/scores.ts` (`calculateScores`, `getDominantStyles`, `summarizeScores`, `encodeScores`, `decodeScores`) with `src/utils/__tests__/scores.test.ts` including share-link compatibility (`OS0yLTEtMQ` round-trip, 0–13 validation)
- [ ] `QuizContext` cleanup: delegate `calculateScores` to util, remove `userIntent`/`setUserIntent`/`UserIntent` type, remove `isCompleted → navigate('/results')` effect (explicit navigation in PR B)
- [ ] `ResultsPage` temporarily uses `decodeScores` from util; keep incumbent quiz → results → copy-prompt flow operational through PR A
- [ ] Keep `recharts` through PR A (removed in PR B alongside `ResultsChart.tsx`) so the intermediate app still builds
- [ ] Intermediate verification: `npm run lint`, `npm test` (existing 37 + new scores tests), `npm run build` green; record landing-weight evidence in PR description and session log

### PR B — `feat/panels-screen`

- [ ] Build `PanelsScreen` route-aware container with `PanelsHeader`, aside views, `ActionRow`, and keyboard handler (window-level: 1–4 toggle, Enter/ArrowRight next, ArrowLeft prev, Space skip)
- [ ] Implement routing: `/` landing (`active === -1`), `/quiz` (0–12), `/results` and `/prompts` (13, guard redirect if no answers), `/r/:hash` and `/r/:hash/prompts` (decoded scores, review disabled)
- [ ] Build `LandingView`, `QuestionView`, `ResultsView`, `PromptsView` with fixed-height aside block so action row never moves
- [ ] Build responsive `PanelRail` and `Panel`: desktop flex rail (≥1100px) with expand/collapse, saturate filter, vertical labels; mobile stacked 56px strips with active `min-height:260px`
- [ ] Results view: headline/blurb per dominant style, score rows with pct/bar, "Copy link" via toast, shared-link `/r/:hash` renders decoded scores with question panels desaturated
- [ ] Prompts view: System and Conversation prompt cards with individual Copy and "Copy both" action; prompts text equals `generateAIPrompts` output
- [ ] Delete superseded components: `LandingPage`, `QuizIntro`, `Question`, `QuizContainer`, `ProgressBar`, `ResultsPage`, `ResultsChart`, `ResultsExplanation`, `ResultsLoadingSkeleton`, `AIPromptsCard`, `AppNav`, `ThemeToggle`, `ThemeContext`
- [ ] Restyle retained shared UI: `NotFoundPage`, `Toast`/`ToastContext`, `ErrorBoundary` to ink/ground tokens
- [ ] Remove `recharts` from `package.json`; confirm build output has no recharts chunk
- [ ] PR B verification: `npm run lint`, `npm test`, `npm run build` green; manual flow (landing → quiz → results → prompts → copy → shared link → mobile rail); landing weight under 1.2 MB

### PR B remediation — `feat/panels-screen` correction

Review of the shipped panels branch found the branch does not typecheck, the keyboard handler contradicts native button and link activation, `startQuiz` destroys in-progress answers, and `/results` and `/prompts` are guarded by selection count instead of completion, so a genuine skip-all run is thrown back to the landing view.

- [x] Remove the unused default `React` import from `ErrorBoundary.tsx` so `tsc --noEmit` passes without suppressions [2026-09-08]
- [x] Add `typecheck`, build-gated `build`, `src`-scoped `test`, `test:watch`, and `test:e2e` scripts to `package.json` [2026-09-08]
- [x] Add strict `tsconfig.e2e.json` for the Playwright config and `e2e/**/*.ts`, and reference it from the root `tsconfig.json` [2026-09-08]
- [x] Add `@playwright/test` `1.63.0` as an exact dev dependency without unrelated lockfile upgrades [2026-09-08]
- [x] Rename `getFreshQuizStartState` to `getQuizStartState` and preserve previous answers so returning to the landing view no longer wipes an in-progress quiz [2026-09-08]
- [x] Add `completeQuiz` to `QuizContextType` and `QuizProvider`, and call it only when Next or Skip leaves question index 12 [2026-09-08]
- [x] Rewrite the `PanelsScreen` keyboard handler: ignore prevented, repeated, composing, modified, and editable-target events; question shortcuts win on questions; native button and link activation is preserved elsewhere [2026-09-08]
- [x] Separate `hasAnswers` (profile has selections) from `canViewLocalResults` (selections or completion) and apply the full `/results`, `/prompts`, and shared-hash guard matrix [2026-09-08]
- [x] Decode shared scores synchronously from the current URL hash and delete the shared-score state and effect so a prior hash cannot govern the next route [2026-09-08]
- [x] Build the empty results state (zero summary, `Choose at least one answer to get your AI prompts.` helper, `Answer questions` / `Take quiz` primary) and make generated prompts nullable so zero-score profiles never generate, render, or copy personalized prompts [2026-09-08]
- [x] Give `PanelRail` a boolean results-access prop so route eligibility, not selection count, enables the Results panel [2026-09-08]
- [x] Correct the keyboard hint copy for every surface and add the visible button/link focus note on landing, results, and prompts [2026-09-08]
- [x] Add Playwright configuration (Chromium, single worker, built preview on `127.0.0.1:4173`) and ignore its generated report, trace, and test-result directories [2026-09-08]
- [x] Add E2E coverage for keyboard (K1–K11), quiz continuation (S1–S4), route and empty-profile recovery (R1–R9), and responsive layout (U1) [2026-09-08]
- [x] Update the start-state unit tests for preserved answers, empty and completed previous states, and input immutability [2026-09-08]
- [x] Remove the Impeccable `THESIS:`–`FINISH:` HTML comment block from `index.html` (body only; preserve `<head>`, analytics, fonts, and scripts byte-for-byte) [2026-09-08]

### PR C — `docs/panels-sync`

- [ ] Synchronize `planning.md` (single-screen architecture, routes, no theme, file tree, tech stack minus recharts, image-weight risks)
- [ ] Synchronize `AGENTS.md` (light-only styling rule, new tokens, updated tech-stack table)
- [ ] Synchronize `BRANDING.md` (new palette and fonts)
- [ ] Synchronize `COPY.md` (new in-app copy; keep §16–22 as preserved explanation copy)
- [ ] Synchronize `README.md` (remove dark-mode claims, update architecture description)
- [ ] Add `DESIGN.md` via Impeccable design-world workflow from shipped PR B artifact
- [ ] Mark Milestone 8 implementation tasks complete with dates; append final session log entry

---

## Session Log

### 2026-09-07 — Memory-bank synchronization

- Created canonical `AGENTS.md` with the session protocols, task rules, code rules, git rules, package-exact tech stack, analytics protections, and deployment guidance.
- Replaced `cursor.md` with a pointer to `AGENTS.md` and added the equivalent pointer in `CLAUDE.md`.
- Audited every unchecked task against the repository. Marked only the production `console.log` audit complete; manual prompt checks, React Testing Library coverage, Open Graph metadata, and Playwright coverage remain unchecked because inspection did not prove them complete.
- Updated `planning.md` to reflect the current package graph, repository structure, Vercel static-SPA target, and intentional owner-side Google Analytics and Cloudflare Web Analytics.
- Added a follow-up task for the analytics contradiction in `README.md`; did not edit `README.md`, `BRANDING.md`, `COPY.md`, or `PRD.md`.
- Verification: `npm test` passed 37/37 tests, `npm run build` completed successfully, and `git diff --check` passed.
- `npm run lint` reported two errors and three warnings in existing application code; `npm ci` reported 22 dependency vulnerabilities. Both findings were recorded above as follow-up tasks and no application code was changed.

### 2026-09-07 — Backlog capture

- Added Milestone 7 with the supplied correctness, quality, product, and repository-hygiene backlog.
- Left every new item unchecked and did not start any implementation work.
- Changed only `tasks.md`.

### 2026-09-08 — Repository state synchronization and PM handoff

- Recorded that the GitHub repository was renamed from `ZooTech-Hackathon-2026` to `varkly`.
- Confirmed PR #10 (canonical memory bank) and PR #11 (backlog capture) were merged into `main`.
- Confirmed nine stale `cursor/*` remote branches were deleted.
- Confirmed `voice-UI` remains intentionally unmerged at `2e97507`.
- Recorded that the panels redesign plan was revised and is awaiting approval; no redesign application code was changed in this session.
- Updated the GitHub description to "Discover your VARK learning style and generate personalized AI prompts tailored to how you learn." and confirmed the homepage as `https://varkly-eight.vercel.app`.

### 2026-09-08 — PR A documentation preparation

- Created `PRODUCT.md` with Impeccable product schema and confirmed product truth from `PRD.md` and existing architecture docs.
- Added Milestone 8 — VARK Panels Redesign with unchecked PR A, PR B, and PR C tasks covering all Revision 2 delivery items.
- Verified deferred Milestone 7 items (About VARK entry point, condensed results explanation, COPY preservation) already exist; did not duplicate them.
- Diffed `ResultsExplanation.tsx` against `COPY.md` §16–22; all heading, empty state, multimodal paragraph, RayRayRay quote, V/A/R/K/Balanced titles, descriptions, tips, and closing quote are preserved — no COPY changes required.
- No application code, analytics code, or implementation tasks marked complete.

### 2026-09-08 — PR #14 application remediation (Task A)

- Corrected panels keyboard contract, quiz continuation (`getQuizStartState`, `completeQuiz`), route guards, empty results, nullable prompts, and `PanelRail` results access on `feat/panels-screen`.
- Added Playwright E2E suite (25 tests: K1–K11, S1–S4, R1–R9, U1) and expanded unit tests (83 → 109).
- Added `typecheck`, build-gated `build`, `test:e2e`, strict `tsconfig.e2e.json`, and `@playwright/test` 1.63.0.
- Verification: `npm run lint` (0 issues), `npm test` (109/109), `npm run typecheck` (pass), `npm run test:e2e` (25/25), `npm run build` (pass), `git diff --check` (pass).
- Landing transfer weight (gzipped JS/CSS + panel WebPs, fonts excluded): 639,258 bytes (0.61 MB); OG image separate at 862 KB. `dist/` contains no recharts, playwright, or vitest references.

### 2026-09-08 — PR #14 HTML thesis-comment cleanup (Task B)

- Removed the Impeccable `THESIS:`–`FINISH:` body HTML comment from `index.html`; `<head>`, analytics scripts, font links, metadata, and body markup otherwise unchanged.
- Verification: `<head>` byte-for-byte identical to pre-edit snapshot; `git diff --check` pass; `git diff e9f63e4..HEAD` limited to `index.html` comment removal and `tasks.md` records.
