# Design Sync 2026-09-09 — VARK Panels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the designer's four scoped changes (landing style tiles, About VARK view, results explanation card, dark mode reinstatement) against `main` at `8c24b52`, with an explicit layout-verification pass and no merge, deploy, or narrative-doc edits.

**Architecture:** Two stacked branches. PR 1 (`feat/design-sync-content`) adds the three content changes using the existing light-only Tailwind tokens. PR 2 (`feat/dark-mode-reinstatement`, branched from PR 1's head) converts every palette token to a CSS-variable pair (light on `:root`, dark on `:root[data-theme="dark"]`) so one token set drives both modes, then adds the provider, header toggle, and flash-prevention script. Dark mode goes last and separately because `DESIGN.md` still says "Don't add dark mode" and the owner may reject that PR without blocking the other three.

**Tech Stack:** React 18, TypeScript strict, Tailwind 3.4, react-router-dom 6, lucide-react, Vitest (unit), Playwright 1.63 (e2e, Chromium only, `npm run test:e2e` builds and serves on port 4173).

**Spec:** Designer's sync package `VARKLY Questionnaire Design.zip` (iCloud, `AI Braintrust's Documents/`), file `VARK Panels.dc.html` plus `github.md` (sync dated 2026-09-09T12:14:29Z). Extracted read-only copy used for this plan: session scratchpad `design/`. Repo backlog items: `tasks.md` Milestone 7 → Product → "Restore an 'About VARK' entry point" and "Reinstate a condensed results explanation".

## Global Constraints

- Base every branch on `origin/main` at `8c24b52` (PR #17 merge). Do not branch from `docs/state-sync`, and do not touch any existing worktree under `~/.worktrees/varkly/`.
- No merge. No deploy. No force-push. Push each branch with `git push -u origin <branch>` after each commit.
- No narrative documentation edits (`planning.md`, `DESIGN.md`, `README.md`, `COPY.md`, `PRODUCT.md`, `AGENTS.md` file map, `BRANDING.md`) until the owner has reviewed both PRs. `tasks.md` task entries and the Session Log are process bookkeeping that `AGENTS.md` requires and are allowed (Task 0 and Task 12).
- Tailwind utility classes only. No inline `style` except the two that already exist for computed widths (`ScoreRows` bar width, `PanelsHeader` progress width). No new CSS files.
- TypeScript strict, no `any`. New shared shapes go in `src/types/index.ts`.
- GitHub Actions stays disabled (`CI_POLICY.md`). Verification is local: `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`.
- Copy is verbatim from the sources named in each task. Do not paraphrase.
- Hover states: copy only what the design file literally specifies for the new elements (theme toggle: border → ink on hover). Add no other hover styling to new elements. See "Open design questions" at the end.
- Every existing e2e test must still pass. Existing test IDs (U1, R1–R9, K1–K19, S1–S4, panel-image tests, clipboard tests) are referenced by name; do not rename them.

## What was actually removed, and why (read before Task 8)

Verified against `main` at `8c24b52`:

- `tasks.md` Milestone 8 → PR A: "Remove `ThemeContext`, `ThemeToggle`, `STORAGE_KEYS.theme`, and all `dark:` styling rules from AGENTS.md [2026-09-08]" and "Update `index.html`: … remove dark-mode inline script, set `theme-color` to `#f3f3f5`".
- `tasks.md` Milestone 8 → PR B: "Delete superseded components: … `ThemeToggle`, `ThemeContext`".
- `DESIGN.md` line 111: "The artifact is intentionally light-only." Line 243: "**Don't** add dark mode, ambient shadows, or decorative interface gradients to this light-only flat workspace."
- `planning.md` line 39: "There is no theme system. The UI is light-only (slate ground, ink controls)."
- `src/index.css` sets `color-scheme: light only`.
- `AGENTS.md` "Do not reference deleted files" lists `ThemeContext` and `ThemeToggle`.

The rationale on record is a design decision (the panels design was authored light-only), not a technical or product constraint. The same designer has now added dark mode back in the 2026-09-09 sync. The old implementation was a `light | dark` context that toggled a `.dark` class on `<html>` and relied on Tailwind `dark:` variants scattered through every component. The reinstatement in this plan is deliberately different: one CSS-variable token set drives both modes, so no component carries `dark:` variants. The old files are not restored from git; they are rewritten to the new model. `DESIGN.md`, `planning.md`, and the `AGENTS.md` deleted-files line will contradict the code until the deferred docs task runs; that is expected and is called out in Task 12.

## File map

PR 1 (`feat/design-sync-content`):

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/data/varkStyles.ts` | Four landing tiles: code, name, blurb, dot color class |
| Modify | `src/components/panels/LandingView.tsx` | Intro moves into `<h1>`; tips list + 2×2 tile grid fill `.panels-aside-body` |
| Create | `src/components/panels/AboutView.tsx` | About VARK aside content |
| Modify | `src/constants/app.ts` | `ROUTES.about` |
| Modify | `src/App.tsx` | `/about` route |
| Modify | `src/components/panels/panelsLogic.ts` | `about` view/surface, `open-landing` / `open-about` page actions, hints |
| Modify | `src/components/panels/PanelsScreen.tsx` | Render `AboutView`, labels, tertiary button wiring, page meta |
| Modify | `src/components/panels/__tests__/panelsLogic.test.ts` | Route/surface/action/hint coverage for `about` |
| Create | `src/data/varkExplanations.ts` | COPY.md §16–21 descriptions and tips, verbatim |
| Create | `src/utils/explanation.ts` | `buildExplanation(dominant)` pure function |
| Create | `src/utils/__tests__/explanation.test.ts` | Tip selection rules |
| Create | `src/components/panels/ExplanationCard.tsx` | Card under score rows |
| Modify | `src/components/panels/ResultsView.tsx` | Rows + card in `content-between` body |
| Modify | `src/types/index.ts` | `ResultsExplanation`, `VarkStyleTile` |
| Create | `e2e/about.spec.ts` | About flow |
| Modify | `e2e/layout.spec.ts` | Tiles visible, explanation card visible |
| Create | `e2e/design-sync-layout.spec.ts` | Fixed-height body overflow guard, action-row position invariant, screenshots |

PR 2 (`feat/dark-mode-reinstatement`, on top of PR 1):

| Action | Path | Responsibility |
|---|---|---|
| Modify | `tailwind.config.js` | Palette tokens become `rgb(var(--x) / <alpha-value>)`; add `surface`, `on-ink`, `ink-hover`, `line-2`, `text-2`, `box` |
| Modify | `src/index.css` | Light and dark variable sets, `color-scheme`, scrollbar tokens |
| Modify | `index.html` | Flash-prevention inline script before `#root` |
| Create | `src/contexts/theme-context.ts` | Types, storage key, pure resolvers, `createContext` |
| Create | `src/contexts/ThemeProvider.tsx` | Provider: reads preference, listens to system, writes `data-theme`, `theme-color`, localStorage |
| Create | `src/hooks/useTheme.ts` | Hook |
| Create | `src/contexts/__tests__/themeLogic.test.ts` | Resolver tests |
| Create | `src/components/panels/ThemeToggle.tsx` | 36px header button |
| Modify | `src/components/panels/PanelsHeader.tsx` | Mount toggle |
| Modify | `src/App.tsx` | Wrap in `ThemeProvider` |
| Modify | `src/constants/app.ts` | `STORAGE_KEYS.theme` |
| Modify | 12 component files (listed in Task 9) | `bg-white` → `bg-surface`, hex literals → tokens, `text-ground` on ink buttons → `text-on-ink` |
| Create | `e2e/theme.spec.ts` | System default, toggle, persistence, no flash |

---

## Task 0: Branch setup and task bookkeeping (PR 1)

**Files:**
- Modify: `tasks.md` (Milestone 7 → Product, and a new Milestone 9 heading)

- [ ] **Step 1: Create the branch from origin/main**

```bash
cd /Users/rajtaneja/Projects/varkly
git fetch origin
git worktree add ~/.worktrees/varkly/design-sync-content -b feat/design-sync-content origin/main
cd ~/.worktrees/varkly/design-sync-content
git log --oneline -1
```

Expected: `8c24b52 Merge pull request #17 from aibraincoach/docs/merged-state-sync`. If the SHA differs, stop and report; `main` has moved again and the plan needs re-verification.

- [ ] **Step 2: Install and confirm the baseline is green**

```bash
npm ci
npm run lint && npm run typecheck && npm test
```

Expected: lint clean, typecheck clean, Vitest and node tests pass. Record the counts in your report.

- [ ] **Step 3: Add the Milestone 9 task list to `tasks.md`**

Insert before the `## Session Log` heading:

```markdown
## Milestone 9 — Designer sync 2026-09-09 (VARK Panels)

Source: `VARKLY Questionnaire Design.zip`, `github.md` sync 2026-09-09T12:14:29Z. Plan: `docs/superpowers/plans/2026-09-09-design-sync-vark-panels.md`. Two PRs, reviewed via AGY/PPLX before any merge consideration.

### PR 1 — `feat/design-sync-content`

- [ ] Landing: four VARK style tiles fill `.panels-aside-body`; auto-height below 1100px
- [ ] About VARK: `/about` route, `AboutView`, tertiary landing button, Enter starts quiz, ← returns to landing
- [ ] Results: `ExplanationCard` under score rows with COPY.md §16–21 description and tips (2+2 for two dominant styles, balanced for three or more)
- [ ] Layout verification: `e2e/design-sync-layout.spec.ts` overflow and action-row invariants, screenshots at 1440/1100/390 for landing, about, results variants

### PR 2 — `feat/dark-mode-reinstatement`

- [ ] Tokens: single CSS-variable palette driving light and dark; no `dark:` variants
- [ ] Theme provider, header toggle, system default, localStorage persistence, flash-prevention script
- [ ] Layout verification repeated in dark mode

### Deferred until owner review

- [ ] Narrative docs: `DESIGN.md` light-only statements, `planning.md` §9 and line 39, `AGENTS.md` deleted-files line and file map, `COPY.md` About VARK and tile copy, `README.md` styling row
- [ ] Hover states for new elements — open design question, owner to assign
```

- [ ] **Step 4: Commit**

```bash
git add tasks.md
git commit -m "docs: add Milestone 9 designer-sync task list"
git push -u origin feat/design-sync-content
```

---

## Task 1: Landing style tiles

**Files:**
- Create: `src/data/varkStyles.ts`
- Modify: `src/types/index.ts`
- Modify: `src/components/panels/LandingView.tsx`
- Modify: `e2e/layout.spec.ts` (U1 landing block)

**Interfaces:**
- Produces: `VARK_STYLE_TILES: readonly VarkStyleTile[]` with `{ code: VarkStyle; name: string; blurb: string; dotClass: string }`. Task 4 reuses `dotClass` values.

Design reference (`VARK Panels.dc.html` lines 40–55): the landing aside is eyebrow → `<h1>` (display line + intro span) → a `--body-h` block with `align-content: space-between` holding the tips `<ul>` at the top and a two-column tile grid at the bottom. Each tile: 1.5px `line` border, 12px radius, `surface` background, 12px/14px padding, a 13px semibold name with an 8px color dot, and a 12px muted blurb.

- [ ] **Step 1: Add the tile type**

Append to `src/types/index.ts`:

```ts
export type VarkStyleTile = {
  code: VarkStyle;
  name: string;
  blurb: string;
  dotClass: string;
};
```

- [ ] **Step 2: Create the tile data**

Create `src/data/varkStyles.ts`:

```ts
import type { VarkStyleTile } from '../types';

/** Landing tiles from the 2026-09-09 design sync; blurbs are verbatim. */
export const VARK_STYLE_TILES: readonly VarkStyleTile[] = [
  { code: 'V', name: 'Visual', blurb: 'Charts, diagrams, seeing it demonstrated', dotClass: 'bg-vark-v' },
  { code: 'A', name: 'Auditory', blurb: 'Listening, discussion, verbal instructions', dotClass: 'bg-vark-a' },
  { code: 'R', name: 'Read/Write', blurb: 'Words, lists, written materials', dotClass: 'bg-vark-r' },
  { code: 'K', name: 'Kinesthetic', blurb: 'Doing, experiencing, hands-on practice', dotClass: 'bg-vark-k' },
];
```

- [ ] **Step 3: Extend the U1 landing assertions (failing first)**

In `e2e/layout.spec.ts`, inside the `for (const viewport of VIEWPORTS)` loop, after `await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();` on the landing block, add:

```ts
    for (const blurb of [
      'Charts, diagrams, seeing it demonstrated',
      'Listening, discussion, verbal instructions',
      'Words, lists, written materials',
      'Doing, experiencing, hands-on practice',
    ]) {
      await expect(page.getByText(blurb)).toBeVisible();
    }
```

Run: `npx playwright test e2e/layout.spec.ts`
Expected: FAIL on the first blurb (`getByText` finds nothing).

- [ ] **Step 4: Rewrite `LandingView.tsx`**

Replace the file contents with:

```tsx
import React from 'react';
import { VARK_STYLE_TILES } from '../../data/varkStyles';

const LandingView: React.FC = () => {
  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        VARK learning style · 13 scenarios · 90 seconds
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em]">
        <span className="block text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.035em] mb-2.5">
          See. Hear.
          <br />
          Read. Do.
        </span>
        <span className="block font-normal text-[15px] leading-[1.55] text-muted-1 max-w-[46ch] text-pretty">
          Thirteen everyday scenarios. Pick every answer that sounds like you, skip the ones that
          don&apos;t. At the end you get your VARK profile and two prompts that make any AI adapt to
          how you actually learn.
        </span>
      </h1>
      <div className="panels-aside-body content-between">
        <ul className="m-0 p-0 list-none grid gap-2 text-sm text-[#3a3a42]">
          <li className="flex gap-2.5">
            <span className="text-muted-3 font-mono text-xs">01</span>
            Select all answers that apply to each scenario
          </li>
          <li className="flex gap-2.5">
            <span className="text-muted-3 font-mono text-xs">02</span>
            Skip questions that don&apos;t resonate with you
          </li>
          <li className="flex gap-2.5">
            <span className="text-muted-3 font-mono text-xs">03</span>
            Be honest — there are no wrong answers
          </li>
          <li className="flex gap-2.5">
            <span className="text-muted-3 font-mono text-xs">04</span>
            No account, nothing stored beyond this tab
          </li>
        </ul>
        <ul className="m-0 p-0 list-none grid grid-cols-2 gap-2" aria-label="The four VARK styles">
          {VARK_STYLE_TILES.map((tile) => (
            <li
              key={tile.code}
              className="border-[1.5px] border-line rounded-xl bg-white px-3.5 py-3 flex flex-col gap-1.5"
            >
              <span className="flex items-center gap-2 text-[13px] font-semibold">
                <span className={`w-2 h-2 rounded-full ${tile.dotClass}`} aria-hidden="true" />
                {tile.name}
              </span>
              <span className="text-xs leading-[1.45] text-muted-1">{tile.blurb}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default LandingView;
```

Notes for the implementer: the intro paragraph moves from the body block into the `<h1>` as a second span. This matches the design and the existing `ResultsView` / `PromptsView` pattern, and it is what lets the tips list and tiles fill the fixed-height block on desktop. Below 1100px `.panels-aside-body` is already `height: auto` (see `src/index.css`), so nothing else is needed for the auto-height requirement. `content-between` is Tailwind's `align-content: space-between`.

- [ ] **Step 5: Run lint, typecheck, and the layout spec**

```bash
npm run lint && npm run typecheck && npx playwright test e2e/layout.spec.ts
```

Expected: all green, including both U1 viewports. Also run `npx playwright test e2e/routes.spec.ts e2e/keyboard.spec.ts` because the landing marker `See. Hear.` and the `Let's begin` button are used there. Expected: green.

- [ ] **Step 6: Commit**

```bash
git add src/data/varkStyles.ts src/types/index.ts src/components/panels/LandingView.tsx e2e/layout.spec.ts
git commit -m "feat: fill landing aside with the four VARK style tiles"
git push
```

---

## Task 2: About VARK — routing and logic

**Files:**
- Modify: `src/constants/app.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/panels/panelsLogic.ts`
- Modify: `src/components/panels/__tests__/panelsLogic.test.ts`

**Interfaces:**
- Produces: `PanelsView` gains `'about'`; `PanelsSurface` gains `'about'`; `PageAction` gains `'open-landing'` and `'open-about'`; `parseRouteState('/about', n)` returns `{ active: -1, view: 'about', isShared: false }`; `getKeysHint('about', …)` returns `'← back · enter to start'`; `ROUTES.about === '/about'`.

Decision recorded here: About is a URL (`/about`), not local view state. Every other surface in `PanelsScreen` is derived from the pathname by `parseRouteState`, and the shipped design's state-only About view would be the one surface that does not survive a reload or a shared link. Keyboard Space on the landing view stays inert (`'none'`); the design routes Space to About through its generic skip handler, but its landing keys hint advertises only `enter to start`, and the tertiary button is the documented entry point.

- [ ] **Step 1: Write failing unit tests**

Append to `src/components/panels/__tests__/panelsLogic.test.ts`:

```ts
describe('about view', () => {
  it('maps /about to landing index with the about view', () => {
    expect(parseRouteState('/about', 5)).toEqual({ active: -1, view: 'about', isShared: false });
  });

  it('resolves the about surface', () => {
    expect(getPanelsSurface(-1, 'about')).toBe('about');
    expect(getPanelsSurface(-1, 'quiz')).toBe('landing');
  });

  it('Enter starts the quiz, ← returns to landing, Space does nothing', () => {
    expect(resolvePageAction('about', false, false, 'next')).toBe('start-quiz');
    expect(resolvePageAction('about', false, false, 'previous')).toBe('open-landing');
    expect(resolvePageAction('about', false, false, 'skip')).toBe('none');
  });

  it('keeps Space inert on landing', () => {
    expect(resolvePageAction('landing', false, false, 'skip')).toBe('none');
  });

  it('has its own keys hint', () => {
    expect(getKeysHint('about', false, false)).toBe('← back · enter to start');
  });
});
```

Run: `npx vitest run src/components/panels/__tests__/panelsLogic.test.ts`
Expected: FAIL (TypeScript rejects `'about'` and `'open-landing'`; the route test returns `view: 'quiz'`).

- [ ] **Step 2: Add the route constant**

In `src/constants/app.ts`, change `ROUTES` to:

```ts
export const ROUTES = {
  home: '/',
  about: '/about',
  quiz: '/quiz',
  results: '/results',
  prompts: '/prompts',
  resultByHash: (hash: string) => `/r/${hash}`,
  resultPromptsByHash: (hash: string) => `/r/${hash}/prompts`,
} as const;
```

- [ ] **Step 3: Register the route**

In `src/App.tsx`, after `<Route path={ROUTES.home} element={panelsRoute} />` add:

```tsx
              <Route path={ROUTES.about} element={panelsRoute} />
```

- [ ] **Step 4: Update `panelsLogic.ts`**

Change the type declarations near the top:

```ts
export type PanelsView = 'quiz' | 'prompts' | 'about';

export type PanelsSurface = 'landing' | 'about' | 'question' | 'results' | 'prompts';

export type PageAction =
  | 'start-quiz'
  | 'open-landing'
  | 'open-about'
  | 'open-prompts'
  | 'open-results'
  | 'open-first-question'
  | 'open-last-question'
  | 'copy-both'
  | 'retake'
  | 'none';
```

`PageSurface` is already `Exclude<PanelsSurface, 'question'>` and picks up `'about'` automatically.

In `parseRouteState`, before the `if (pathname === '/prompts')` line, add:

```ts
  if (pathname === '/about') {
    return { active: -1, view: 'about', isShared: false };
  }
```

Replace `getPanelsSurface`:

```ts
export function getPanelsSurface(active: number, view: PanelsView): PanelsSurface {
  if (active === 13) {
    return view === 'prompts' ? 'prompts' : 'results';
  }
  if (active < 0) {
    return view === 'about' ? 'about' : 'landing';
  }
  return 'question';
}
```

In `resolvePageAction`, after the `if (surface === 'landing') { … }` block, add:

```ts
  if (surface === 'about') {
    if (command === 'next') return 'start-quiz';
    if (command === 'previous') return 'open-landing';
    return 'none';
  }
```

In `getKeysHint`, after the `if (surface === 'landing') { … }` block, add:

```ts
  if (surface === 'about') {
    return '← back · enter to start';
  }
```

`'open-about'` is not produced by any keyboard command; it exists so `PanelsScreen` can route the tertiary button through the same `runPageAction` switch (Task 3).

- [ ] **Step 5: Run the unit tests and typecheck**

```bash
npx vitest run src/components/panels/__tests__/panelsLogic.test.ts && npm run typecheck
```

Expected: the new tests pass. Typecheck will FAIL in `PanelsScreen.tsx` because its `runPageAction` switch is not exhaustive over the two new actions. That is fixed in Task 3; do not commit until Task 3 Step 4 passes typecheck. (Combine Tasks 2 and 3 into one commit.)

---

## Task 3: About VARK — view and screen wiring

**Files:**
- Create: `src/components/panels/AboutView.tsx`
- Modify: `src/components/panels/PanelsScreen.tsx`
- Create: `e2e/about.spec.ts`

**Interfaces:**
- Consumes: Task 2 types and actions.
- Produces: `AboutView: React.FC` with no props.

Copy source: `VARK Panels.dc.html` lines 57–65 and 317–323. Verbatim.

- [ ] **Step 1: Write the failing e2e spec**

Create `e2e/about.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { expectQuestion, KEYBOARD_FOCUS_NOTE, progressLabel } from './helpers';

const ABOUT_HEADLINE = 'A language for how you like things explained.';
const LANDING_MARKER = 'See. Hear.';

test('A1: the landing tertiary button opens /about and ← returns to landing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'About VARK' }).click();

  await expect(page).toHaveURL(/\/about$/);
  await expect(progressLabel(page)).toHaveText('About VARK');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(ABOUT_HEADLINE);
  await expect(page.getByText('About VARK · Fleming, 1987')).toBeVisible();
  await expect(page.getByText('It measures preference, not ability.')).toBeVisible();
  await expect(page.getByText('The evidence is mixed.')).toBeVisible();
  await expect(page.getByText('Why Varkly uses it anyway.')).toBeVisible();
  await expect(
    page.getByText('VARK is a preference inventory, not a diagnosis. Treat your result as a starting point.')
  ).toBeVisible();
  await expect(page.getByText('← back · enter to start')).toBeVisible();
  await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toBeVisible();
  await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'About VARK' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Previous' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(LANDING_MARKER)).toBeVisible();
});

test('A2: Enter on /about starts the quiz and a reload stays on /about', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(ABOUT_HEADLINE);

  await page.reload();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(ABOUT_HEADLINE);

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/quiz$/);
  await expectQuestion(page, 1);
});

test('A3: Space on the landing view does nothing', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Space');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(LANDING_MARKER)).toBeVisible();
});
```

Run: `npx playwright test e2e/about.spec.ts`
Expected: A1 and A2 FAIL (no About VARK button; `/about` renders the landing view). A3 passes already.

- [ ] **Step 2: Create `AboutView.tsx`**

```tsx
import React from 'react';

const AboutView: React.FC = () => {
  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        About VARK · Fleming, 1987
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em]">
        <span className="block text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.035em] mb-2.5">
          A language for how you like things explained.
        </span>
        <span className="block font-normal text-[15px] leading-[1.55] text-muted-1 max-w-[46ch] text-pretty">
          VARK was developed by New Zealand educator Neil Fleming in 1987. It sorts the way people
          prefer to take in information into four modalities: Visual, Aural, Read/Write and
          Kinesthetic.
        </span>
      </h1>
      <div className="panels-aside-body content-start gap-3 text-sm leading-[1.55] text-[#3a3a42]">
        <p className="m-0 text-pretty">
          <strong className="font-semibold text-ink">It measures preference, not ability.</strong> A
          high Visual score means you reach for diagrams first, not that you can&apos;t learn from a
          lecture. Most people are multimodal.
        </p>
        <p className="m-0 text-pretty">
          <strong className="font-semibold text-ink">The evidence is mixed.</strong> Studies that
          teach to a person&apos;s stated style have not shown reliable gains in test scores. We
          don&apos;t claim VARK predicts how well you&apos;ll learn.
        </p>
        <p className="m-0 text-pretty">
          <strong className="font-semibold text-ink">Why Varkly uses it anyway.</strong> An AI will
          happily explain anything in any format. It just needs to be told which one. VARK gives you
          a clear, well-known vocabulary for that request, and the prompts we generate turn your
          answers into it.
        </p>
      </div>
    </>
  );
};

export default AboutView;
```

- [ ] **Step 3: Wire `PanelsScreen.tsx`**

Make each of these edits.

Import the view (after the `LandingView` import):

```ts
import AboutView from './AboutView';
```

After `const isLanding = surface === 'landing';` add:

```ts
  const isAbout = surface === 'about';
```

Page meta: replace the `pageTitle` and `pageDescription` expressions with:

```ts
  const pageTitle = isLanding
    ? 'VARK Learning Style Quiz'
    : isAbout
      ? 'About VARK'
      : isQuestion
        ? `Question ${String(active + 1).padStart(2, '0')}`
        : isPrompts
          ? 'Your AI Prompts'
          : 'Your VARK Profile';

  const pageDescription = isLanding
    ? 'Take the 90-second VARK quiz and discover how your brain learns best.'
    : isAbout
      ? 'What VARK measures, what it does not, and why Varkly uses it anyway.'
      : isQuestion
        ? 'Answer each scenario to build your VARK learning profile.'
        : isPrompts
          ? 'Copy personalized AI prompts built from your VARK scores.'
          : 'View your VARK learning style results and share your profile.';
```

Add two navigation callbacks after `goToPrompts`:

```ts
  const goToLanding = useCallback(() => navigate(ROUTES.home), [navigate]);
  const goToAbout = useCallback(() => navigate(ROUTES.about), [navigate]);
```

In `runPageAction`, add two cases before `case 'open-prompts':` and extend the dependency array:

```ts
        case 'open-landing':
          goToLanding();
          return;
        case 'open-about':
          goToAbout();
          return;
```

```ts
    [goToAbout, goToLanding, goToPrompts, goToQuestion, goToResults, handleCopyBoth, resetQuiz, startQuiz]
```

Add a tertiary handler after `handleSkip`:

```ts
  const handleTertiary = useCallback(() => {
    if (isLanding) {
      runPageAction('open-about');
      return;
    }
    handleSkip();
  }, [handleSkip, isLanding, runPageAction]);
```

Replace `progressLabel`:

```ts
  const progressLabel = isLanding
    ? 'Varkly · VARK quiz'
    : isAbout
      ? 'About VARK'
      : active === 13
        ? 'Results'
        : `Question ${String(active + 1).padStart(2, '0')} / 13`;
```

Replace `nextLabel`'s first branch so About shares the landing label:

```ts
  const nextLabel = isLanding || isAbout
    ? "Let's begin"
    : isPrompts
      ? copiedKey === 'both'
        ? 'Copied both'
        : 'Copy both prompts'
      : isResults
        ? hasAnswers
          ? 'Get my AI prompts'
          : emptyResultsPrimaryLabel
        : active === 12
          ? 'See results'
          : 'Next';
```

Replace `skipLabel`:

```ts
  const skipLabel = isLanding ? 'About VARK' : active === 13 ? 'Retake' : 'Skip';
```

Replace `helperLine`:

```ts
  const helperLine = isLanding
    ? "Your brain already knows how it works best. Let's teach your AI the same thing."
    : isAbout
      ? 'VARK is a preference inventory, not a diagnosis. Treat your result as a starting point.'
      : isPrompts
        ? 'Paste into ChatGPT, Claude, Gemini or any other AI tool.'
        : isResults
          ? hasAnswers
            ? 'Share of all selections, across every answered scenario.'
            : 'Choose at least one answer to get your AI prompts.'
          : 'Select all that apply, or skip if none do.';
```

In the JSX, after `{isLanding && <LandingView />}` add:

```tsx
          {isAbout && <AboutView />}
```

Change the `ActionRow` props:

```tsx
          <ActionRow
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSkip={handleTertiary}
            nextLabel={nextLabel}
            skipLabel={skipLabel}
            previousDisabled={previousDisabled}
            showSkip={!isAbout}
          />
```

Change the `PanelRail` prop so the rail shows all panels equal on About as well as landing (design: `allEqual = active === -1`):

```tsx
          isLanding={active === -1}
```

`previousDisabled` needs no change: for `about`, `resolvePageAction('about', …, 'previous')` is `'open-landing'`, so the button is enabled; for landing it stays disabled.

- [ ] **Step 4: Run everything**

```bash
npm run lint && npm run typecheck && npm test && npx playwright test e2e/about.spec.ts e2e/layout.spec.ts e2e/keyboard.spec.ts e2e/routes.spec.ts
```

Expected: all green. If K-tests that count `Skip` buttons on landing fail, read the failing assertion before changing anything and report; the landing tertiary button is new and intended.

- [ ] **Step 5: Commit**

```bash
git add src/constants/app.ts src/App.tsx src/components/panels/panelsLogic.ts src/components/panels/__tests__/panelsLogic.test.ts src/components/panels/AboutView.tsx src/components/panels/PanelsScreen.tsx e2e/about.spec.ts
git commit -m "feat: add About VARK view behind /about with landing tertiary button"
git push
```

---

## Task 4: Results explanation — data and pure logic

**Files:**
- Create: `src/data/varkExplanations.ts`
- Create: `src/utils/explanation.ts`
- Create: `src/utils/__tests__/explanation.test.ts`
- Modify: `src/types/index.ts`

**Interfaces:**
- Consumes: `getDominantStyles(scores)` from `src/utils/scores.ts` (returns `VarkStyle[]`, empty when all scores are zero).
- Produces: `buildExplanation(dominant: VarkStyle[]): ResultsExplanation` where `ResultsExplanation = { title: string; description: string | null; tips: string[] }`.

Copy source: `COPY.md` §16–§21 on `main` at `8c24b52`. The user's brief said "§16–22"; §22 is the RayRayRay closing quote, which the designer did not include in the card, so it is out of scope. `github.md` says "4 tips" per card; that is what the rules below produce for every branch (four for one dominant style, two plus two for two, four balanced for three or more).

- [ ] **Step 1: Add the type**

Append to `src/types/index.ts`:

```ts
export type ResultsExplanation = {
  title: string;
  /** Null for the empty state; otherwise the COPY.md description paragraph. */
  description: string | null;
  tips: string[];
};
```

- [ ] **Step 2: Create the data file**

Create `src/data/varkExplanations.ts`:

```ts
import type { VarkStyle } from '../types';

export type ExplanationEntry = {
  description: string;
  tips: readonly [string, string, string, string];
};

/** COPY.md §17–§21, verbatim. */
export const VARK_EXPLANATIONS: Record<VarkStyle | 'B', ExplanationEntry> = {
  V: {
    description:
      "You process information best when it's presented visually. Charts, diagrams, and demonstrations help you understand and remember concepts more effectively.",
    tips: [
      'Use color-coding and highlighters in your notes',
      'Convert text information into diagrams, charts, and mindmaps',
      'Watch video demonstrations before attempting new tasks',
      'Use flashcards with images and visual cues',
    ],
  },
  A: {
    description:
      'You learn best through listening and verbal communication. Discussions, lectures, and talking through ideas help you process information effectively.',
    tips: [
      'Record lectures or read your notes aloud to review later',
      'Discuss concepts with others to solidify understanding',
      'Use mnemonic devices and rhymes to remember information',
      'Consider audiobooks or podcast learning materials',
    ],
  },
  R: {
    description:
      'You prefer information displayed as words. Reading and writing help you understand and remember concepts most effectively.',
    tips: [
      'Take detailed notes and rewrite them to enhance memory',
      'Convert diagrams and charts into written descriptions',
      'Create lists, headings, and organized notes',
      'Look for text-based resources rather than visual or interactive ones',
    ],
  },
  K: {
    description:
      'You learn through doing, experiencing, and hands-on activities. Physical involvement helps you understand and remember information.',
    tips: [
      'Use physical objects or models when possible',
      'Take breaks to move around while studying',
      'Apply concepts to real-world scenarios or case studies',
      'Create physical flashcards you can manipulate and arrange',
    ],
  },
  B: {
    description: 'You have a flexible learning style and can adapt to different teaching methods.',
    tips: [
      'Use a variety of learning techniques',
      'Adapt your approach based on the subject matter',
      'Take advantage of different resources available',
      'Share your learning flexibility with teachers and peers',
    ],
  },
};

/** COPY.md §16, multimodal state paragraph (bold markup removed). */
export const MULTIMODAL_DESCRIPTION =
  "You have a multimodal learning style with strengths across several categories. This means you're adaptable and can learn effectively through different methods.";

/** COPY.md §16, empty state. */
export const EMPTY_EXPLANATION_LINE = 'Complete more questions to see your results!';

export const STYLE_NAMES: Record<VarkStyle, string> = {
  V: 'Visual',
  A: 'Auditory',
  R: 'Read/Write',
  K: 'Kinesthetic',
};
```

- [ ] **Step 3: Write the failing tests**

Create `src/utils/__tests__/explanation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { buildExplanation } from '../explanation';
import { VARK_EXPLANATIONS, MULTIMODAL_DESCRIPTION, EMPTY_EXPLANATION_LINE } from '../../data/varkExplanations';

describe('buildExplanation', () => {
  it('empty: generic title, no description, the empty-state line as the only tip', () => {
    expect(buildExplanation([])).toEqual({
      title: 'Learning tips',
      description: null,
      tips: [EMPTY_EXPLANATION_LINE],
    });
  });

  it('one dominant style: that style description and all four tips', () => {
    expect(buildExplanation(['K'])).toEqual({
      title: 'Learning tips for Kinesthetic learners',
      description: VARK_EXPLANATIONS.K.description,
      tips: [...VARK_EXPLANATIONS.K.tips],
    });
  });

  it('two dominant styles: multimodal description and two tips from each, in VARK order', () => {
    expect(buildExplanation(['V', 'R'])).toEqual({
      title: 'Learning tips',
      description: MULTIMODAL_DESCRIPTION,
      tips: [
        VARK_EXPLANATIONS.V.tips[0],
        VARK_EXPLANATIONS.V.tips[1],
        VARK_EXPLANATIONS.R.tips[0],
        VARK_EXPLANATIONS.R.tips[1],
      ],
    });
  });

  it('three or more dominant styles: multimodal description and the balanced tips', () => {
    const three = buildExplanation(['V', 'A', 'K']);
    expect(three.title).toBe('Learning tips for balanced learners');
    expect(three.description).toBe(MULTIMODAL_DESCRIPTION);
    expect(three.tips).toEqual([...VARK_EXPLANATIONS.B.tips]);
    expect(buildExplanation(['V', 'A', 'R', 'K'])).toEqual(three);
  });
});
```

Run: `npx vitest run src/utils/__tests__/explanation.test.ts`
Expected: FAIL (module `../explanation` not found).

- [ ] **Step 4: Implement `buildExplanation`**

Create `src/utils/explanation.ts`:

```ts
import type { ResultsExplanation, VarkStyle } from '../types';
import {
  EMPTY_EXPLANATION_LINE,
  MULTIMODAL_DESCRIPTION,
  STYLE_NAMES,
  VARK_EXPLANATIONS,
} from '../data/varkExplanations';

/**
 * Tip selection mirrors the 2026-09-09 design: four tips for one dominant style,
 * two from each for two, the balanced set for three or more.
 */
export function buildExplanation(dominant: VarkStyle[]): ResultsExplanation {
  if (dominant.length === 0) {
    return { title: 'Learning tips', description: null, tips: [EMPTY_EXPLANATION_LINE] };
  }

  if (dominant.length === 1) {
    const style = dominant[0];
    return {
      title: `Learning tips for ${STYLE_NAMES[style]} learners`,
      description: VARK_EXPLANATIONS[style].description,
      tips: [...VARK_EXPLANATIONS[style].tips],
    };
  }

  if (dominant.length === 2) {
    const [first, second] = dominant;
    return {
      title: 'Learning tips',
      description: MULTIMODAL_DESCRIPTION,
      tips: [
        VARK_EXPLANATIONS[first].tips[0],
        VARK_EXPLANATIONS[first].tips[1],
        VARK_EXPLANATIONS[second].tips[0],
        VARK_EXPLANATIONS[second].tips[1],
      ],
    };
  }

  return {
    title: 'Learning tips for balanced learners',
    description: MULTIMODAL_DESCRIPTION,
    tips: [...VARK_EXPLANATIONS.B.tips],
  };
}
```

- [ ] **Step 5: Run tests and typecheck**

```bash
npx vitest run src/utils/__tests__/explanation.test.ts && npm run typecheck && npm run lint
```

Expected: PASS, clean.

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/data/varkExplanations.ts src/utils/explanation.ts src/utils/__tests__/explanation.test.ts
git commit -m "feat: add results explanation data and tip selection from COPY.md §16-21"
git push
```

---

## Task 5: Results explanation — card and view

**Files:**
- Create: `src/components/panels/ExplanationCard.tsx`
- Modify: `src/components/panels/ResultsView.tsx`
- Modify: `src/components/panels/PanelsScreen.tsx`
- Modify: `e2e/layout.spec.ts` (U1 results blocks)

**Interfaces:**
- Consumes: `buildExplanation`, `getDominantStyles`, `ResultsExplanation`.
- Produces: `ResultsView` gains a required prop `explanation: ResultsExplanation`.

Decision recorded here: the `<h1>` blurb stays as shipped (`COPY.md` "Results view → Blurbs"; asserted in `scores.test.ts`). The design file puts the COPY.md description into the `<h1>` blurb instead. The brief asks for "full per-style description plus a tips card … under the score rows", so the card carries the description paragraph followed by the tips. If the owner prefers the design's placement, the change is one line in `scores.ts` and one in `ExplanationCard.tsx`; flagged under "Open design questions".

Design reference (`VARK Panels.dc.html` lines 81–99): body block `content-between`; rows in a `grid gap-2`; card with 1.5px `line` border, 12px radius, `surface` background, 14px/16px padding, 13px semibold title with 8px bottom margin, tips as a 6px-gap list of 13px/1.45 lines with a mono two-digit index.

- [ ] **Step 1: Extend U1 (failing first)**

In `e2e/layout.spec.ts`, in the `ANSWERED` results block after `await expectResultsSurface(page);`, add:

```ts
    await expect(page.getByText('Learning tips for Visual learners')).toBeVisible();
    await expect(page.getByText('Use color-coding and highlighters in your notes')).toBeVisible();
```

`ANSWERED` selects `1V`, `1R`, `2A`, `5K`, which is V=1, A=1, R=1, K=1 — four-way tie, so that expectation is wrong. Change `ANSWERED` at the top of the file to a clear Visual profile instead:

```ts
const ANSWERED = {
  currentQuestionIndex: 12,
  answers: { '1': ['1V', '1R'], '2': ['2V'], '5': ['5V'] },
  isCompleted: true,
};
```

(V=3, R=1. Read `src/data/questions.ts` to confirm option ids `2V` and `5V` exist before relying on them; option ids follow `${questionId}${type}`.)

In the `COMPLETED_EMPTY` results block after `await expect(page.getByText(EMPTY_HELPER)).toBeVisible();` add:

```ts
    await expect(page.getByText('Complete more questions to see your results!')).toBeVisible();
```

Run: `npx playwright test e2e/layout.spec.ts`
Expected: FAIL on the `Learning tips for Visual learners` assertion.

- [ ] **Step 2: Create `ExplanationCard.tsx`**

```tsx
import React from 'react';
import type { ResultsExplanation } from '../../types';

type ExplanationCardProps = {
  explanation: ResultsExplanation;
};

const ExplanationCard: React.FC<ExplanationCardProps> = ({ explanation }) => {
  return (
    <section
      aria-labelledby="explanation-title"
      className="border-[1.5px] border-line rounded-xl bg-white px-4 py-3.5"
    >
      <h2 id="explanation-title" className="m-0 mb-2 text-[13px] font-semibold tracking-normal">
        {explanation.title}
      </h2>
      {explanation.description && (
        <p className="m-0 mb-2 text-[13px] leading-[1.45] text-[#3a3a42] text-pretty">
          {explanation.description}
        </p>
      )}
      <ol className="m-0 p-0 list-none grid gap-1.5 text-[13px] leading-[1.45] text-[#3a3a42]">
        {explanation.tips.map((tip, index) => (
          <li key={tip} className="flex gap-2.5">
            <span className="pt-0.5 text-muted-3 font-mono text-[11px]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{tip}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default ExplanationCard;
```

- [ ] **Step 3: Update `ResultsView.tsx`**

Replace the file with:

```tsx
import React from 'react';
import type { ResultsExplanation, ScoreSummary } from '../../types';
import ScoreRows from './ScoreRows';
import ExplanationCard from './ExplanationCard';
import { getResultsEyebrow } from './panelsLogic';

type ResultsViewProps = {
  answeredCount: number;
  summary: ScoreSummary;
  explanation: ResultsExplanation;
  onCopyLink: () => void;
  copyLinkLabel: string;
  isShared: boolean;
};

const ResultsView: React.FC<ResultsViewProps> = ({
  answeredCount,
  summary,
  explanation,
  onCopyLink,
  copyLinkLabel,
  isShared,
}) => {
  return (
    <>
      <div className="font-mono text-[11px] tracking-[0.08em] uppercase text-muted-3">
        {getResultsEyebrow(isShared, answeredCount)}
      </div>
      <h1 className="mt-3.5 mb-[22px] min-h-[5.4em] text-[clamp(18px,1.5vw,23px)] leading-[1.35] font-semibold tracking-[-0.02em] text-pretty">
        <span className="block text-[clamp(28px,2.4vw,38px)] leading-[1.1] tracking-[-0.035em] mb-2.5">
          {summary.headline}
        </span>
        <span className="block font-normal text-[15px] leading-[1.55] text-muted-1 max-w-[46ch]">
          {summary.blurb}
        </span>
      </h1>
      <div className="panels-aside-body content-between">
        <div className="grid gap-2">
          <ScoreRows styles={summary.styles} />
        </div>
        <ExplanationCard explanation={explanation} />
      </div>
      <button
        type="button"
        onClick={onCopyLink}
        className="mt-3 text-sm font-semibold text-ink underline underline-offset-2 hover:text-muted-1"
        aria-live="polite"
      >
        {copyLinkLabel}
      </button>
    </>
  );
};

export default ResultsView;
```

- [ ] **Step 4: Wire `PanelsScreen.tsx`**

Add imports:

```ts
import { calculateScores, decodeScores, encodeScores, getDominantStyles, summarizeScores } from '../../utils/scores';
import { buildExplanation } from '../../utils/explanation';
```

(Replace the existing `scores` import line; it currently lacks `getDominantStyles`.)

After `const summary = summarizeScores(scores);` add:

```ts
  const explanation = buildExplanation(getDominantStyles(scores));
```

Pass it to the view:

```tsx
            <ResultsView
              answeredCount={answeredCount}
              summary={summary}
              explanation={explanation}
              onCopyLink={handleCopyLink}
              copyLinkLabel={copiedKey === 'link' ? 'Copied' : 'Copy link'}
              isShared={isShared}
            />
```

- [ ] **Step 5: Run everything**

```bash
npm run lint && npm run typecheck && npm test && npx playwright test
```

Expected: all green. `routes.spec.ts` R1 asserts the empty-results heading and helper; the extra card line does not collide with those assertions. If `page.getByText('Retake')` or similar becomes ambiguous because a tip contains the same word, the failure will say "strict mode violation"; report it, do not change the tip copy.

- [ ] **Step 6: Commit**

```bash
git add src/components/panels/ExplanationCard.tsx src/components/panels/ResultsView.tsx src/components/panels/PanelsScreen.tsx e2e/layout.spec.ts
git commit -m "feat: add explanation card with description and tips under results score rows"
git push
```

---

## Task 6: Layout verification pass (PR 1)

**Files:**
- Create: `e2e/design-sync-layout.spec.ts`

This task is the explicit spacing/layout review the brief requires. It is not satisfied by matching the design file. It produces two things: automated invariants that fail on overflow or on a moving action row, and a set of screenshots the coder must look at and report on, one by one.

Invariants under test:

1. On desktop (≥1100px) `.panels-aside-body` is a fixed-height block. Its content must not overflow it (`scrollHeight <= clientHeight + 1`). This catches the tiles, the About paragraphs, and the explanation card (especially the two-dominant and balanced variants, and the narrowest aside at exactly 1100px where the aside is 360px wide and text wraps most).
2. The action row's top edge must sit at the same y across landing, about, and every results variant at a given viewport ("the action row never moves", `tasks.md` PR B).
3. No horizontal overflow at any viewport (existing helper).
4. On 390px the body is auto height: it must still not clip (`scrollHeight <= clientHeight + 1` holds trivially when auto), and the page must not overflow horizontally.

- [ ] **Step 1: Write the spec**

Create `e2e/design-sync-layout.spec.ts`:

```ts
import fs from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import {
  E2E_ARTIFACT_DIR,
  expectNoHorizontalOverflow,
  expectResultsSurface,
  seedQuizState,
  type SeededQuizState,
} from './helpers';

const VIEWPORTS = [
  { slug: 'desktop-1440', width: 1440, height: 900 },
  { slug: 'desktop-1100', width: 1100, height: 900 },
  { slug: 'mobile-390', width: 390, height: 844 },
];

const RESULT_VARIANTS: Array<{ slug: string; state: SeededQuizState }> = [
  {
    slug: 'results-one-dominant',
    state: { currentQuestionIndex: 12, answers: { '1': ['1V'], '2': ['2V'], '3': ['3V'] }, isCompleted: true },
  },
  {
    slug: 'results-two-dominant',
    state: { currentQuestionIndex: 12, answers: { '1': ['1V', '1K'], '2': ['2V', '2K'] }, isCompleted: true },
  },
  {
    slug: 'results-balanced',
    state: {
      currentQuestionIndex: 12,
      answers: { '1': ['1V', '1A', '1R', '1K'] },
      isCompleted: true,
    },
  },
  {
    slug: 'results-empty',
    state: { currentQuestionIndex: 12, answers: {}, isCompleted: true },
  },
];

async function bodyMetrics(page: Page) {
  return page.evaluate(() => {
    const body = document.querySelector('.panels-aside-body');
    if (!(body instanceof HTMLElement)) throw new Error('.panels-aside-body not found');
    return { scrollHeight: body.scrollHeight, clientHeight: body.clientHeight };
  });
}

async function actionRowTop(page: Page): Promise<number> {
  const box = await page.getByRole('button', { name: 'Previous' }).boundingBox();
  if (!box) throw new Error('Previous button has no bounding box');
  return Math.round(box.y);
}

async function snapshot(page: Page, name: string) {
  fs.mkdirSync(E2E_ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${E2E_ARTIFACT_DIR}/design-sync-${name}.png`, fullPage: true });
}

for (const viewport of VIEWPORTS) {
  test(`L1: aside body never overflows and the action row never moves on ${viewport.slug}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const rowTops: Record<string, number> = {};

    await page.goto('/');
    await expect(page.getByText('See. Hear.')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    let metrics = await bodyMetrics(page);
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
    rowTops.landing = await actionRowTop(page);
    await snapshot(page, `landing-${viewport.slug}`);

    await page.goto('/about');
    await expect(page.getByText('About VARK · Fleming, 1987')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    metrics = await bodyMetrics(page);
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
    rowTops.about = await actionRowTop(page);
    await snapshot(page, `about-${viewport.slug}`);

    for (const variant of RESULT_VARIANTS) {
      await seedQuizState(page, variant.state, '/results');
      await expectResultsSurface(page);
      await expectNoHorizontalOverflow(page);
      metrics = await bodyMetrics(page);
      expect(metrics.scrollHeight, variant.slug).toBeLessThanOrEqual(metrics.clientHeight + 1);
      rowTops[variant.slug] = await actionRowTop(page);
      await snapshot(page, `${variant.slug}-${viewport.slug}`);
    }

    if (viewport.width >= 1100) {
      const tops = Object.values(rowTops);
      expect(new Set(tops).size, JSON.stringify(rowTops)).toBe(1);
    }
  });
}
```

Run: `npx playwright test e2e/design-sync-layout.spec.ts`
Expected: PASS at all three viewports. A failure here is a real layout defect, not a test problem. Do not raise the `+ 1` tolerance. Typical causes and the only sanctioned fixes:

- Explanation card overflows at 1100px for the balanced or two-dominant variant → reduce `ExplanationCard` vertical padding from `py-3.5` to `py-3` and list gap from `gap-1.5` to `gap-1`. If it still overflows, stop and report with the screenshot; the fix is then a design decision (drop the description from the card, or change `--body-h`).
- About paragraphs overflow at 1100px → stop and report with the screenshot; the copy is the designer's and must not be edited.
- Action row moves → one of the views has content escaping the fixed block or a different `<h1>` `min-h`; compare the screenshots, find the view whose row moved, fix that view's structure to match the others (eyebrow → `<h1 min-h-[5.4em]>` → `.panels-aside-body`).

- [ ] **Step 2: Look at every screenshot and report**

Open each file under `.superpowers/sdd/varkly-close-review-findings/artifacts/design-sync-*.png` (18 files) and check, per screenshot:

- Tile grid: two columns, equal tile heights per row, dot vertically centred on the name, blurb not wrapping to three lines at 1100px.
- About: three paragraphs with visible 12px gaps, bold lead-ins on the same line as the following sentence, no widow lines caused by `text-pretty` failing.
- Results: rows at the top, card at the bottom, visible gap between them at 1440px; at 1100px the card may touch the rows only if `content-between` has no slack — report the pixel gap.
- Mobile 390: header does not wrap; tiles are two columns of roughly 175px; the card and rows stack with 8px gaps; the footer is below the rail, not floating.

Write the findings into the PR description under a heading `Layout review (Task 6)` as one bullet per screenshot: file name, PASS or the defect seen. No screenshot may be skipped. Attach the four most informative screenshots (1100 landing, 1100 results-balanced, 390 landing, 390 results-two-dominant) to the PR.

- [ ] **Step 3: Full suite and commit**

```bash
npm run lint && npm run typecheck && npm test && npm run test:e2e
```

Expected: all green. Record the Playwright pass count.

```bash
git add e2e/design-sync-layout.spec.ts
git commit -m "test: guard fixed-height aside body and action-row position across design-sync views"
git push
```

- [ ] **Step 4: Open PR 1 (draft, no merge)**

```bash
gh pr create --draft --base main --head feat/design-sync-content \
  --title "feat: designer sync 2026-09-09 — landing tiles, About VARK, results explanation" \
  --body-file /dev/stdin <<'EOF'
Implements changes 2, 3, and 4 of the 2026-09-09 designer sync (`VARKLY Questionnaire Design.zip`, `github.md` 2026-09-09T12:14:29Z) against `main` at `8c24b52`. Dark mode is a separate stacked PR.

- Landing: four VARK style tiles fill `.panels-aside-body`; intro moved into the `<h1>` per design; auto-height below 1100px via the existing rule.
- About VARK: `/about` route, `AboutView`, tertiary `About VARK` button on landing, `←` returns to landing, Enter starts the quiz. Resolves the Milestone 7 "Restore an About VARK entry point" item.
- Results: `ExplanationCard` under the score rows with the COPY.md §16–21 description and tips. Two tips each for two dominant styles, balanced tips for three or more. Resolves the Milestone 7 "Reinstate a condensed results explanation" item.
- Verification: `e2e/design-sync-layout.spec.ts` asserts no aside-body overflow and a fixed action-row position at 1440/1100/390; screenshots reviewed one by one below.

Decisions taken in the plan and open for the owner: About as a URL rather than local state; Space stays inert on landing; the `<h1>` blurb stays as shipped and the COPY description lives in the card; hover states for new elements left as an open design question.

## Layout review (Task 6)

(one bullet per screenshot)

## Verification

(lint / typecheck / vitest count / node test count / playwright count)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01NBwZ7jSmPyC4GBwSk3bD5v
EOF
```

Fill in the two sections before submitting. Report the PR number and head SHA as "as pushed by me at <time>", never as verified main state.

---

## Task 7: Branch setup (PR 2)

- [ ] **Step 1: Branch from PR 1's head**

```bash
cd /Users/rajtaneja/Projects/varkly
git worktree add ~/.worktrees/varkly/dark-mode -b feat/dark-mode-reinstatement feat/design-sync-content
cd ~/.worktrees/varkly/dark-mode
npm ci
npm run lint && npm run typecheck && npm test
```

Expected: green baseline identical to PR 1's final counts.

---

## Task 8: Token layer — one palette, two modes

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `index.html`

**Interfaces:**
- Produces Tailwind color names: `ink`, `on-ink`, `ink-hover`, `ground`, `surface`, `line`, `line-2`, `text-2`, `track`, `box`, `muted-1`..`muted-4`, all alpha-capable (`bg-ink/15` keeps working). `panel` and `vark-*` stay fixed hex. `<html data-theme="light|dark">` is the switch.

Token values are the design file's `:root` and `:root[data-theme="dark"]` blocks (`VARK Panels.dc.html` lines 14–15) converted to RGB channel triplets so Tailwind's `<alpha-value>` works. The design's `--bar` maps to the existing `track` name to avoid renaming `ScoreRows`.

| Token | Light hex → triplet | Dark hex → triplet |
|---|---|---|
| ground | `#f3f3f5` → `243 243 245` | `#121216` → `18 18 22` |
| ink | `#1f1f24` → `31 31 36` | `#f1f1f4` → `241 241 244` |
| on-ink | `#ffffff` → `255 255 255` | `#121216` → `18 18 22` |
| ink-hover | `#39393f` → `57 57 63` | `#d6d6dc` → `214 214 220` |
| surface | `#ffffff` → `255 255 255` | `#1b1b20` → `27 27 32` |
| line | `#dedee3` → `222 222 227` | `#2d2d35` → `45 45 53` |
| line-2 | `#ececf0` → `236 236 240` | `#25252b` → `37 37 43` |
| text-2 | `#3a3a42` → `58 58 66` | `#d2d2d8` → `210 210 216` |
| muted-1 | `#5b5b66` → `91 91 102` | `#aaaab4` → `170 170 180` |
| muted-2 | `#6b6b76` → `107 107 118` | `#9c9ca6` → `156 156 166` |
| muted-3 | `#8a8a94` → `138 138 148` | `#7e7e89` → `126 126 137` |
| muted-4 | `#9a9aa3` → `154 154 163` | `#6c6c77` → `108 108 119` |
| box | `#f0f0f3` → `240 240 243` | `#2a2a31` → `42 42 49` |
| track (design `--bar`) | `#e2e2e7` → `226 226 231` | `#2d2d35` → `45 45 53` |

- [ ] **Step 1: Replace the `colors` block in `tailwind.config.js`**

```js
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'on-ink': 'rgb(var(--on-ink) / <alpha-value>)',
        'ink-hover': 'rgb(var(--ink-hover) / <alpha-value>)',
        ground: 'rgb(var(--ground) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        'line-2': 'rgb(var(--line-2) / <alpha-value>)',
        'text-2': 'rgb(var(--text-2) / <alpha-value>)',
        track: 'rgb(var(--track) / <alpha-value>)',
        box: 'rgb(var(--box) / <alpha-value>)',
        panel: '#1a1a20',
        muted: {
          1: 'rgb(var(--muted-1) / <alpha-value>)',
          2: 'rgb(var(--muted-2) / <alpha-value>)',
          3: 'rgb(var(--muted-3) / <alpha-value>)',
          4: 'rgb(var(--muted-4) / <alpha-value>)',
        },
        vark: {
          v: '#af52de',
          a: '#0071e3',
          r: '#34c759',
          k: '#ff9f0a',
        },
      },
```

- [ ] **Step 2: Replace the `:root` block and scrollbar colors in `src/index.css`**

Replace the existing `:root { color-scheme: light only; … }` block with:

```css
  :root {
    color-scheme: light;
    --panel-collapsed-width: 64px;
    --panel-gap: 10px;
    --panel-gap-total: calc(var(--panel-gap) * 13);

    --ground: 243 243 245;
    --ink: 31 31 36;
    --on-ink: 255 255 255;
    --ink-hover: 57 57 63;
    --surface: 255 255 255;
    --line: 222 222 227;
    --line-2: 236 236 240;
    --text-2: 58 58 66;
    --muted-1: 91 91 102;
    --muted-2: 107 107 118;
    --muted-3: 138 138 148;
    --muted-4: 154 154 163;
    --box: 240 240 243;
    --track: 226 226 231;
  }

  :root[data-theme="dark"] {
    color-scheme: dark;
    --ground: 18 18 22;
    --ink: 241 241 244;
    --on-ink: 18 18 22;
    --ink-hover: 214 214 220;
    --surface: 27 27 32;
    --line: 45 45 53;
    --line-2: 37 37 43;
    --text-2: 210 210 216;
    --muted-1: 170 170 180;
    --muted-2: 156 156 166;
    --muted-3: 126 126 137;
    --muted-4: 108 108 119;
    --box: 42 42 49;
    --track: 45 45 53;
  }
```

Replace the `body` rule so background and text transition like the design (`transition: background .3s, color .3s`):

```css
  body {
    @apply bg-ground text-ink font-sans antialiased transition-colors duration-300 motion-reduce:transition-none;
    font-feature-settings: "ss01", "ss02", "cv01", "cv02";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
```

Replace the hardcoded scrollbar rule:

```css
  * {
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--line)) rgb(var(--ground));
  }
```

- [ ] **Step 3: Add the flash-prevention script to `index.html`**

Immediately after `<body>` and before `<div id="root"></div>`:

```html
    <script>
      (function () {
        var key = 'varkly-theme';
        var stored = null;
        try { stored = localStorage.getItem(key); } catch (e) {}
        var dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
      })();
    </script>
```

Also change the static `theme-color` meta so it has a light/dark pair (the provider updates the single tag at runtime, but this gives correct chrome colour before hydration):

```html
    <meta name="theme-color" content="#f3f3f5" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#121216" media="(prefers-color-scheme: dark)" />
```

- [ ] **Step 4: Build and verify light mode is pixel-stable**

```bash
npm run build && npx playwright test e2e/layout.spec.ts e2e/design-sync-layout.spec.ts
```

Expected: green. The light triplets are the same values as the old hex, so no light-mode screenshot may change. Compare the new `design-sync-landing-desktop-1440.png` against the PR 1 copy by eye; any visible difference is a token typo.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.js src/index.css index.html
git commit -m "feat: drive the panels palette from one CSS-variable token set with a dark variant"
git push -u origin feat/dark-mode-reinstatement
```

---

## Task 9: Replace hardcoded colors in components

**Files (modify):**
- `src/components/panels/LandingView.tsx`
- `src/components/panels/AboutView.tsx`
- `src/components/panels/ExplanationCard.tsx`
- `src/components/panels/OptionButton.tsx`
- `src/components/panels/ActionRow.tsx`
- `src/components/panels/PromptCard.tsx`
- `src/components/panels/ResultsView.tsx` (no change needed; listed so the grep in Step 3 is checked)
- `src/components/layout/AppFooter.tsx` (no change; `bg-ground/50` is token-based)
- `src/components/shared/Toast.tsx`
- `src/components/shared/NotFoundPage.tsx`
- `src/components/shared/ErrorBoundary.tsx`
- `src/App.tsx` (PageLoader; no change)

Exact substitutions. Apply with an editor, not blind sed, and read each file first.

| File | Old | New |
|---|---|---|
| `LandingView.tsx` | `text-[#3a3a42]` | `text-text-2` |
| `LandingView.tsx` | `bg-white` (tile) | `bg-surface` |
| `AboutView.tsx` | `text-[#3a3a42]` | `text-text-2` |
| `ExplanationCard.tsx` | `bg-white` | `bg-surface` |
| `ExplanationCard.tsx` | `text-[#3a3a42]` (both) | `text-text-2` |
| `OptionButton.tsx` | `'border-ink bg-ink text-ground'` | `'border-ink bg-ink text-on-ink'` |
| `OptionButton.tsx` | `'border-line bg-white text-ink hover:border-ink'` | `'border-line bg-surface text-ink hover:border-ink'` |
| `OptionButton.tsx` | `selected ? 'bg-white text-ink' : 'bg-[#f0f0f3] text-muted-2'` | `selected ? 'bg-on-ink text-ink' : 'bg-box text-muted-2'` |
| `ActionRow.tsx` | `bg-white` (Previous) | `bg-surface` |
| `ActionRow.tsx` | `bg-ink text-ground … hover:bg-ink/90` (Next) | `bg-ink text-on-ink … hover:bg-ink-hover` |
| `PromptCard.tsx` | `bg-white` (card) | `bg-surface` |
| `PromptCard.tsx` | `border-[#ececf0]` | `border-line-2` |
| `PromptCard.tsx` | `'border-ink bg-ink text-white'` | `'border-ink bg-ink text-on-ink'` |
| `PromptCard.tsx` | `'border-line bg-white text-ink hover:border-ink'` | `'border-line bg-surface text-ink hover:border-ink'` |
| `PromptCard.tsx` | `text-[#3a3a42]` | `text-text-2` |
| `Toast.tsx` | `'bg-ink text-ground border border-ink'` | `'bg-ink text-on-ink border border-ink'` |
| `Toast.tsx` | `bg-white` (error and info) | `bg-surface` |
| `NotFoundPage.tsx` | `bg-white shadow-sm` | `bg-surface shadow-sm` |
| `NotFoundPage.tsx` | `bg-ink text-ground border border-ink hover:bg-ink/90` | `bg-ink text-on-ink border border-ink hover:bg-ink-hover` |
| `ErrorBoundary.tsx` | `bg-white shadow-sm` | `bg-surface shadow-sm` |
| `ErrorBoundary.tsx` | `bg-white text-ink border-2 border-line` | `bg-surface text-ink border-2 border-line` |
| `ErrorBoundary.tsx` | `bg-ink text-ground border border-ink hover:bg-ink/90` | `bg-ink text-on-ink border border-ink hover:bg-ink-hover` |

Leave alone: `Panel.tsx` `text-white` (labels over images, same in both modes), `bg-panel`, all `vark-*`, `AppFooter` `bg-ground/50`, `Toast` `ring-vark-k/30`, `index.css` `::selection` `bg-ink/15`, focus ring `ring-ink ring-offset-ground`.

- [ ] **Step 1: Apply the table**

- [ ] **Step 2: Run the full suite in light mode**

```bash
npm run lint && npm run typecheck && npm test && npm run test:e2e
```

Expected: green, no visual change in light mode (verify the same screenshot comparison as Task 8 Step 4).

- [ ] **Step 3: Prove nothing hardcoded remains**

```bash
grep -rn -E "bg-white|text-white|#[0-9a-fA-F]{3,8}" src --include=*.tsx --include=*.ts --include=*.css | grep -v __tests__
```

Expected output, exactly these lines and nothing else:
- `src/components/panels/Panel.tsx` — two `text-white` lines.
- `tailwind.config.js` is not under `src`; nothing else. If any other line prints, fix it.

- [ ] **Step 4: Commit**

```bash
git add src
git commit -m "refactor: replace hardcoded surface and text colors with theme tokens"
git push
```

---

## Task 10: Theme provider, hook, and header toggle

**Files:**
- Create: `src/contexts/theme-context.ts`
- Create: `src/contexts/ThemeProvider.tsx`
- Create: `src/hooks/useTheme.ts`
- Create: `src/contexts/__tests__/themeLogic.test.ts`
- Create: `src/components/panels/ThemeToggle.tsx`
- Modify: `src/components/panels/PanelsHeader.tsx`
- Modify: `src/App.tsx`
- Modify: `src/constants/app.ts`

**Interfaces:**
- Produces: `ThemePreference = 'auto' | 'light' | 'dark'`; `ResolvedTheme = 'light' | 'dark'`; `resolveTheme(preference, systemPrefersDark): ResolvedTheme`; `readStoredPreference(raw: string | null): ThemePreference`; `nextPreference(current: ResolvedTheme): ThemePreference`; `useTheme(): { theme: ResolvedTheme; preference: ThemePreference; toggleTheme: () => void }`.
- Storage key `varkly-theme` (matches the design and the inline script). Stored values are only `light` or `dark`; absence means `auto`. This is the designer's "auto / light / dark" tweak expressed as storage state: the toggle always writes an explicit value, clearing storage returns to system. No UI for returning to auto is built (nothing in the design asks for one).

- [ ] **Step 1: Add the storage key**

In `src/constants/app.ts`:

```ts
export const STORAGE_KEYS = {
  quizState: 'quizState',
  theme: 'varkly-theme',
} as const;
```

- [ ] **Step 2: Write failing resolver tests**

Create `src/contexts/__tests__/themeLogic.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { nextPreference, readStoredPreference, resolveTheme } from '../theme-context';

describe('readStoredPreference', () => {
  it('accepts only light and dark, everything else is auto', () => {
    expect(readStoredPreference('dark')).toBe('dark');
    expect(readStoredPreference('light')).toBe('light');
    expect(readStoredPreference(null)).toBe('auto');
    expect(readStoredPreference('auto')).toBe('auto');
    expect(readStoredPreference('purple')).toBe('auto');
  });
});

describe('resolveTheme', () => {
  it('auto follows the system', () => {
    expect(resolveTheme('auto', true)).toBe('dark');
    expect(resolveTheme('auto', false)).toBe('light');
  });

  it('explicit preference wins over the system', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });
});

describe('nextPreference', () => {
  it('flips the resolved theme to an explicit opposite', () => {
    expect(nextPreference('light')).toBe('dark');
    expect(nextPreference('dark')).toBe('light');
  });
});
```

Run: `npx vitest run src/contexts/__tests__/themeLogic.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Create `theme-context.ts`**

```ts
import { createContext } from 'react';

export type ThemePreference = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export type ThemeContextType = {
  theme: ResolvedTheme;
  preference: ThemePreference;
  toggleTheme: () => void;
};

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#f3f3f5',
  dark: '#121216',
};

export function readStoredPreference(raw: string | null): ThemePreference {
  return raw === 'dark' || raw === 'light' ? raw : 'auto';
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'auto') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

/** The toggle always writes an explicit value; clearing storage returns to auto. */
export function nextPreference(current: ResolvedTheme): ThemePreference {
  return current === 'dark' ? 'light' : 'dark';
}

export const ThemeContext = createContext<ThemeContextType | null>(null);
```

- [ ] **Step 4: Create `ThemeProvider.tsx`**

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants/app';
import {
  nextPreference,
  readStoredPreference,
  resolveTheme,
  THEME_COLORS,
  ThemeContext,
  type ThemePreference,
} from './theme-context';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function readInitialPreference(): ThemePreference {
  try {
    return readStoredPreference(localStorage.getItem(STORAGE_KEYS.theme));
  } catch {
    return 'auto';
  }
}

function readSystemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preference, setPreference] = useState<ThemePreference>(readInitialPreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(readSystemPrefersDark);
  const theme = resolveTheme(preference, systemPrefersDark);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const onChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document
      .querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute('content', THEME_COLORS[theme]));
  }, [theme]);

  useEffect(() => {
    try {
      if (preference === 'auto') {
        localStorage.removeItem(STORAGE_KEYS.theme);
      } else {
        localStorage.setItem(STORAGE_KEYS.theme, preference);
      }
    } catch {
      // Storage can be unavailable (private mode, blocked); the theme still applies for this visit.
    }
  }, [preference]);

  const toggleTheme = useCallback(() => {
    setPreference(nextPreference(theme));
  }, [theme]);

  const value = useMemo(() => ({ theme, preference, toggleTheme }), [theme, preference, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
```

- [ ] **Step 5: Create `useTheme.ts`**

```ts
import { useContext } from 'react';
import { ThemeContext } from '../contexts/theme-context';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

- [ ] **Step 6: Create `ThemeToggle.tsx`**

Design reference (`VARK Panels.dc.html` line 30): 36×36, 10px radius, 1.5px `line` border, `surface` background, `ink` icon; hover `border-color: var(--ink)`; sun icon shown in dark mode, moon in light; `aria-label` and `title` are `Switch to light mode` / `Switch to dark mode`.

```tsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className="h-9 w-9 flex-shrink-0 rounded-[10px] border-[1.5px] border-line bg-surface text-ink cursor-pointer flex items-center justify-center hover:border-ink"
    >
      <Icon className="w-4 h-4" strokeWidth={2} aria-hidden />
    </button>
  );
};

export default ThemeToggle;
```

Keyboard note: `PanelsScreen`'s window key handler already yields Enter and Space to a focused `<button>` on non-question surfaces (`focusOwnsKey`). On question surfaces the shortcuts win over focused Next/Previous (K5), and they will win over a focused toggle too. That matches the existing rule for header controls and needs no change; it is called out so a reviewer does not flag it as a regression.

- [ ] **Step 7: Mount the toggle in `PanelsHeader.tsx`**

Import and add after the progress bar `</div>` inside the right-hand flex group:

```tsx
import ThemeToggle from './ThemeToggle';
```

```tsx
        <ThemeToggle />
```

The group is `flex … gap-2 sm:gap-5`; at 390px the label, 72px bar, and 36px toggle must fit beside the logo. Task 11's screenshots verify this.

- [ ] **Step 8: Wrap the app**

In `src/App.tsx`, import and wrap the outermost provider:

```tsx
import { ThemeProvider } from './contexts/ThemeProvider';
```

```tsx
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          …
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
```

- [ ] **Step 9: Run unit tests, lint, typecheck**

```bash
npx vitest run src/contexts/__tests__/themeLogic.test.ts && npm run lint && npm run typecheck && npm test
```

Expected: green. `eslint-plugin-react-refresh` may warn that `ThemeProvider.tsx` exports only a component; that is the same shape as `ToastContext.tsx` and is acceptable. If it errors, check how `ToastContext.tsx` avoids it and mirror that.

- [ ] **Step 10: Commit**

```bash
git add src/constants/app.ts src/contexts/theme-context.ts src/contexts/ThemeProvider.tsx src/hooks/useTheme.ts src/contexts/__tests__/themeLogic.test.ts src/components/panels/ThemeToggle.tsx src/components/panels/PanelsHeader.tsx src/App.tsx
git commit -m "feat: reinstate dark mode with a header toggle, system default, and remembered preference"
git push
```

---

## Task 11: Theme e2e and dark-mode layout verification

**Files:**
- Create: `e2e/theme.spec.ts`
- Modify: `e2e/design-sync-layout.spec.ts` (dark pass)

- [ ] **Step 1: Write the theme spec**

```ts
import { test, expect, type Page } from '@playwright/test';

async function htmlTheme(page: Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

async function bodyBackground(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

test('T1: with no stored preference the theme follows the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await htmlTheme(page)).toBe('dark');
  expect(await bodyBackground(page)).toBe('rgb(18, 18, 22)');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => htmlTheme(page)).toBe('light');
  expect(await bodyBackground(page)).toBe('rgb(243, 243, 245)');
});

test('T2: the header toggle flips the theme and the choice survives a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await htmlTheme(page)).toBe('light');

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  expect(await htmlTheme(page)).toBe('dark');
  expect(await page.evaluate(() => localStorage.getItem('varkly-theme'))).toBe('dark');

  await page.reload();
  expect(await htmlTheme(page)).toBe('dark');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
});

test('T3: a stored preference is applied before first paint (no light flash)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('varkly-theme', 'dark'));

  await page.addInitScript(() => {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        (window as unknown as { __firstTheme: string | null }).__firstTheme =
          document.documentElement.getAttribute('data-theme');
      },
      { once: true }
    );
  });
  await page.goto('/');
  const firstTheme = await page.evaluate(
    () => (window as unknown as { __firstTheme: string | null }).__firstTheme
  );
  expect(firstTheme).toBe('dark');
});

test('T4: an explicit preference wins over a later system change', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await htmlTheme(page)).toBe('dark');
});
```

Run: `npx playwright test e2e/theme.spec.ts`
Expected: PASS. If T3 fails, the inline script in `index.html` is missing or placed after `#root`.

