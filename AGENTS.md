# Agent Rules — Varkly Project

This is the canonical rules file for every AI session working on this codebase. `cursor.md` and `CLAUDE.md` are pointers to this file only. Update project rules here so the three files cannot drift.

---

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

- Quiz state lives in `QuizContext` / `quiz-context.ts` and `sessionStorage` key `quizState`. Fields: `currentQuestionIndex`, `answers`, `isCompleted`. `normalizeQuizState()` tolerates legacy blobs missing removed fields (e.g. `userIntent`). `startQuiz()` always clears answers via `getFreshQuizStartState()`.
- One route-aware `PanelsScreen` serves `/`, `/quiz`, `/results`, `/prompts`, `/r/:hash`, and `/r/:hash/prompts`. Normal `/results` and `/prompts` redirect to `/` without answers. Shared routes decode aggregate scores from the hash only — shared eyebrows use neutral labels, not `N of 13 answered`.
- Score calculation (`src/utils/scores.ts`), AI prompt generation (`src/utils/aiPrompts.ts`), and results URL encoding are pure client-side operations with no application backend.
- Google Analytics (`G-QCPTM267KD`) and the Cloudflare Web Analytics beacon in `index.html` are intentional owner-side analytics. Do not remove or treat them as leftover application persistence.

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
├── data/                       questions.ts, panels.ts
├── hooks/                      usePageMeta, useQuiz, useToast
├── types/index.ts
└── utils/                      aiPrompts.ts, scores.ts, __tests__/
```

Supporting docs: `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, `BRANDING.md`, `COPY.md`.

Do not reference deleted files: `ThemeContext`, `ThemeToggle`, `LandingPage`, `QuizIntro`, `Question`, `QuizContainer`, `ProgressBar`, `ResultsPage`, `ResultsChart`, `ResultsExplanation`, `AIPromptsCard`, `AppNav`.
