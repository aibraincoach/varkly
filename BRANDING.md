# Varkly — Brand Style Guide (VARK Panels)

Extracted from the shipped panels codebase for presentations, marketing, and design handoff. **Light-only** — no dark mode, no violet gradients, no glass effects.

---

## 1. Typography

| Role | Family | Usage |
|---|---|---|
| UI copy | **Sora** (`font-sans`) | Headlines, body, buttons, prompts |
| Measurement labels | **JetBrains Mono** (`font-mono`) | Eyebrows, progress keys, score readouts, keyboard hints |

Loaded from Google Fonts at weights 400–700 (Sora) and 400–500 (JetBrains Mono).

### Type scale (panels)

| Element | Size | Weight | Notes |
|---|---|---|---|
| Display headline | `clamp(28px, 2.4vw, 38px)` | 600 | Landing "See. Hear. Read. Do."; results/prompts titles |
| Section headline | `clamp(18px, 1.5vw, 23px)` | 600 | Question scenarios |
| Body | `16px` / `15px` | 400 | Aside copy, blurbs |
| Compact body | `14px` / `13px` | 400–600 | Options, prompt cards, buttons |
| Measurement | `11px` | 400 | Eyebrows; `tracking-[0.08em]` uppercase |
| Score readout | `13px` mono | 400 | `value · pct%` |

---

## 2. Neutral Palette

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#1f1f24` | Primary text, filled buttons, focus ring, progress fill |
| `ground` | `#f3f3f5` | Page background, theme-color |
| `line` | `#dedee3` | Borders, dividers, progress track shell |
| `panel` | `#1a1a20` | Collapsed editorial panel background |
| `track` | `#e2e2e7` | Score bar track |
| `muted-1` | `#5b5b66` | Secondary body text |
| `muted-2` | `#6b6b76` | Progress label, ghost button text |
| `muted-3` | `#8a8a94` | Eyebrows, helper hints |
| `muted-4` | `#9a9aa3` | Keyboard shortcut line |
| `white` / surface | `#ffffff` | Cards, secondary buttons, prompt blocks |

---

## 3. VARK Accent Colors

Used for score dots, bars, and semantic emphasis (error toast ring).

| Style | Token | Hex |
|---|---|---|
| Visual (V) | `vark-v` | `#af52de` |
| Auditory (A) | `vark-a` | `#0071e3` |
| Read/Write (R) | `vark-r` | `#34c759` |
| Kinesthetic (K) | `vark-k` | `#ff9f0a` |

---

## 4. Logo and Header

- **Icon:** `public/varkly-icon.svg`, rendered at **26×26px** with `grayscale contrast-[1.2]` in the header.
- **Wordmark:** "Varkly." — bold, `text-xl`, ink color; period matches ink.
- **Header height:** 72px; progress bar 3px tall, 120px wide desktop / 72px mobile.

---

## 5. Editorial Image Rail

- **14 WebP panels** in `public/panels/` (01–14), one per quiz scenario plus results.
- **Desktop (≥1100px):** Horizontal flex rail; active panel expands, collapsed panels show vertical labels.
- **Mobile (<1100px):** Stacked 56px strips; active panel `min-height: 260px`.
- **Panel radius:** 20px.
- **Saturation:** Answered questions full color; unanswered desaturated; shared links show results panel only in color.

---

## 6. Controls and Components

| Element | Radius | Style |
|---|---|---|
| Primary button | 12px (`rounded-xl`) | `bg-ink text-ground`, hover `bg-ink/90` |
| Secondary / nav button | 12px | White ground, `border-line`, hover `border-ink` |
| Ghost button (Skip/Retake) | 12px | Transparent, `text-muted-2` |
| Prompt card | 12px | White, `border-line` |
| Option button | 12px | White, selected state ink border/fill |
| Toast | 12px | Success: ink fill; error: white + `vark-k` border/ring |

No drop shadows on primary surfaces except subtle toast/404 card `shadow-sm`.

---

## 7. Layout

| Context | Behavior |
|---|---|
| Page padding | `clamp(16px, 3vw, 48px)` horizontal |
| Two-column breakpoint | `1100px` (`screens.panels`) |
| Aside width | `minmax(360px, 460px)` |
| Column gap | `clamp(24px, 3vw, 56px)` |
| Footer | `© 2026 AI Brain Coach, All Rights Reserved` centered, `border-line` top |

---

## 8. Motion and Accessibility

| Interaction | Treatment |
|---|---|
| Panel expand/collapse | `vkFade` keyframes, ~500ms ease |
| Progress bar width | 500ms cubic-bezier |
| Score bars | 600ms width transition |
| 404 / error enter | Framer Motion opacity + translateY |
| Focus | Global `*:focus-visible` — `ring-2 ring-ink ring-offset-ground` |
| Reduced motion | `prefers-reduced-motion: reduce` disables animations in `index.css` |
| Toasts | Success/info: `role="status"` polite; error: `role="alert"` assertive |
| Skip link | Visible on focus, `focus:text-ground` |

Button hover uses subtle opacity/scale only — no decorative gradients.

---

## 9. Product Voice

- Direct, conversational, slightly playful — not academic.
- Scenario questions retain humor; results copy is practical ("Ask your AI for…").
- RayRayRay quotes live in preserved deferred copy (`COPY.md` §16–22), not in the current panels UI.
- No claims of scientific validity; VARK is a learning-preference framework, not a diagnosis.

---

## 10. Quick Reference — Hex Copy-Paste

**Neutrals:** `#1f1f24` ink · `#f3f3f5` ground · `#dedee3` line · `#1a1a20` panel · `#e2e2e7` track

**Muted:** `#5b5b66` · `#6b6b76` · `#8a8a94` · `#9a9aa3`

**VARK:** `#af52de` V · `#0071e3` A · `#34c759` R · `#ff9f0a` K
