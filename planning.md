# Planning — Varkly

**Last updated:** 2026-09-07

---

## CI execution decision — 2026-09-08

Actions is disabled. [CI_POLICY.md](CI_POLICY.md) records the owner ruling,
repository evidence, retained checks and outstanding provider blockers. This
entry does not mark unverified replacement checks as passed or completed.

## 1. Vision

Varkly is the fastest, most frictionless way to discover your VARK learning style and immediately apply it to every AI tool you use. The experience is instant, playful, and genuinely useful — not another academic form. Every person who completes the quiz leaves with two copy-ready AI prompts that make every AI tool they use smarter about how they learn.

**Varkly is stateless with respect to application user data.** There are no accounts, application database, or application backend. Quiz state, scoring, prompt generation, and results encoding run in the browser. The intentional Google Analytics and Cloudflare Web Analytics scripts report traffic to the owner's accounts but do not restore the removed Varkly user-data persistence layer.

---

## 2. Architecture Overview

```
Browser (React SPA)
    │
    ├── Quiz state           → sessionStorage (ephemeral, cleared on tab close)
    ├── Theme preference     → localStorage
    ├── Score calculation    → in-memory (QuizContext.calculateScores)
    ├── AI prompt generation → in-memory (src/utils/aiPrompts.ts)
    ├── Results sharing      → URL encoding (btoa/atob, no server involved)
    ├── Google Analytics     → owner account G-QCPTM267KD
    └── Cloudflare Analytics → owner account beacon configured in index.html
```

The application is a client-side SPA with no Varkly API, server, or database. It is deployed as static files on Vercel. The two analytics scripts in `index.html` make intentional third-party network requests; this does not make quiz answers or results server-persisted by the application.

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
| `recharts` | `^2.12.7` | Results visualization |

### Development dependencies

| Package | Version |
|---|---|
| `@eslint/js` | `^9.9.1` |
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

### External platform services

- **Vercel** hosts the static Vite SPA.
- **Google Analytics** measurement ID `G-QCPTM267KD` is loaded intentionally from `index.html` and reports to the owner's Google account.
- **Cloudflare Web Analytics** is loaded intentionally by the beacon in `index.html` and reports to the owner's Cloudflare account.

Neither analytics service is part of the application package dependency graph or a replacement for the removed Supabase persistence layer.

---

## 4. Current File Structure

```text
.
├── AGENTS.md                       Canonical agent rules
├── CLAUDE.md                       Pointer to AGENTS.md for Claude Code
├── cursor.md                       Pointer to AGENTS.md for Cursor
├── PRD.md                          Product requirements
├── planning.md                     Architecture and technical reality
├── tasks.md                        Living implementation roadmap and session log
├── index.html                      SPA shell, metadata, and intentional analytics
├── package.json                    Scripts and package declarations
├── package-lock.json               npm lockfile
├── vercel.json                     Vercel SPA rewrite
├── vite.config.ts                  Vite configuration
├── eslint.config.js                ESLint configuration
├── tailwind.config.js              Tailwind theme and content paths
├── postcss.config.js               PostCSS configuration
├── tsconfig*.json                  TypeScript configurations
├── public/
│   ├── manifest.json               PWA manifest
│   ├── varkly-icon.svg             Primary app icon
│   └── brain-icon.svg              Supporting brand asset
└── src/
    ├── App.tsx                     Providers, lazy routes, and app shell
    ├── main.tsx                    Browser entry point
    ├── index.css                   Global Tailwind layers and styles
    ├── components/
    │   ├── landing/                Landing page
    │   ├── layout/                 Shared navigation, footer, and layout
    │   ├── quiz/                   Quiz intro, questions, progress, orchestration
    │   ├── results/                Results, chart, explanations, and AI prompts
    │   └── shared/                 Error boundary, 404, theme toggle, and toast
    ├── constants/app.ts            Branding, routes, and storage keys
    ├── contexts/                   Quiz, theme, and toast state providers
    ├── data/questions.ts           Thirteen VARK questions
    ├── hooks/usePageMeta.ts        Route-level title and description updates
    ├── types/index.ts              Shared application types
    └── utils/
        ├── aiPrompts.ts            Deterministic prompt generation
        └── __tests__/              Vitest coverage for prompt generation
```

`BRANDING.md`, `COPY.md`, and `README.md` are supporting documentation but are outside this session's synchronization scope.

---

## 5. Shareable Results URL Encoding

Results are encoded entirely client-side. No server lookup is required to view a shared result.

