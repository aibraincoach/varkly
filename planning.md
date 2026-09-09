# Planning — Varkly

**Last updated:** 2026-09-08

---

## CI execution decision — 2026-09-08

Actions is disabled. [CI_POLICY.md](CI_POLICY.md) records the owner ruling,
repository evidence, retained checks and outstanding provider blockers. This
entry does not mark unverified replacement checks as passed or completed.

---

## 1. Vision

Varkly is the fastest, most frictionless way to discover your VARK learning style and immediately apply it to every AI tool you use. The experience is instant, playful, and genuinely useful — not another academic form. Every person who completes the quiz leaves with two copy-ready AI prompts that make every AI tool they use smarter about how they learn.

**Varkly is stateless with respect to application user data.** There are no accounts, application database, or application backend. Quiz state, scoring, prompt generation, and results encoding run in the browser. The intentional Google Analytics and Cloudflare Web Analytics scripts report traffic to the owner's accounts but do not restore the removed Varkly user-data persistence layer.

---

## 2. Architecture Overview

```
Browser (React SPA)
    │
    ├── PanelsScreen (route-aware)  → one screen, four views (landing, question, results, prompts)
    ├── Quiz state                  → sessionStorage key `quizState` (ephemeral, tab-scoped)
    ├── Score calculation           → pure helpers in src/utils/scores.ts
    ├── AI prompt generation        → pure helpers in src/utils/aiPrompts.ts
    ├── Results sharing             → URL encoding (btoa/atob, no server lookup)
    ├── Google Analytics            → owner account G-QCPTM267KD (index.html)
    └── Cloudflare Web Analytics    → owner account beacon (index.html)
```

The application is a client-side SPA with no Varkly API, server, or database. It is deployed as static files on Vercel. Google Fonts (Sora, JetBrains Mono) and the two analytics scripts in `index.html` make intentional third-party network requests; this does not make quiz answers or results server-persisted by the application.

There is no theme system. The UI is light-only (slate ground, ink controls).

### Quiz state transitions

`QuizContext` owns the only mutable quiz state and mirrors it to `sessionStorage` under `quizState`.

| Transition | Effect on state |
|---|---|
| `startQuiz()` | Reopens at index 0, **preserves every previous answer**, clears completion |
| `goToQuestion(i)` | Clamps `i` via `clampQuestionIndex(i, questions.length)` (helper max index is `questions.length - 1`), clears completion |
| `completeQuiz()` | Keeps answers and index, sets completion, navigates to `/results` |
| `toggleOption()` | Adds or removes one option id for one question |
| `resetQuiz()` | Restores the default state and removes the storage key |

Reaching the landing view — through the logo, a browser back, or a shared link — never mutates state. `completeQuiz()` fires only when Next or Skip leaves question index 12, so a genuine skip-all run is a completed profile with no selections rather than an abandoned one.

### Route guards

`PanelsScreen` decodes `/r/:hash` synchronously from the current URL on every render, so a previously viewed profile can never govern the next route. Two independent predicates drive the guards: `hasAnswers` (the active local or shared profile has selections) and `canViewLocalResults` (local selections exist **or** the quiz was completed).

| Route | Selections | No selections, completed | No selections, not completed |
|---|---|---|---|
| `/results` | Normal result | Empty result | Replace `/` |
| `/prompts` | Normal prompts | Replace `/results` | Replace `/` |
| `/r/:hash` | Normal result | Empty result (valid all-zero link) | — |
| `/r/:hash/prompts` | Normal prompts | Replace `/r/:hash` | — |

An invalid share hash replaces to `/`. While a guard is redirecting the screen renders only the spinner, so prompts never flash for an invalid or empty profile. Personalized prompts are nullable and are never generated, rendered, or copied for an all-zero profile.

### Keyboard contract

`PanelsScreen` registers stable window `keydown`/`keyup`/`blur` listeners. Recognized shortcuts on question views take precedence over focused buttons and links; on landing, results, and prompts, Enter/Space activate a focused button and Enter follows a focused link. When a shortcut fires, the handler records an owned key identifier as `event.code` with `event.key` fallback (`event.code || event.key`) and `preventDefault`s repeat `keydown` events until matching `keyup`, window `blur`, or unmount clears ownership — so held keys cannot double-fire or leak to Retake after route/view changes. Copy feedback uses a generation ID and disposes window timers on newer copy attempts, navigation, and unmount.

