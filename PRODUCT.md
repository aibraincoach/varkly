# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**The AI Power User** uses multiple AI tools daily (ChatGPT, Claude, Gemini, Perplexity). They know prompting matters but lack a systematic way to configure tools for how they think.

**The AI Beginner** has started using AI tools but finds responses hit-or-miss. They do not know why some explanations click and others do not.

**The Coaching Client** is onboarding with a coach or educator who sent them to Varkly as part of an intake process. They come with a specific purpose and will likely read full results and use both prompts.

**The Curious Self-Improver** is interested in learning science and personal development. They may take the quiz to understand themselves better and use the prompts as a takeaway regardless of current AI usage.

## Product Purpose

Varkly is a stateless 13-question VARK assessment that produces scores, a shareable result URL, and two deterministic AI prompts.

The quiz is the mechanism; the prompts are the product. Varkly reduces the cognitive load of humans interacting with AI by turning a person's VARK score into two immediately usable prompts — a System Prompt for pre-configuring any AI tool and a Conversation Prompt for mid-session reorientation.

Success is measured primarily on prompt adoption: System Prompt copy rate, Conversation Prompt copy rate, quiz completion rate, and shareable URL engagement.

## Positioning

Varkly turns a completed VARK profile into copy-ready AI prompts generated deterministically from the user's actual scores — not generic templates — with no accounts, no server persistence, and results encoded entirely in a shareable URL.

## Operating Context

Users complete the assessment in a browser, receive scores and prompts immediately, and may bookmark or share a results URL. Shared links let recipients view full results and prompts without retaking the quiz. Prompts are pasted into external AI tools (ChatGPT, Claude, Gemini, or any equivalent); Varkly does not integrate directly with those tools.

The approved panels redesign is a presentation replacement for the quiz and results experience. It does not change product scope, scoring logic, share-hash encoding, or prompt generation behavior.

## Capabilities and Constraints

**Confirmed functionality**

- 13-question VARK assessment with humorous scenario framing
- Multi-select answers per question and skip for non-applicable scenarios
- Back navigation and progress preservation via sessionStorage (survives refresh within a tab)
- Client-side score calculation and deterministic AI prompt generation
- Shareable results URL encoding scores client-side (`btoa` of `V-A-R-K`, padding stripped)
- Share-hash compatibility: existing `/r/:hash` links must continue to work
- Two AI prompts on results: System Prompt (100–150 words) and Conversation Prompt (25–40 words)
- Keyboard operation for quiz navigation and answer selection

**Technical constraints**

- No user accounts, application database, or application backend
- All scoring, prompt generation, and results encoding run in the browser
- Deployed as a static Vite SPA on Vercel
- Google Analytics (`G-QCPTM267KD`) and Cloudflare Web Analytics beacon in `index.html` are intentional owner-side analytics; they are not application persistence and must not be removed or altered without explicit authorization

**Explicitly out of scope (current version)**

- Email capture, server-side data persistence, user accounts, historical results lookup
- Direct AI integrations (browser extensions, auto-paste)
- AI prompt personalization beyond VARK score
- Team or organizational dashboards

## Evidence on Hand

- `PRD.md` — product requirements and prompt generation rules
- `COPY.md` — customer-facing text extraction, including preserved `ResultsExplanation` copy (sections 16–22)
- `src/data/questions.ts` — 13 VARK questions with answer options
- `src/utils/aiPrompts.ts` — deterministic prompt generation with unit tests
- Production deployment at `https://varkly-eight.vercel.app` (custom domain deferred)

## Product Principles

1. **Zero friction entry** — no account, no login, results available immediately after 13 questions.
2. **The prompts are the product** — every design decision serves getting users to copy and use both AI prompts.
3. **Stateless by design** — quiz answers and scores never leave the browser except via the user-chosen share URL.
4. **Deterministic and trustworthy** — prompts reflect actual VARK scores; same scores always produce the same output.
5. **Honest representation** — multi-select and skip let users represent genuine mixed preferences rather than forcing single choices.

## Accessibility & Inclusion

- Full keyboard operation for quiz flow (answer selection, navigation, skip)
- Accessible labels on interactive controls (buttons, options)
- Results and prompts must remain readable and operable without mouse-only interaction
