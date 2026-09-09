---
name: VARK Panels
description: A light-slate editorial assessment rail that turns VARK scenarios into copy-ready AI prompts.
colors:
  ink: "#1f1f24"
  ground: "#f3f3f5"
  line: "#dedee3"
  panel: "#1a1a20"
  track: "#e2e2e7"
  muted-1: "#5b5b66"
  muted-2: "#6b6b76"
  muted-3: "#8a8a94"
  muted-4: "#9a9aa3"
  surface: "#ffffff"
  visual: "#af52de"
  auditory: "#0071e3"
  read-write: "#34c759"
  kinesthetic: "#ff9f0a"
typography:
  display:
    fontFamily: "Sora, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "clamp(28px, 2.4vw, 38px)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Sora, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "clamp(18px, 1.5vw, 23px)"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Sora, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  body-compact:
    fontFamily: "Sora, -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  measurement:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "0.08em"
rounded:
  progress: "2px"
  mark: "6px"
  compact-control: "8px"
  control: "12px"
  panel: "20px"
  full: "9999px"
spacing:
  xs: "8px"
  rail-gap: "10px"
  sm: "12px"
  md: "16px"
  control-x: "20px"
  lg: "28px"
  page-max: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    size: "44px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-2}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  option:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    typography: "{typography.body-compact}"
    rounded: "{rounded.control}"
    padding: "12px 14px"
  prompt-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  editorial-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
---

# Design System: VARK Panels

## Overview

**Creative North Star: "The Navigable Editorial Rail"**

VARK Panels is a restrained assessment workspace set on a cool light-slate field. Dark ink controls and white utility surfaces keep the reading and decision layer quiet, while a fourteen-image rail supplies the color, pace, and sense of progression. The artifact is intentionally light-only.

The visual system serves a stateless thirteen-scenario path from orientation through results and prompt copying. Its distinctive behavior is spatial: one stable instructional column works beside a rail whose images move between overview, active detail, and completed-state saturation.

The fourteen shipping WebP rasters are derived from the owner-approved design PNG sequence, preserved in source order by `src/data/panels.ts`, and optimized to 720×1201 WebP files with the recorded build command `cwebp -q 78 -resize 720 0`. They are repository-owned build assets; no external stock provider or generative source is asserted by the shipped code.

**Key Characteristics:**
- Light slate canvas with near-black ink and white working surfaces.
- Saturated editorial imagery is concentrated in the navigable rail.
- Sora carries reading and action; JetBrains Mono carries measurements and progress.
- One active panel expands while the surrounding sequence remains visible.
- States remain explicit through fill, border, saturation, labels, and copy feedback.

## Colors

The palette is primarily achromatic and cool, reserving vivid color for VARK scoring and editorial photography.

### Primary
- **Graphite Ink:** The default text, filled-action, progress, selected-option, and focus color.

### Secondary
- **Visual Violet:** Identifies Visual score dots and bars.
- **Auditory Blue:** Identifies Auditory score dots and bars.
- **Read/Write Green:** Identifies Read/Write score dots and bars.
- **Kinesthetic Orange:** Identifies Kinesthetic score dots and bars.

### Neutral
- **Light Slate Ground:** The page, scrollbar track, and focus-ring offset surface.
- **Paper Surface:** The resting surface for answer controls and prompt cards.
- **Soft Divider:** Borders, separators, and inactive progress tracks.
- **Deep Panel:** The fallback beneath editorial imagery.
- **Muted Ink Scale:** Four steps reduce emphasis for explanatory copy, keyboard hints, panel numbering, and low-priority labels.
- **Score Track:** The quiet base under VARK distribution bars.

### Named Rules
**The Color Lives in Evidence Rule.** Keep the assessment chrome achromatic; use saturated hues for VARK data and shipped editorial images, not decorative interface accents.

**The State Is Never Color Alone Rule.** Pair color changes with fill, border, checkmark, text, saturation, or explicit labels.

## Typography

**Display Font:** Sora (with Apple system and generic sans-serif fallbacks)
**Body Font:** Sora (with Apple system and generic sans-serif fallbacks)
**Label/Mono Font:** JetBrains Mono (with platform monospace fallbacks)

**Character:** Sora is compact, geometric, and clear enough to carry both editorial headlines and dense answer controls. JetBrains Mono introduces a measured instrument-panel voice for counts, percentages, progress, and keyboard guidance.

### Hierarchy
- **Display:** Semibold, fluid 28–38px, tight 1.1 leading; two-line landing statements, results headlines, prompt headlines, and expanded-panel titles.
- **Headline:** Semibold, fluid 18–23px, 1.35 leading; scenario questions and primary aside statements.
- **Body:** Regular 16px, 1.55 leading; orientation copy, generally constrained to about 40–46 characters per line.
- **Compact Body:** Regular or medium 13–15px with 1.45–1.55 leading; options, supporting descriptions, action labels, score names, and prompt text.
- **Measurement:** Regular 11–13px mono; progress, indices, scores, percentages, and keyboard hints.

### Named Rules
**The Two-Family Rule.** Sora owns reading and actions; JetBrains Mono is reserved for quantities, sequence, progress, and keyboard notation.

**The Tight Heading Rule.** Display and headline type use semibold weight with negative tracking; body copy returns to regular weight and comfortable leading.

**The Contextual Eyebrow Rule.** Keep the small uppercase JetBrains Mono eyebrow above each panels-view heading. This is a user-pinned part of the VARK Panels direction; use it for route, question, and score context within this screen rather than as a generic site-wide decoration.

## Layout

The page uses fluid horizontal padding from 16px to 48px and a fixed 72px header. At 1100px and above, the main area is a two-column grid: a 360–460px aside and a flexible image rail separated by a fluid 24–56px gap. The desktop rail occupies the remaining viewport height, bounded between 560px and 860px.