---

## 3. Current Tech Stack

These package names and version ranges match `package.json`.

### Runtime dependencies

| Package | Version | Role |
|---|---|---|
| `framer-motion` | `^11.18.2` | UI animation |
| `lucide-react` | `^0.344.0` | Icons |
| `react` | `^18.3.1` | UI framework |
| `react-dom` | `^18.3.1` | Browser rendering |
| `react-router-dom` | `^6.22.2` | Client-side routing |

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

`recharts` was removed in PR B (`feat/panels-screen`). Results are rendered as score rows, not charts.

### External platform services

- **Vercel** hosts the static Vite SPA.
- **Google Analytics** measurement ID `G-QCPTM267KD` is loaded intentionally from `index.html`.
- **Cloudflare Web Analytics** is loaded intentionally by the beacon in `index.html`.
- **Google Fonts** serves Sora and JetBrains Mono from `fonts.googleapis.com` and `fonts.gstatic.com` on every page.

Neither analytics service is part of the application package dependency graph or a replacement for the removed Supabase persistence layer.

---

## 4. Current File Structure

```text
.
├── AGENTS.md                       Canonical agent rules
├── BRANDING.md                     Brand style guide (panels palette)
├── CLAUDE.md                       Pointer to AGENTS.md for Claude Code
├── COPY.md                         Customer-facing copy extraction
├── cursor.md                       Pointer to AGENTS.md for Cursor
├── DESIGN.md                       Impeccable design-world record (shipped panels)
├── PRD.md                          Product requirements
├── PRODUCT.md                      Impeccable product schema
├── README.md                       Developer onboarding
├── planning.md                     Architecture and technical reality (this file)
├── tasks.md                        Living implementation roadmap and session log
├── WALL_OF_STUPID.md               PM and agent failure record
├── .impeccable/
│   └── design.json                 Impeccable design sidecar (tokens, components)
├── index.html                      SPA shell, metadata, OG/Twitter, analytics
├── package.json                    Scripts and package declarations
├── package-lock.json               npm lockfile
├── vercel.json                     Vercel SPA rewrite
├── vite.config.ts                  Vite configuration
├── playwright.config.ts            Playwright Chromium E2E configuration
├── scripts/
│   ├── measure-assets.mjs          Reproducible dist asset measurement CLI
│   ├── lib/measureAssets.mjs         Build-based budget estimate library
│   └── __tests__/measureAssets.test.mjs  Node tests for measurement tooling
├── eslint.config.js                ESLint configuration
├── tailwind.config.js              Sora/JetBrains, ink/ground tokens, panels breakpoint
├── postcss.config.js               PostCSS configuration
├── tsconfig*.json                  TypeScript configurations
├── e2e/                            Playwright: keyboard, clipboard, state, routes, layout, panel-images
├── public/
│   ├── manifest.json               PWA manifest
│   ├── og-image.png                Open Graph / Twitter card image (1200×630)
│   ├── varkly-icon.svg             Primary app icon (grayscale in header)
│   └── panels/                     14 WebP editorial panel images (01–14)
└── src/
    ├── App.tsx                     Providers, lazy routes, six panel routes + 404
    ├── main.tsx                    Browser entry point
    ├── index.css                   Global foundation + approved panel primitives
    ├── components/
    │   ├── layout/                 AppLayout, AppFooter
    │   ├── panels/                 PanelsScreen, four views, rail, logic, copy feedback
    │   │   ├── copyFeedback.ts       Copy-feedback controller (generation ID, timers)
    │   │   ├── useCopyFeedback.ts    Hook wiring copyToClipboard + toast feedback
    │   │   └── __tests__/          Vitest: panelsLogic, copyFeedback
    │   └── shared/                 ErrorBoundary, NotFoundPage, Toast
    ├── constants/app.ts            Branding, routes, storage keys
    ├── contexts/
    │   ├── QuizContext.tsx         QuizProvider
    │   ├── quiz-context.ts         Context object, defaultQuizState, normalizeQuizState, getQuizStartState
    │   ├── __tests__/              Vitest: quizState (start-state transitions)
    │   ├── ToastContext.tsx        ToastProvider
    │   ├── toast-context.ts        Toast context object
    │   └── toastTypes.ts           Toast types
    ├── data/
    │   ├── questions.ts            Thirteen VARK questions (`QUESTION_COUNT`)
    │   ├── panels.ts               Panel index 01–14 titles and image slugs
    │   └── __tests__/              Vitest: productInvariants (13 questions, 14 panels)
    ├── hooks/
    │   ├── usePageMeta.ts          Route-level title and description
    │   ├── useQuiz.ts              Quiz context hook
    │   └── useToast.ts             Toast context hook
    ├── types/index.ts              Shared application types
    └── utils/
        ├── aiPrompts.ts            Deterministic prompt generation
        ├── copyToClipboard.ts      Clipboard API first, execCommand fallback
        ├── navigation.ts           clampQuestionIndex(index, questionCount) — max index questionCount − 1
        ├── scores.ts               Pure score/share helpers
        └── __tests__/              Vitest: aiPrompts, scores, navigation, copyToClipboard
```