- [ ] **Step 2: Add a dark pass to the layout guard**

In `e2e/design-sync-layout.spec.ts`, wrap the existing `for (const viewport of VIEWPORTS)` loop in a second loop over `['light', 'dark'] as const`, set `await page.emulateMedia({ colorScheme })` right after `setViewportSize`, include the scheme in the test title (`… on ${viewport.slug} (${colorScheme})`), and suffix every `snapshot` name with `-${colorScheme}`. No other change. The overflow and action-row invariants now run in both modes.

Run: `npx playwright test e2e/design-sync-layout.spec.ts`
Expected: PASS, 6 tests, 36 screenshots.

- [ ] **Step 3: Look at every dark screenshot and report**

Same checklist as Task 6 Step 2 plus, in dark mode only:

- Tile, card, prompt card, and option borders are visible against `surface` (`#2d2d35` on `#1b1b20`); if a border disappears, the token in that component is wrong.
- Selected option: `ink` (`#f1f1f4`) background with `on-ink` (`#121216`) text and the mark box `on-ink` on `ink`.
- The theme toggle icon is a sun in dark mode.
- Panel rail labels remain white over the images in both modes.
- Score bar tracks are visible (`#2d2d35`).
- The 404 page (`/nope`) and a toast (click `Copy link` on results) render on `surface`, not white.

