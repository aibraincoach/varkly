# Varkly — VARK Learning Style Quiz

Varkly is a fast, frictionless web app that helps you discover your VARK learning style and immediately apply it to every AI tool you use. One screen, four views — landing, thirteen scenario questions, results, and copy-ready AI prompts. No accounts, no application database, no server-side quiz logic.

---

## Features

- **13-question VARK quiz** — Scenario-based, humorous multiple-choice questions (multi-select per question). Progress persists in `sessionStorage` for the current tab.
- **Editorial image rail** — Fourteen WebP panels visualize each scenario; desktop expands one panel at a time in a horizontal rail (≥1100px).
- **Instant shareable results** — Scores are base64-encoded into a unique URL (`/r/:hash`) that anyone can open without an account or server lookup.
- **AI prompts** — Deterministic system and conversation prompts generated client-side from your VARK scores, ready to paste into ChatGPT, Claude, Gemini, or any AI tool.
- **Keyboard-first** — Keys 1–4 toggle options; Enter/ArrowRight advance; ArrowLeft go back; Space skip.

---

## Supported Routes

All routes render the same `PanelsScreen` container with route-derived view state:

| Route | View |
|---|---|
| `/` | Landing |
| `/quiz` | Question (index from session state) |
| `/results` | Results (requires selections or quiz completion) |
| `/prompts` | AI prompts (requires at least one selection; zero-score completed profiles redirect to `/results`) |
| `/r/:hash` | Shared results (scores decoded from hash) |
| `/r/:hash/prompts` | Shared prompts |
| `*` | 404 |

Invalid share hashes redirect to `/`. Shared links disable answer review. A skip-all run (completed with zero selections) can view empty local results but cannot open prompts.

---

## Architecture

Varkly stores no application user data on a server. Quiz answers, scoring, and prompt generation run entirely in the browser.

```
Browser (React SPA)
    │
    ├── Quiz state         → sessionStorage (`quizState`)
    ├── Score calculation  → src/utils/scores.ts (pure)
    ├── AI prompts         → src/utils/aiPrompts.ts (pure, deterministic)
    └── Results sharing    → URL encoding (btoa/atob)
```

**Intentional network requests** (owner-side, not user-data persistence):

- Google Analytics (`G-QCPTM267KD`) — traffic measurement
- Cloudflare Web Analytics — beacon in `index.html`
- Google Fonts — Sora and JetBrains Mono

### Shareable URL encoding

```
scores string: "V-A-R-K"  (e.g. "9-2-1-1")
base64 encode: btoa("9-2-1-1") = "OS0yLTEtMQ=="
strip padding: "OS0yLTEtMQ"
final URL:     https://varkly-eight.vercel.app/r/OS0yLTEtMQ
```

The URL encodes aggregate scores only. Legacy links such as `OS0yLTEtMQ` remain compatible.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS v3 (light-only tokens) |
| Animation | Framer Motion v11 |
| Icons | Lucide React |
| Tests | Vitest (109 utility tests) + Playwright E2E (Chromium) |
| Deployment | Vercel (static SPA) |

---

## Project Structure

```
src/
├── App.tsx                     Routes and providers
├── components/
│   ├── layout/                 AppLayout, AppFooter
│   ├── panels/                 PanelsScreen, views, PanelRail, panelsLogic
│   └── shared/                 ErrorBoundary, NotFoundPage, Toast
├── contexts/                   QuizContext, ToastContext (+ context modules)
├── data/                       questions.ts, panels.ts
├── hooks/                      usePageMeta, useQuiz, useToast
├── utils/                      scores.ts, aiPrompts.ts, __tests__/
└── constants/app.ts            Routes, branding, storage keys
```

Design documentation: `DESIGN.md`, `.impeccable/design.json`, `BRANDING.md`, `COPY.md`.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18

### Install and run

```bash
npm install
npm run dev
```

No environment variables are required.

### E2E tests (Playwright)

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Playwright runs against the production preview on `127.0.0.1:4173` (single Chromium worker).

### Build for production

```bash
npm run build
npm run preview   # optional: serve dist/ locally
```

Output is in `dist/`. `vercel.json` rewrites all paths to `index.html` for SPA routing.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run typecheck` | Run TypeScript (`tsc --noEmit`) on app, node, and e2e configs |
| `npm run build` | Typecheck, then build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest (utility tests in `src/`) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright E2E (requires `npx playwright install chromium` first) |

---

## Keyboard Shortcuts

Global shortcuts run at the window level. On question views, recognized shortcuts take precedence over focused buttons and links. On landing, results, and prompts, Enter/Space activate a focused button and Enter follows a focused link.

| Context | Keys |
|---|---|
| Landing | Enter — start quiz |
| Questions | 1–4 — toggle options; Enter/→ — next; ← — previous; Space — skip |
| Results (nonempty) | ← — review last question (local only); Enter — go to prompts; Space — retake |
| Results (empty) | ← — review questions (local only); Enter — answer questions / take quiz; Space — retake |
| Prompts | ← — back to results; Enter — copy both prompts; Space — retake |

Visible hint on landing, results, and prompts: `With a button focused, Enter or Space activates it. With a link focused, Enter follows it.`

---

## Tests

Vitest (109 tests) covers pure utilities: `calculateScores`, `encodeScores`/`decodeScores`, `generateAIPrompts`, `panelsLogic`, and quiz start-state transitions.

Playwright E2E (25 Chromium tests in `e2e/`) covers the keyboard contract (K1–K11), quiz continuation (S1–S4), route guards and empty-profile recovery (R1–R9), and responsive layout (U1). Install browsers with `npx playwright install chromium`, then run `npm run test:e2e` after `npm run build`.

---

## Deployment

Hosted on Vercel as a static SPA. Production URL: `https://varkly-eight.vercel.app`. Custom domain is deferred.

Open Graph and Twitter card metadata use a static `og-image.png` — shared `/r/:hash` links do not get per-score preview images.

---

## Documentation

| File | Purpose |
|---|---|
| `planning.md` | Architecture, routes, risks |
| `AGENTS.md` | Canonical agent/session rules |
| `tasks.md` | Implementation roadmap and session log |
| `PRD.md` | Product requirements |
| `COPY.md` | All customer-facing strings |