Removed in the panels redesign (no longer present): `ThemeContext`, `ThemeToggle`, `LandingPage`, `QuizIntro`, `Question`, `QuizContainer`, `ProgressBar`, `ResultsPage`, `ResultsChart`, `ResultsExplanation`, `AIPromptsCard`, `AppNav`, `public/brain-icon.svg`, and all `dark:` styling.

---

## 5. Routing and Views

`PanelsScreen` is mounted on six routes and derives view state from the URL plus `QuizContext`.

| Route | Active panel | View | Guard |
|---|---|---|---|
| `/` | `-1` (landing) | landing | — |
| `/quiz` | `0–12` (from `currentQuestionIndex`) | question | — |
| `/results` | `13` | results | Redirect to `/` if not completed and no selections |
| `/prompts` | `13` | prompts | Redirect to `/results` if completed with no selections; to `/` if not completed |
| `/r/:hash` | `13` | results (shared) | Invalid hash → redirect `/`; previous/review disabled |
| `/r/:hash/prompts` | `13` | prompts (shared) | Invalid hash → redirect `/`; no selections → replace `/r/:hash` |
| `*` | — | 404 (`NotFoundPage`) | — |

Shared routes decode scores from the hash only. Question panels are desaturated; the user cannot navigate back through answered questions on a shared link.

---

## 6. Quiz State and sessionStorage

**Storage key:** `quizState` (`STORAGE_KEYS.quizState` in `src/constants/app.ts`)

**Fields:**

| Field | Type | Purpose |
|---|---|---|
| `currentQuestionIndex` | `number` | `-1` landing; `0–12` during quiz; `13` implied on results/prompts routes |
| `answers` | `Record<number, string[]>` | Multi-select option IDs per question |
| `isCompleted` | `boolean` | Set by `completeQuiz()`; cleared by `startQuiz()` and `goToQuestion()` |

**Persistence:** Written on every state change; restored on load via `normalizeQuizState()`.

**Fresh start:** `startQuiz()` calls `getQuizStartState()` — preserves every previous answer, sets `currentQuestionIndex` to `0`, and clears `isCompleted`. Only `resetQuiz()` clears answers. Mid-quiz refresh still restores in-progress answers.

**Reset:** `resetQuiz()` clears state to `defaultQuizState`, removes `sessionStorage`, navigates to `/`.

**Legacy tolerance:** `normalizeQuizState()` ignores unknown fields (including removed `userIntent`) from older blobs.

---

## 7. Shareable Results URL Encoding

Results are encoded entirely client-side in `src/utils/scores.ts`. No server lookup is required.

```
scores string: "V-A-R-K"  (e.g. "9-2-1-1")
base64 encode: btoa("9-2-1-1") = "OS0yLTEtMQ=="
strip padding: "OS0yLTEtMQ"
final URL:     https://varkly-eight.vercel.app/r/OS0yLTEtMQ
```

`PanelsScreen` decodes `atob(hash)` during render via `decodeScores()`, splits on `-`, and validates each value is a number between 0 and 13. Decoding is deliberately synchronous and unstored so no shared profile survives into a later route. Invalid hashes replace to `/`.

