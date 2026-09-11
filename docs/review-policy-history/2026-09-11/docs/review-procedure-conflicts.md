# Historical source — superseded 2026-09-11

Provenance only; never execute or use these instructions as current authority.
The project-local REVIEW_POLICY.md and procedures control current review.

# Review procedure conflicts — record

These procedure documents were checked in from operator canon outside this
repo:

- [`agy-review-procedure.md`](./agy-review-procedure.md)
- [`pplx-review-procedure.md`](./pplx-review-procedure.md)

This file preserves **what conflicted, what was ruled, and when**. Current
operating canon is in `CLAUDE.md` § Review chain and
[`review-chain.md`](./review-chain.md).

**Status as of 2026-08-05: no open conflicts.** Every conflict recorded below is
resolved and the resolutions are reflected in the procedure docs. This file is
now a historical record, not an open-questions list. The additional rulings
folded in on 2026-08-05:

- **Gate equivalence.** AGY and PPLX are mutually acceptable gates — not a
  sequence, not primary-and-fallback. Dispatch whichever is available; either
  alone satisfies the gate. This closes the remainder of Conflict 2.
- **Read-only gates.** No gate gets write access, tool grants that permit
  writes, or execution against a working tree. Unverifiable-by-reading is
  reported as UNPROVEN; execution verification is the coder's job, done before
  the review. See `agy-review-procedure.md` §1a.
- **Model authority.** The invoking `--model` flag (AGY) or the model selected in
  Perplexity's picker (PPLX) is the sole authority for which model ran. A model
  name declared in the response body is not reliable evidence.
- **Packet cap.** AGY silently truncates near ~200KB; keep packets under 150KB
  and treat any pass whose delivery was not confirmed under that ceiling as
  invalid. See `agy-review-procedure.md` §2a.
- **Grounding without follow-ups.** Grounding is verified by the dispatcher
  against `gh`, never by sending Perplexity additional prompts — `code review
  <PR URL>` remains the sole input.
- **Capture paths.** Both gates capture to the operator-accessible iCloud folder
  `AI Braintrust's Documents` (`agy-reviews/` for AGY). `~/Downloads/` and
  "path not yet established" are both superseded.
- **Gemini Code Assist final stamp.** The GitHub bot is sunset; there is no
  final-stamp step. Unrelated to the Gemini *models* AGY and PPLX drive.

---

## Resolved by RT 2026-08-03 — AGY ↔ PPLX substitute

**Ruling:** AGY (local CLI) and PPLX (Perplexity browser session) are **mutually
acceptable substitutes** when the other is unavailable or quota-exhausted.
Recorded in `CLAUDE.md` § Review chain and `docs/review-chain.md`.

---

## Resolved by RT 2026-08-03 — Conflict 1: PPLX authorization

**Ruling:** PPLX runs on **PM instruction** with **no per-run authorization**.
RT is not in the review loop. AGY and PPLX are mutually acceptable substitutes;
an authorization gate on one and not the other is incoherent.

**Superseded language removed** from `docs/pplx-review-procedure.md` §2 and
related sections (and matching RT-reservation language in
`docs/agy-review-procedure.md` §5): any requirement that substituting PPLX for
AGY is "RT's explicit call, each time."

### Historical record — what conflicted

**Position A — per-run authorization required** (superseded):

From `docs/pplx-review-procedure.md` §2 **Authorization (never silent)** (as
imported 2026-08-03):

> Running PPLX as the review gate is **RT's explicit call, each time.** It is
> **never silently substituted** for AGY. RT has personally reserved the
> decision to substitute PPLX for AGY; do not treat it as default
> PM/engineering judgment.

From `docs/agy-review-procedure.md` §5 **Substitute gate** (as imported
2026-08-03):

> **Authorization:** substituting PPLX for AGY is **RT's explicit call, each time**
> — never silently substituted.

From `docs/pplx-review-procedure.md` §12 (as imported 2026-08-03):

> PPLX is a **substitute gate**, run by **explicit RT authorization**, when AGY is
> unavailable/quota-exhausted.

**Position B — no per-run authorization** (affirmed 2026-07-23, extended
2026-08-03):

From `docs/agy-review-procedure.md` §8 **Resolved by RT 2026-07-23**:

> A **PPLX / Gemini 3.1 Pro Thinking review is a full clean-pass** — … **no
> per-run authorization** required. … it does not require RT authorization per run.

**Outcome:** Position B governs. Position A is void. PM may instruct either AGY
or PPLX without per-run RT sign-off.

---

## Conflict 2 — Primary gate ordering (RESOLVED 2026-08-05)

**Resolved:** there is no primary and no ordering. AGY and PPLX are mutually
acceptable gates; dispatch whichever is available. The RT 2026-08-03 substitute
ruling superseded the historical "primary vs substitute only" framing, and the
2026-08-05 gate-equivalence restatement closes the remainder — "substitute"
wording in these docs is historical and does not make AGY primary. The combined label **"Perplexity/BugBot"** is obsolete
— see `docs/review-chain.md` (PPLX vs GitHub PR bot are different reviewers).

### Historical Position A — AGY is primary; PPLX is substitute only

From `docs/pplx-review-procedure.md` §1 (as imported 2026-08-03):

> PPLX is a **substitute gate** for AGY — used when AGY is unavailable or
> quota-exhausted.

### Historical Position B — "Perplexity/BugBot" as primary (stale combined label)

From historical `CLAUDE.md` governance rule 10:

> Perplexity/BugBot is now primary reviewer for all PRs.

**Status:** Substitute interchangeability and reviewer split documented in
`docs/review-chain.md`. Do not revive the combined "Perplexity/BugBot" label.
