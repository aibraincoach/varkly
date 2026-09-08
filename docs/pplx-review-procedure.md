# PPLX (Perplexity) Review Procedure

> **AMENDMENT — RT ruling, 2026-08-28. This section overrides §1 and §3 below
> wherever they conflict.**
>
> **Gemini 3.1 Pro Thinking is gone from Perplexity's model picker.** Confirmed by
> inspection on 2026-08-28; the picker offered Best, Sonar 2, GPT-5.6 Terra,
> GPT-5.6 Sol (Max), Gemini 3.7 Flash, Claude Sonnet 5, Claude Opus 5 (Max),
> Kimi K3, GLM 5.2, Grok 4.6, Nemotron 3 Ultra. The old §1 rule — "do not
> substitute those" — is superseded by the order below.
>
> **Model selection, in priority order. Take the first one available:**
>
> 1. **Gemini 3.7** on Perplexity (currently listed as "Gemini 3.7 Flash").
> 2. **GPT Terra** on Perplexity. RT referred to this as "ChatGPT 5.4 Terra"; the
>    picker's current label is **GPT-5.6 Terra**. Same model line — take whatever
>    Terra the picker offers.
> 3. **Any non-Anthropic model** on Perplexity.
> 4. **AGY**, only as a fallback when Perplexity is unreachable.
>
> **No Anthropic models are ever used for code review.** Not Claude Sonnet 5, not
> Claude Opus 5, not any successor — on Perplexity or anywhere else. The code under
> review is written by an Anthropic model, so an Anthropic reviewer is a conflict of
> interest, and the gate stops being an independent gate.
>
> **Always take the newest model available in whichever tool you land on.** When
> AGY is the fallback, that means `gemini-3.7-flash-high` today, and 3.8 or later
> the moment it appears in `agy models`. Never run an older model than the tool
> offers — running 3.6 when 3.7 is sitting right there is not a fallback, it is a
> downgrade for no reason. Rollout is not instant, so check `agy models` rather
> than assuming.
>
> **Model authority is unchanged:** the model selected in the picker (or passed to
> `--model`) at dispatch is the sole authority for what ran. A model's claim about
> itself in its own output is never evidence.

> **Bright Blocks check-in (2026-08-03):** Imported from operator canon outside
> this repo. Conflict record and rulings:
> [`review-procedure-conflicts.md`](./review-procedure-conflicts.md). Actor map:
> [`review-chain.md`](./review-chain.md).

Canon documentation of the Perplexity code-review process **as it has actually
been run**, so any future session can execute it without being re-taught.