**Compatibility:** Legacy share links such as `OS0yLTEtMQ` round-trip correctly (verified in `scores.test.ts`).

**Limitation:** The hash encodes aggregate VARK scores only — not which questions were answered or individual selections. Shared result/prompt eyebrows therefore use neutral labels (`Shared VARK profile`, `Shared AI prompts`) instead of `N of 13 answered`.

---

## 8. AI Prompts — Generation Design

All prompts are generated client-side from `VarkScores` by `generateAIPrompts()` in `src/utils/aiPrompts.ts`. The function is pure and deterministic — identical scores always produce identical output.

Rendered in `PromptsView` via two `PromptCard` components (System prompt, Conversation prompt) plus a "Copy both prompts" action that joins them with `\n\n---\n\n`.

Template structures, style instruction banks, and word-count constraints are documented in `COPY.md` §24–25. Prompt copy has not changed; only the presentation moved from `AIPromptsCard` to the panels prompts view.

---

## 9. Design System — Light-Only Panels

**Typography:** Sora (`font-sans`) for UI copy; JetBrains Mono (`font-mono`) for measurement labels, progress keys, and score readouts.

**Palette tokens** (Tailwind + `DESIGN.md`):

| Token | Hex | Role |
|---|---|---|
| `ink` | `#1f1f24` | Primary text, buttons, focus ring |
| `ground` | `#f3f3f5` | Page background |
| `line` | `#dedee3` | Borders, dividers |
| `panel` | `#1a1a20` | Collapsed panel fill |
| `track` | `#e2e2e7` | Score bar track |
| `muted-1`–`muted-4` | `#5b5b66` … `#9a9aa3` | Secondary text |
| `vark-v` | `#af52de` | Visual accent |
| `vark-a` | `#0071e3` | Auditory accent |
| `vark-r` | `#34c759` | Read/Write accent |
| `vark-k` | `#ff9f0a` | Kinesthetic accent |

**Layout:** Two-column grid at `≥1100px` (`screens.panels`): fixed aside (~360–460px) + editorial image rail. Below 1100px, stacked layout with 56px collapsed strips and 260px active panel height.

**Radii:** 20px panels (`rounded-panel` / `rounded-[20px]`); 12px controls (`rounded-xl`).

**Motion:** Restrained `vkFade` keyframes and Framer Motion on 404/error surfaces. `prefers-reduced-motion` respected in `index.css`.

