# Review chain — actors, mechanisms, and handoffs

This file is the **Bright Blocks** canonical map of who runs each review type,
through what mechanism, and who performs steps the reviewer itself cannot do.
The owner (RT) is not in this loop. **Cursor Agent 2.5** (dispatched by the PM
session) is the operator for every step that requires shell, filesystem, browser
automation, or `gh`.

Full procedures: [`agy-review-procedure.md`](./agy-review-procedure.md),
[`pplx-review-procedure.md`](./pplx-review-procedure.md). Unresolved canon
conflicts: [`review-procedure-conflicts.md`](./review-procedure-conflicts.md).

**Every gate is read-only.** No write access, no tool grants that permit writes,
no execution against a working tree; unverifiable-by-reading is reported as
UNPROVEN. Full rule: `docs/agy-review-procedure.md` §1a. It binds PPLX equally.

There is **no ruled ordering** among AGY, PPLX, Cursor Bugbot, and GitHub PR
bots. They are distinct reviewers, not a sequence.

---

## Reviewer types (do not conflate)

| Reviewer | What it is | Where it runs | Posts to GitHub by itself? |
|---|---|---|---|
| **AGY** | Antigravity CLI (`/Users/rajtaneja/.local/bin/agy`) with **Gemini 3.6 Flash High** | Local shell on the dev machine | **No** |
| **PPLX** | Perplexity browser session (**Gemini 3.1 Pro Thinking** in Perplexity's model picker, Perplexity in-app incognito) on `perplexity.ai` | Dev machine, driven by Cursor Agent browser automation | **No** |
| **Cursor Bugbot** | Cursor Bugbot subagent (`review-bugbot` skill / `subagent_type: bugbot`) | Inside Cursor against local PR diff | **Unknown** — not verified against any Bright Blocks PR |
| **GitHub PR bot** | Automated review attached to the PR on GitHub (historically conflated with "Perplexity" in old docs) | GitHub | **Yes** — posts its own PR comments when configured |

**PPLX and GitHub PR bot are different reviewers.** Old "Perplexity/BugBot"
wording merged a manual Perplexity browser session with an automated GitHub
bot. Do not use that combined label.

**Gate-equivalence rule (RT 2026-08-03, restated 2026-08-05):** AGY
(**Gemini 3.6 Flash High**, local CLI) and PPLX (**Gemini 3.1 Pro Thinking**,
Perplexity browser) are **mutually acceptable gates — not a sequence, and not a
primary with a fallback**. Dispatch **whichever is available**; either alone
satisfies the gate. Neither is a prerequisite for the other, and running one
does not oblige running the other. The word "substitute" elsewhere in these docs
means the same thing: either gate alone is sufficient when no per-PR ruling says otherwise.

**RT ruling (2026-08-09, PR #134 cockpit parity):** For this stack, **PPLX is the
merge gate** — RT runs PPLX himself. **AGY-green is not the merge gate.** Nothing
merges until PPLX passes. This overrides the generic mutual-acceptability rule for
#134 only until RT says otherwise.
is historical and does not imply AGY is primary. Either runs on **PM instruction** with no per-run
authorization.

---

## AGY — step-by-step actors

| Step | Actor | Mechanism | Notes |
|---|---|---|---|
| Dispatch / run review | **Cursor Agent 2.5** | Shell: invoke `agy` binary with PR URL or diff context per `agy-review-procedure.md` | AGY is not a Cursor subagent pretending to be AGY |
| Model | **AGY binary** | Gemini 3.6 Flash High only | Invalid if run through Claude or any other model |
| Produce review text | **AGY binary** | stdout / AGY output | Ends here for AGY itself |
| Save local capture | **Cursor Agent 2.5** | Write file — **path not yet established** (see below) | **AGY cannot write the review capture file** |
| Post PR comment | **Cursor Agent 2.5** | `gh pr comment <N> --body-file <file>` | **AGY cannot call GitHub** |
| Triage findings | **PM session** (Claude) | Accept / downgrade / reject against source | Findings are input, not verdict |

### AGY local capture path

**Established 2026-08-05 by observation:**

```
~/Library/Mobile Documents/com~apple~CloudDocs/AI Braintrust's Documents/agy-reviews/
    agy-pr{PR}-{model-slug}-{head-sha}.md
```

That folder already holds captures for PRs #303-#307 and #116. The paragraph
below is the superseded instruction, retained so the change is visible:

> Not yet established. No Bright Blocks AGY capture path is documented from
> observation. Do not invent a Downloads or iCloud path. When a path is ruled,
record it here.

Header contents when a capture is saved (wherever it lands): PR number and
title; **head SHA reviewed**; model (Gemini 3.6 Flash High); capture date; then
**raw AGY output, verbatim**.

### AGY GitHub comment format — **proposed, not established**

No Bright Blocks PR comment was found in the
`## Automated AGY review (…)` format. Until a format is ruled or observed in
this repo, treat the block below as **proposed only** — do not present it as
standing procedure.

```markdown
## Automated AGY review (Gemini 3.6 Flash High)

**Reviewer:** AGY (`/Users/rajtaneja/.local/bin/agy`) — not human commentary.
**Head reviewed:** `<full git SHA>`
**Captured:** `<ISO date>`

<raw review body, redacted per sensitive-path rule if needed>

---
*This review is void if a new commit lands on this branch after the head SHA above (one-commit rule).*
```

---

## PPLX — step-by-step actors

| Step | Actor | Mechanism | Notes |
|---|---|---|---|
| Open `perplexity.ai` | **Cursor Agent 2.5** | Browser automation | Not `gemini.google.com` |
| Enable Perplexity in-app incognito | **Cursor Agent 2.5** | Perplexity UI toggle | Not the browser's private window |
| Select model | **Cursor Agent 2.5** | Perplexity model picker → **Gemini 3.1 Pro Thinking** | |
| Type review prompt | **Cursor Agent 2.5** | Browser input: `code review <PR URL>` only | Perplexity does not receive prompts autonomously |
| Grounding check | **Cursor Agent 2.5** | Verify diff stat + verbatim quote in same session (see `pplx-review-procedure.md` §5) | Void review if grounding fails |
| Save local capture | **Cursor Agent 2.5** | Write file (see path below) | **Perplexity cannot write files** |
| Post PR comment | **Cursor Agent 2.5** | `gh pr comment <N> --body-file <file>` after redaction pass | **Perplexity cannot call GitHub** |
| Close review tab | **Cursor Agent 2.5** | Browser tab close | Do not quit the browser app |
| Triage findings | **PM session** (Claude) | Accept / downgrade / reject against source | |

### PPLX local capture path

Per imported operator canon (`docs/pplx-review-procedure.md` §7):

```
~/Library/Mobile Documents/com~apple~CloudDocs/AI Braintrust's Documents/
    pplx-review-{PR_NUMBER}[-r{ROUND}].md
```

Captures land in the operator-accessible iCloud folder above; `~/Downloads/`
is superseded (not operator-accessible).

Header must include: PR number and title; **head SHA at capture**; `gh` diff
stat (`additions`/`deletions`/`changedFiles`); model; incognito flag;
grounding verdict (PASS/FAIL with numbers); capture date; then **raw
Perplexity output, verbatim, no triage at capture time**.

### PPLX GitHub comment format — **proposed, not established**

Observed Bright Blocks PPLX posts (e.g. PRs #106, #110, #113) use varying
headings and bullet provenance — not the exact template below. Required content
from operator canon (`pplx-review-procedure.md` §8): automated-Perplexity label,
head SHA, one-commit-rule footer, after redaction. The block below is
**proposed only**.

```markdown
## Automated Perplexity review (Gemini 3.1 Pro Thinking)

**Reviewer:** Perplexity incognito session on perplexity.ai — not human commentary.
**Head reviewed:** `<full git SHA>`
**Grounding:** PASS — `+N / -M` lines (`gh` stat matches); verbatim quote present.
**Captured:** `<ISO date>`

<raw review body after redaction — no credential paths or secret breadcrumbs>

---
*This review is void if a new commit lands on this branch after the head SHA above (one-commit rule).*
```

If grounding failed, **do not post** — re-run after diagnosis.

---

## Cursor Bugbot — step-by-step actors

| Step | Actor | Mechanism | Status |
|---|---|---|---|
| Launch review | **Cursor Agent 2.5** | `review-bugbot` skill or Bugbot subagent on branch diff | Skill exists in Cursor; Bright Blocks usage not inventoried here |
| Produce findings | **Cursor Bugbot subagent** | Returns structured review to parent agent | Assumed from Cursor skill docs — **not verified** on a Bright Blocks PR |
| Post PR comment | **Unknown** | Whether Bugbot posts itself, whether the parent posts via `gh`, or neither | **Not verified** against any Bright Blocks PR. Do not invent a PM-triggered posting rule. |

---

## GitHub automated PR bot

When a third-party or GitHub-native bot comments on the PR, that comment is
**its own record**. Do not treat it as a PPLX capture. Triage it like any other
review input.