The aside keeps its question or result content, helper text, action row, and keyboard hint in a stable order. At desktop widths, the answer/result body receives a fixed four-row rhythm so actions do not jump as content changes.

The rail contains fourteen rounded image panels. On the landing view they share available width equally. During the flow, the active panel expands while inactive panels collapse toward 64px; inter-panel gaps scale from 4px to 10px. Vertical labels preserve the whole sequence in view.

Below 1100px, topology changes rather than merely shrinking: the aside stacks above a vertical rail, inactive panels become 56px horizontal strips, labels rotate back to horizontal, and the active image grows to at least 260px.

**The Stable Action Rule.** Changing questions must not move the primary navigation controls at desktop widths.

**The Topology Switch Rule.** Desktop is a side-by-side editorial rail; mobile is an aside followed by stacked strips. Do not compress the desktop rail into unusable slivers.

## Elevation & Depth

The system is flat by default and defines no shadow vocabulary. Hierarchy comes from tonal surfaces, 1–1.5px borders, image overlays, clipping, expansion, and saturation. White cards sit on the light-slate ground without drop shadows.

**The Flat Workspace Rule.** Do not add ambient card shadows; use borders, surface contrast, and motion to separate interactive layers.

## Shapes

Controls use gently rounded 12px corners; compact copy controls use 8px; answer marks use 6px. Editorial panels are more generous at 20px, while progress tracks and score bars use small or fully pill-shaped ends. Borders are cool gray and typically 1.5px where controls must read as actionable.

**The Radius by Scale Rule.** Small internal marks are tighter, controls are 12px, and image panels are 20px. Larger radius communicates larger physical scale, not increased decoration.

## Components

### Buttons
- **Primary:** A 44px-high graphite fill with light-slate text, semibold compact Sora, 20px horizontal padding, and a 12px radius. Hover reduces opacity slightly.
- **Previous:** A 44px square white control with a 1.5px divider border; hover darkens the border and disabled state drops to 40% opacity.
- **Ghost:** A transparent 44px-high text action using muted ink; hover returns the label to full ink.
- **Copy:** A compact 30px-high bordered control. Successful copy inverts to graphite with white text and announces changing text through a polite live region.
- **Focus:** All controls receive a 2px graphite ring with a 2px light-slate offset.

### Option Controls
- **Resting:** White, 1.5px divider border, 12px corners, and 12px by 14px padding; hover darkens the border.
- **Selected:** Graphite fill and border with light-slate text. The 22px number tile becomes a white checkmark tile.
- **State:** `aria-pressed` exposes selection independently of appearance; number keys 1–4 mirror the visible option markers.

### Cards / Containers
- **Prompt cards:** White 12px-radius containers with a 1.5px divider border and clipped overflow. A subtle internal divider separates title/copy controls from scrollable prompt text.
- **Score rows:** Flat two-column rows with a colored semantic dot, mono value/percentage, and a pill-ended distribution track.
- **Shadow Strategy:** None; refer to Elevation & Depth.

### Navigation
- **Header:** A 72px row pairs a compact Varkly home link with mono progress text and a 3px animated progress track.
- **Action row:** Previous, primary next-state action, and optional skip/retake remain left-aligned with 8px gaps.
- **Keyboard:** 1–4 select answers, Enter or Right Arrow advances, Left Arrow returns, and Space skips. On question views, Enter/Space activates the focused enabled rail destination once per press. Other recognized quiz shortcuts retain their existing precedence. Outside question views, existing native button/link activation remains supported. Shortcuts are suppressed while editing editable fields. Owned keys suppress repeat actions until `keyup`, `blur`, or unmount.

### Editorial Panel Rail

The rail is the signature component. Every panel is an accessible button over a cover-cropped 720×1201 image (`decoding="async"`; first and active panels load eagerly, others lazily), a dark lower gradient, and sequence labeling. Inactive desktop images sit at 1.06 scale and transition to 1.0 when active. Completion is shown through saturation: unanswered panels are grayscale, answered panels are fully saturated, and unavailable results are partially saturated. Shared-result links desaturate question panels and disable review.

Flex expansion and image filters transition over 550ms with standard `cubic-bezier(.4,0,.2,1)` easing; active titles crossfade in after expansion. Progress width uses 500ms and score bars use 600ms with the same easing. Reduced-motion preferences collapse animation and transition durations to 0.01ms.

### Accessibility

The document is light-only, uses visible global focus rings, semantic buttons, progressbar values, `aria-current` on the active panel, `aria-pressed` on options, useful control labels, decorative empty-alt images, and polite announcements for copy-state text. Panel navigation remains operable on both desktop and mobile, and reduced-motion preferences are honored globally.

## Do's and Don'ts

### Do:
- **Do** preserve the achromatic workspace and let editorial images and score data carry saturation.
- **Do** keep the full fourteen-step rail legible while one panel expands.
- **Do** use Sora for prose/actions and JetBrains Mono for measurable state.
- **Do** expose selected, disabled, progress, current-step, and copied states semantically.
- **Do** retain the 1100px topology switch and reduced-motion behavior.
- **Do** preserve raster order, 720×1201 dimensions, and owner-approved image subjects when replacing encoded assets; record any new source and transformation provenance.

### Don't:
- **Don't** add dark mode, ambient shadows, or decorative interface gradients to this light-only flat workspace.
- **Don't** use VARK colors as generic brand accents or rely on hue alone to communicate state.
- **Don't** hide the rail sequence when a panel expands or force vertical desktop labels onto mobile.
- **Don't** introduce additional display or monospace families.
- **Don't** remove, restyle, or relocate the user-pinned contextual eyebrows in the VARK Panels screen; outside that screen, do not apply them as generic decoration.