**Assets:** 14 WebP images in `public/panels/`; raw total **492,034 bytes**. Authoritative app/tooling measurement via `npm run measure:assets`: build-based budget estimate **608,152 bytes** (JS/CSS gzip at level 6: 116,118 + panel WebP raw: 492,034) → strict `< 1,200,000` PASS. Excludes fonts, source maps, HTML, icons, and OG from the combined metric. `og-image.png` reported separately at **882,538 bytes** (862 KB). Observable app bundle introduced at merge `087e71f` (integrates PR #14 `4a6a774` lint fix); measured at integrated HEAD `c4848de`.

Full design-world documentation: `DESIGN.md` and `.impeccable/design.json`.

---

## 10. Deployment Target — Vercel

Production homepage: `https://varkly-eight.vercel.app`. Custom domain deferred.

`vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The catch-all rewrite serves all client routes through `index.html`.

**Open Graph / Twitter:** Static tags in `index.html` point to `og-image.png` on the Vercel URL. Per-hash dynamic OG previews are not implemented — shared links use the generic card.

### Environment Variables

No application environment variables are required. Analytics identifiers are embedded intentionally in `index.html`.

---

## 11. Known Risks and Open Questions

| Risk | Severity | Notes |
|---|---|---|
| Image bundle weight | **Medium** | 14 WebP assets (492 KB raw) dominate the 608 KB build-based estimate; monitor if more images are added |
| sessionStorage schema drift | **Low** | `normalizeQuizState()` tolerates removed fields; future field additions need the same tolerance |
| Static generic OG previews | **Low** | `/r/:hash` shares use site-wide `og-image.png` (862 KB), not score-specific cards; OG compression and canonical domain deferred |
| Aggregate share hashes | **Low** | URL encodes scores only; cannot show "N of 13 answered" on shared routes |
| Clipboard fallback limitations | **Low** | `copyToClipboard` tries Clipboard API first, then offscreen textarea + `execCommand`; both paths can fail in restricted or deprecated contexts (non-secure origins, some embedded frames) |
| `btoa`/`atob` not available in very old browsers | **Low** | Target modern browsers only; add polyfill if needed |
| Partial unit-test coverage | **Low** | Vitest (134) + Node measurement tests (9) = 143 unit tests covering pure score, prompt, navigation, clipboard, and panels logic; React components have no React Testing Library coverage and are exercised through Playwright instead |
| E2E runs Chromium only | **Low** | Playwright (55 tests) covers keyboard ownership (K1–K19), clipboard K9 matrix (`e2e/clipboard.spec.ts`), quiz continuation (S1–S4), route guards including R10 same-document transitions (R1–R10, `e2e/routes.spec.ts`), responsive layout (U1, `e2e/layout.spec.ts`), and panel image hints (I1–I6, `e2e/panel-images.spec.ts`) on a single Chromium worker; WebKit and Firefox regressions deferred |
| Analytics event coverage | **Medium** | GA and Cloudflare are installed; dedicated prompt-copy / quiz-completion events are not proven in-repo |

---

## 12. Current Repository and Work State

**Verified directly against GitHub on 2026-09-09 (`gh pr list --state all`, `gh api .../comments`, `gh api .../status`). This section is the source of truth; where any other document in this repo states an older head or an open review-loop status, this section wins.**

- GitHub repository: `aibraincoach/varkly` (fork of `tanvirahamed2001/ZooTech-Hackathon-2026`, renamed from `ZooTech-Hackathon-2026`). Intentionally kept behind upstream — **never run "sync fork,"** it would pull in unwanted upstream work. Because this is a fork, a PR's base defaults to the upstream repo on creation; **every PR base must be set explicitly to `aibraincoach/varkly`.**
- **The entire panels stack is merged to `main` and deployed.** PR #12 (`9ad4a50`, merge commit `9ed2ba0`), PR #13 (`8a4a411`, merge commit `3fc1ae6`), PR #14 (`723508f`, merge commit `20e5d57`), and PR #15 (`eee78bd`, merge commit `f0851bd`) were merged in that order on 2026-09-09, each retargeted to `main` immediately before merging. `main` is now at `f0851bd9d44b924e5add916d76138e458b0fe12b`.
- Two real merge conflicts surfaced when merging PR #15 into `main` (its base, `feat/panels-screen`, diverged from `main`'s independent `WALL_OF_STUPID.md`/`planning.md` history via the docs/state-sync branch): `WALL_OF_STUPID.md` — `main`'s version was confirmed byte-for-byte an exact prefix of PR #15's version (a pure append, no content divergence); `planning.md` — `main` still held the pre-panels-redesign architecture description (PR #12's version) against PR #15's full current-state rewrite. Both resolved by taking PR #15's side in full — no content was lost or invented; verified `npm run build`, lint, typecheck, and 143 unit tests clean on the resolved merge commit before pushing.
- Post-merge full validation on `main` at `f0851bd`: lint 0/0, typecheck clean, 143 unit tests (134 Vitest + 9 Node), **55/55 Playwright Chromium** (including the rail-navigation matrix), `git diff --check` clean.
- **Vercel deployment on `f0851bd` completed successfully** (`gh api repos/aibraincoach/varkly/commits/f0851bd.../status` → `state: success`, `description: "Deployment has completed"`) — the panels redesign is live in production.
- **PR #16** (`docs/no-actions-2026-09-08` → `main`, unrelated to the panels stack) — merged 2026-09-08T21:49:23Z, prior to the stack. Adds `CI_POLICY.md`; disables GitHub Actions repo-wide per owner ruling (exhausted shared Actions allowance, no additional CI spend authorized); required checks run on Vercel/Cloudflare only.
- **Zero open PRs remain** as of this section. The preserved `voice-UI` branch at `2e97507` remains unmerged by design.
- Deferred, unchanged: OG image compression, canonical custom domain, Firefox/WebKit E2E, dynamic question-count support (explicitly **ruled out**, not merely deferred — the product is fixed at 13 questions).