```
scores string: "V-A-R-K"  (e.g. "9-2-1-1")
base64 encode: btoa("9-2-1-1") = "OS0yLTEtMQ=="
strip padding: "OS0yLTEtMQ"
final URL:     https://varkly.app/r/OS0yLTEtMQ
```

On load, `ResultsPage` decodes `atob(hash)`, splits on `-`, and validates each value is a number between 0 and 13. Invalid hashes redirect to `/`.

**Implication:** The results URL is fully self-contained. Anyone with the link can view the results and generate the same AI prompts without any server request. The URL encodes scores only — not the full answer breakdown.

---

## 6. AI Prompts — Generation Design

### Approach
All prompts are generated entirely client-side from the `VarkScores` object. No API calls. No templates stored server-side. The generation function lives in `src/utils/aiPrompts.ts` and is pure — given the same scores, it always produces the same output.

### Dominant Style Determination
```typescript
const dominantScore = Math.max(V, A, R, K);
const dominantStyles = (['V', 'A', 'R', 'K'] as const).filter(k => scores[k] === dominantScore);
```

### System Prompt Template Structure
```
"I am a [style description] learner (VARK: V=[V], A=[A], R=[R], K=[K]).

[Style-specific communication instructions — 2–3 sentences]

[Style-specific structure instructions — 1–2 sentences]

[Check-in instruction — 1 sentence]"
```

### Conversation Prompt Template Structure
```
"I'm a [dominant style] learner — [one-sentence style preference statement]. [One-sentence reorientation request]."
```

### Style Instruction Bank (per dimension)

**Visual (V):**
- Structure responses with headers, sub-headers, and bullet points over prose
- Use diagrams, tables, flowcharts, and spatial metaphors wherever useful
- Avoid dense unbroken paragraphs
- Check-in: offer a diagram, visual analogy, or restructured layout

**Auditory (A):**
- Use conversational language, rhetorical questions, and verbal walkthroughs
- Write as you'd speak — avoid dry bullet lists
- Check-in: re-explain using a different verbal framing or analogy

**Read/Write (R):**
- Use precise written definitions, numbered lists, and labeled terminology
- Provide structured summaries with headings and sub-points
- Check-in: offer a written outline or definitions-first restatement

**Kinesthetic (K):**
- Lead with a concrete real-world example or scenario before any theory
- Frame explanations around doing: "here's how you'd apply this"
- Check-in: offer a different example or a step-by-step practical exercise

### Multimodal Blending
- Two dominant styles: merge instruction sets from both dimensions; check-in references both
- Three or more: describe user as "highly multimodal"; instruct AI to vary format freely

### Generation Constraints
- System prompt: 100–150 words maximum
- Conversation prompt: 25–40 words maximum
- Both prompts must be copy-ready: no placeholders, no ellipsis, no user-facing formatting instructions
- Both prompts must work pasted cold into a new AI session with no surrounding context

### Component Placement
`AIPromptsCard` is inserted in `ResultsPage` between `ResultsExplanation` and the "Retake Quiz" card. It renders on both fresh completions (`/results`) and shared result views (`/r/:hash`).

---

## 7. Deployment Target — Vercel

The repository is configured for a static Vite deployment on Vercel. The custom-domain example used by the project is `https://varkly.app`; the Vercel project metadata is not checked into the repository.

`vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

The catch-all rewrite ensures that client-side routes `/`, `/quiz`, `/results`, `/r/:hash`, and the in-app 404 route are all served through `index.html`.

### Environment Variables
No application environment variables are required. Google Analytics and Cloudflare Web Analytics use identifiers embedded intentionally in `index.html`.

---

## 8. Known Risks and Open Questions

| Risk | Severity | Notes |
|---|---|---|
| `btoa`/`atob` not available in very old browsers | **Low** | Target modern browsers only; add polyfill if needed |
| Shareable URL encodes scores only, not full answer breakdown | **Low** | Accepted tradeoff — scores are sufficient to generate prompts and render results |
| Analytics coverage is not documented at the event level | **Medium** | Google Analytics and Cloudflare Web Analytics are installed intentionally, but the repository does not prove that prompt-copy and quiz-completion success metrics have dedicated events |
| Partial unit-test coverage | **Low** | Vitest covers `generateAIPrompts`; `calculateScores` and React components do not yet have the planned React Testing Library coverage |
| No E2E coverage | **Low** | The complete quiz → results → copy-prompt flow is not covered by Playwright |