This file consolidates and refines the shorter notes in
`AGENTS.md` (§ "PPLX Review Procedure") and `CLAUDE.md` (§ "Review gate — AGY +
Perplexity protocol"). Where this document is more specific than those notes
(stronger grounding check, standing auto-post behavior, redaction rule), treat
this file as the working procedure.

---

## 1. Purpose and standing rule

PPLX means **Perplexity** running **Gemini 3.1 Pro Thinking** in a Perplexity
**incognito session** on `perplexity.ai`. **Cursor Agent 2.5** drives the browser
(open site, incognito toggle, model picker, prompt entry, tab close).
Perplexity produces review text in the browser only — it cannot write files or
post GitHub comments. Cursor Agent saves `~/Downloads/pplx-review-{PR}.md` and
posts via `gh` (see `docs/review-chain.md`).

**Model authority:** the model **selected in Perplexity's picker at dispatch**
is the sole authority for which model ran, and it must be confirmed on screen
before the prompt is sent. A model name the response *declares about itself* in
its body is **not** reliable evidence and must never be used to establish
provenance — record what the picker showed. (Same rule as AGY, where the
invoking `--model` flag is the sole authority.)

Perplexity's model picker (2026-08-03) also offers Sonar 2, GPT-5.6 Terra,
GPT-5.6 Sol, Claude Sonnet 5, Claude Opus 5, and Kimi K2 — **do not substitute
those for PPLX** unless RT explicitly changes the procedure.

PPLX and **AGY** (Gemini 3.6 Flash High via local CLI) are **mutually
acceptable substitutes** when the other is unavailable (RT 2026-08-03). Both are
review *input*, held to the same triage discipline.

## 2. Dispatch (PM instruction — no per-run authorization)

PPLX runs when the **PM instructs** a PPLX review — same as AGY. There is **no
per-run RT authorization** and RT is not in the review loop. Once PM instructs a
PPLX run, the rest of this procedure — including posting every capture to GitHub
(§8) — runs **automatically without asking again** for that run (not a per-PR or
per-post approval gate).

## 3. Setup (confirm before every batch)

1. Open `perplexity.ai` — **not** `gemini.google.com`. PPLX runs on
   Perplexity's own site with **Gemini 3.1 Pro Thinking** selected *within*
   Perplexity's model picker. Gemini's own standalone app has **no GitHub
   repo access** and will produce a confabulated or refused response for a
   private-repo review link; it is not an equivalent substitute and has
   caused a real misfire when a dispatch prompt named only the model
   without naming the platform. Any dispatch instruction for a PPLX run
   must name **Perplexity** explicitly.
2. Turn on **Perplexity's own in-app Incognito toggle** — an account setting
   inside Perplexity (sessions expire ~24h, not saved to history). This is
   **not** the browser's private/incognito window; it is a distinct setting.
3. Set the model to **Gemini 3.1 Pro Thinking** in Perplexity's model picker.
4. Confirm login state (a Pro account) **and** the incognito toggle **and** the
   model **before** running a batch, every time.

## 4. Invocation

The review prompt is:

```
code review [PR URL]
```

e.g. `code review https://github.com/aibraincoach/brightblocks-site/pull/NNN`

- **Private repos work.** Perplexity reads the real private diff via a **GitHub
  API connector** configured on the account. This is **confirmed working** — do
  not assume it will fail or fall back to pasting a diff.
- **Do not re-verify connector access mid-session.** Once GitHub connector
  access to this repo has produced at least one grounded review (§5) in the
  current session, treat it as proven for the rest of that session — do not
  re-check the connector's authorization or installation scope before
  subsequent reviews. Re-verify only on an actual error (a failed grounding
  check, a refused/confabulated response, a stated access error) — not on a
  plausible-sounding concern (e.g. an account/email mismatch) with no
  supporting failure. Confirm this against the session's own review history,
  not a restated claim about it — a PR named as evidence of a prior grounded
  review is only evidence if it actually carries a matching, grounded review
  comment.
- **URL method only.** Never paste a diff into Perplexity. A pasted-diff review
  is invalid and must be re-run with the PR URL.
- Two dispatch modes are supported:
  - **Sequential:** one review tab for one PR.
  - **Two-tab parallel:** at most two Perplexity review tabs, with one distinct
    PR assigned to each tab. Never dispatch the same PR in both tabs, place
    multiple PRs in one tab, or open a third review tab.
  Grounding, capture, redaction, posting, and the one-commit rule remain
  independent per PR in either mode. Close each procedure-opened review tab
  when that review's capture and required GitHub post are complete, and finish
  the batch cleanup in §11.

## 5. Mandatory grounding check (every single PR, before trusting anything)

Before any finding is trusted, the review must be **grounded**: prove Perplexity
actually read *this* diff and did not confabulate from the PR title.

**Correction (2026-08-10, WALL-OF-STUPID entry 104):** PPLX never outputs raw
`+`/`−` diff-stat counts in its prose review — that is not a thing the tool
produces, regardless of prompt. Requiring a stat count from the Perplexity
*output* voids every valid review that passes every meaningful grounding test,
solely because the tool doesn't narrate stats. The stat comparison is a
dispatcher-side **pre-flight** step (`gh pr view NNN
--json additions,deletions,changedFiles`, run before dispatch, per §3/A1) used
to know what to look for — it is not something to search for inside
Perplexity's answer.

The review is grounded when it, in the same session:

1. **Quotes at least one verbatim line that exists only in that diff** (not in
   the PR title/description); **and**
2. **References real file paths and artifacts** (function names, config keys,
   migration filenames, etc.) that are traceable to the actual PR contents, not
   just a plausible-sounding restatement of the PR title.

**Grounding is verified by the dispatcher, not by prompting Perplexity.**
`CLAUDE.md` fixes the only acceptable input as `code review <PR URL>` with **no
grounding-check follow-ups**, and an earlier revision of this section
contradicted that by telling the dispatcher to append or follow up with a
grounding request. It does not.

Check grounding by reading what came back against `gh` yourself:

- Check whether any quoted line actually exists in the diff
  (`gh pr diff NNN`).
- Check that referenced file paths and artifacts are real and belong to this
  PR, not invented or generic.

If the bare prompt returns a generic review with no verbatim quote and no
PR-specific file/artifact references, that review is **ungrounded and void** —
re-dispatch a fresh single-prompt run against the correct PR URL rather than
negotiating with the existing thread. Adding prompts to coax grounding changes
the input and voids the pass.

**If the check fails** (no specific verbatim quote, or no real PR-specific
artifacts referenced): the review is **void**. Do **not** retry blindly.
**Diagnose why first** — bad link, private-repo/connector access issue, wrong
PR — then re-run once the cause is fixed.

## 6. One-commit rule

Any new commit to the branch **after** a review ran **voids that review** — it
was not looking at the final code. If the head moves (including a
conflict-resolution merge commit from advancing `main`), **re-run PPLX against
the new head SHA before merge.**

## 7. Local capture format

Capture **one file per PR** in:

```
~/Library/Mobile Documents/com~apple~CloudDocs/AI Braintrust's Documents/
    pplx-review-{PR_NUMBER}[-r{ROUND}].md
```

(e.g. `pplx-review-119-r1.md`). **Written by the dispatching agent** after
capture from the browser — Perplexity does not write this file. Earlier
revisions specified `~/Downloads/`; that is not operator-accessible and is
superseded. The filename must name the PR **actually reviewed** — if the
dispatch names one PR but the gate was pointed at another, the file is renamed
to match its contents.

Containing:

- A **provenance header**: PR number and title; **head SHA at capture**; `gh`
  diff stat; model (Gemini 3.1 Pro Thinking, Perplexity, incognito); grounding
  verdict (PASS/FAIL with the numbers); capture date.
- Then the **raw Perplexity output, verbatim and unedited**. **No triage is
  applied at capture time.**

Read the file back and confirm real, non-trivial content before marking the PR
done. A save is not confirmed until verified.

Triage is a **separate pass afterward**, done by the coder against the actual
source. Never trust *or* dismiss a finding without checking it against real
code.

## 8. Posting to GitHub is the record (standing behavior, on by default)

Posting is **not optional** once a PPLX run is authorized — **Cursor Agent 2.5**
posts via `gh pr comment` after redaction. Perplexity cannot post to GitHub.

Each posted comment must (operator canon):

1. Be **clearly labeled as an automated Perplexity (Gemini 3.1 Pro Thinking)
   review — not human commentary.**
2. **State the head SHA that was reviewed.**
3. **End with a one-commit-rule footer** noting that a new commit to the branch
   voids the review.
4. Include grounding verdict (PASS with a verified verbatim quote + real
   PR-specific artifacts, or do not post) and
   redacted raw review body.

A markdown template in `docs/review-chain.md` is **proposed only** — observed
Bright Blocks posts (e.g. #106, #110, #113) use varying headings. Do not treat
that template as established format.

If a PR's head moves and the review is re-run, **post a fresh comment on the new
head** — do **not** edit the old one. Every capture is indelible; nothing is
skipped or overwritten.

Post via a PR comment, e.g.:

```
gh pr comment NNN --body-file <comment-file>
```

## 9. Redaction rule (mandatory before any GitHub post)

Before posting, **screen the review for anything that would reproduce sensitive
location/access detail** if copied into a shared/semi-public comment.

The concrete example on record: the **PR #154** review reproduced
**credential-location breadcrumbs** — a local transcript file path plus line
numbers pointing at where a raw API key sits locally. That kind of finding is
**summarized on GitHub, never reproduced verbatim with the specific
path/lines.**

Redaction **trims the posted comment; it never means skipping the post.** The
**full unredacted capture stays local-only** (session downloads) *in addition
to* the redacted GitHub post.

## 10. Known operational quirks (Perplexity input box)

- The input box can drop, truncate, or retain stale text. **Immediately before
  every individual submit** — the initial review prompt and every follow-up, in
  either dispatch mode — verify that the complete intended text is present in
  the correct PR's tab. If it is empty, truncated, or stale, retype the full
  intended text and verify it again before submitting. This mandatory check is
  not limited to the first keystroke batch after a fresh page load.
- The box **chokes on em dashes (`—`)** — use **plain ASCII** in prompts sent to
  it.
- Submit via the arrow button or Return; **wait for that tab's response to
  fully finish streaming** before capturing (re-read until it stops growing).
  In two-tab mode, one tab may finish while the other continues.
- When a review's capture and required GitHub post are complete, **close only
  that review tab opened by this procedure**. Never close the browser
  application or another person's tabs.

## 11. Session cleanup — close your review tabs (never the browser)

The PPLX session runs in **RT's own live browser on his own machine** — not a
disposable sandbox. Leaving Perplexity tabs open is a real, felt resource cost
(RT has reported it degrading his laptop), not just tidiness. Treat tab
hygiene as a hard operational constraint, not a nice-to-have.

- **Default to one review tab at a time, sequential.** Close that tab
  immediately after its capture and required GitHub post are complete —
  **before** opening the tab for the next PR in the batch. Do not accumulate
  tabs "to close later."
- Two-tab parallel mode (§4) is the only exception, and even then the hard
  ceiling is **two** Perplexity review tabs, each belonging to one distinct
  PR. Close each one the moment its own capture and post are done; do not
  wait for its partner tab to also finish.
- When the batch ends, verify zero procedure-opened tabs remain (recheck via
  the tab-context tool, don't just assume prior closes succeeded).
- **Never close/quit the browser application itself** and never close tabs
  opened by somebody else; other work depends on them.

## 12. Relationship to AGY

PPLX and AGY are **mutually acceptable substitutes** (RT 2026-08-03). Either
may run on **PM instruction** with no per-run authorization. See
`docs/agy-review-procedure.md` and `docs/review-chain.md`. Once PM instructs a
PPLX run, **every capture in that run posts to GitHub** without further asking.