Write findings into the PR description under `Layout review (Task 11)`, one bullet per screenshot, and attach the 1100 results-balanced dark and 390 landing dark screenshots.

- [ ] **Step 4: Full suite and commit**

```bash
npm run lint && npm run typecheck && npm test && npm run test:e2e
```

Expected: green. Record counts.

```bash
git add e2e/theme.spec.ts e2e/design-sync-layout.spec.ts
git commit -m "test: cover theme default, toggle, persistence, first-paint, and dark-mode layout"
git push
```

- [ ] **Step 5: Open PR 2 (draft, base = PR 1's branch, no merge)**

```bash
gh pr create --draft --base feat/design-sync-content --head feat/dark-mode-reinstatement \
  --title "feat: reinstate dark mode with a single token set driving both modes" \
  --body-file /dev/stdin <<'EOF'
Change 1 of the 2026-09-09 designer sync, stacked on the content PR. Reinstates dark mode, which PR A of the panels redesign removed as a design decision ("intentionally light-only", `DESIGN.md`). The designer has now added it back; this PR does not restore the old `dark:`-variant implementation but drives the whole palette from one CSS-variable token set (`:root` light, `:root[data-theme="dark"]` dark) so no component carries mode-specific classes.

- Header toggle (36px, sun/moon), defaults to `prefers-color-scheme`, explicit choice stored in `localStorage` under `varkly-theme`, applied before first paint by an inline script.
- Tokens added from the design: `surface`, `on-ink`, `ink-hover`, `line-2`, `text-2`, `box`. `track` carries the design's `--bar`.
- Every `bg-white`, `text-white` on ink, and hex literal in components replaced with a token; `grep` proof in the verification section.
- `e2e/theme.spec.ts` and a dark pass of `e2e/design-sync-layout.spec.ts`; screenshots reviewed one by one below.

Docs that now contradict the code and are deferred until review: `DESIGN.md` (lines 111, 230, 243), `planning.md` (line 39, §9 heading), `AGENTS.md` deleted-files line and file map, `README.md` styling row.

## Layout review (Task 11)

(one bullet per screenshot)

## Verification

(lint / typecheck / vitest count / node test count / playwright count / grep output)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01NBwZ7jSmPyC4GBwSk3bD5v
EOF
```

---

## Task 12: Session log, review routing, and the deferred docs list

**Files:**
- Modify: `tasks.md` (Milestone 9 checkboxes, Session Log)

- [ ] **Step 1: Mark Milestone 9 items and append the session log**

On each branch, tick the Milestone 9 items that branch completed with today's date, and append under `## Session Log`:

```markdown
### 2026-09-09 — Designer sync implementation (PR 1 content, PR 2 dark mode)

- Branches `feat/design-sync-content` and `feat/dark-mode-reinstatement` (stacked) from `main` at `8c24b52`.
- Work completed: (list the commits by subject line)
- Verification: (lint / typecheck / vitest count / node test count / playwright count per branch; screenshot review counts: 18 light, 18 dark)
- Not merged, not deployed. Narrative docs untouched pending review.
- Follow-ups: hover states for new elements (open design question); optional return-to-auto theme control; §22 closing quote not reinstated; `About VARK` and tile copy not yet in `COPY.md`.
```

Commit on each branch:

```bash
git add tasks.md
git commit -m "docs: record designer-sync session in tasks.md"
git push
```

- [ ] **Step 2: Route through the review gate**

Per `docs/review-chain.md` and `AGENTS.md` "Review Gate": AGY and PPLX are mutually acceptable; dispatch whichever is available, on PM instruction, for each PR head. Capture paths and comment formats are in `docs/pplx-review-procedure.md` §7–8 and `docs/agy-review-procedure.md`. Findings are triaged by the PM against source; they are not a merge verdict. Nothing merges without explicit owner authorization. Report each PR's head SHA as "as pushed" with the time.

- [ ] **Step 3: Deferred docs task (do not execute until the owner approves both PRs)**

When instructed, in one docs-only commit per PR:

- `DESIGN.md`: line 111 remove "The artifact is intentionally light-only."; line 230 replace "The document is light-only," with "The document ships light and dark from one token set,"; line 243 delete the "Don't add dark mode" bullet and add the dark token column to the palette.
- `planning.md`: line 39 replace with "Theme: `ThemeProvider` resolves `auto | light | dark` from `localStorage` (`varkly-theme`) and `prefers-color-scheme`; one CSS-variable palette drives both modes."; §9 title drop "Light-Only"; palette table gains a dark column; file tree gains `AboutView`, `ExplanationCard`, `ThemeToggle`, `ThemeProvider`, `theme-context.ts`, `useTheme.ts`, `varkStyles.ts`, `varkExplanations.ts`, `explanation.ts`; routes gain `/about`.
- `AGENTS.md`: remove `ThemeContext` and `ThemeToggle` from the deleted-files line (and add `ThemeToggle`, `ThemeProvider` to the file map); Styling rule: replace the removed `dark:` rule with "Use palette tokens only; never `bg-white`, `text-white` on ink, or hex literals in components. Dark mode is driven by the token set, not by `dark:` variants."
- `COPY.md`: Landing view gains the four tile names and blurbs and the `About VARK` tertiary label; new "About view" block with the eyebrow, headline, intro, three paragraphs, helper, keys hint; Results view gains the card titles and the description-plus-tips rule; Shared header gains the toggle labels.
- `README.md`: styling row "Tailwind CSS v3 (light-only tokens)" → "Tailwind CSS v3 (one token set, light and dark)".
- `tasks.md` Milestone 7 → Product: tick the About VARK and condensed-explanation items with the merge date.

---

## Open design questions (owner decides; not resolved in this plan)

1. **Hover states for new elements.** The plan copies only the design file's literal hover (toggle border → ink). Tiles, the explanation card, and the About paragraphs have no hover. Whether the rest is a coder or a designer call is undecided.
2. **Description placement on results.** Plan keeps the shipped `<h1>` blurbs and puts the COPY.md description in the card. The design file swaps the blurb for the description. Either is a one-line change.
3. **Space on landing.** Plan keeps it inert. The design's generic skip handler would open About on Space.
4. **Return to "auto".** The toggle writes an explicit theme; there is no control to return to system. The design's `theme` tweak is a canvas prop, not a UI control.
5. **§22 closing quote.** Not in the designer's card; not reinstated.
6. **`DESIGN.md` "Don't add dark mode".** PR 2 knowingly contradicts it until the docs task runs. Confirm the designer's sync supersedes the DESIGN.md guardrail before PR 2 is reviewed for merge.

## Self-review

- Spec coverage: change 1 → Tasks 8–11; change 2 → Task 1; change 3 → Tasks 2–3; change 4 → Tasks 4–5; testing-phase layout review → Tasks 6 and 11; hover states flagged, not decided → constraints and open questions; "confirm what was removed" → section before Task 0; §16–22 reconciliation → Task 4 preamble; no merge / deploy / docs → constraints and Task 12.
- Types: `ResultsExplanation`, `VarkStyleTile` (Task 1/4) used in Tasks 5 and 1; `PanelsView`/`PanelsSurface`/`PageAction` (Task 2) used in Task 3; `ThemePreference`/`ResolvedTheme` (Task 10) used within Task 10 only; `ROUTES.about` used in Tasks 2 and 3; `STORAGE_KEYS.theme` used in Task 10.
- Placeholders: none; every code step has its content.
