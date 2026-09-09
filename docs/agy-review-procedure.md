# AGY Review Gate Procedure

> **Bright Blocks check-in (2026-08-03):** Imported from operator canon outside
> this repo. Conflict record and rulings:
> [`review-procedure-conflicts.md`](./review-procedure-conflicts.md). Actor map:
> [`review-chain.md`](./review-chain.md).

Canon documentation of the AGY review gate, assembled from the process already
established in `AGENTS.md` (§ "AGY Loop — Full Specification") and `CLAUDE.md`
(§ "Review gate — AGY + Perplexity protocol"). This file **does not invent
process**; where existing canon does not fully specify a step, that gap is
flagged explicitly under § "Gaps in current canon" rather than filled in.

The substitute/supplementary reviewer (Perplexity) has its own document:
`docs/pplx-review-procedure.md`.

---

## 1. What AGY is

AGY is the Antigravity binary at `/Users/rajtaneja/.local/bin/agy` running the
**newest Gemini Flash High available in `agy models`** — `gemini-3.7-flash-high`
as of 2026-08-28, and 3.8+ as soon as it ships. **Never a Claude/Anthropic model
and never an older Gemini than the binary offers** (RT ruling 2026-08-28: the code
under review is written by an Anthropic model, so an Anthropic reviewer is a
conflict of interest; and running 3.6 when 3.7 is available is a pointless
downgrade). Earlier revisions of this file pinned `gemini-3.6-flash-high`; that
pin is superseded — check `agy models` at dispatch.

AGY is a **fallback only**, used when Perplexity is unreachable. See the
amendment at the top of `pplx-review-procedure.md` for the full priority order. It runs
**locally in the shell** only: no browser, no GitHub API, no filesystem writes.
**Cursor Agent 2.5** invokes AGY, captures output, and posts PR comments via
`gh` (see `docs/review-chain.md`). Any pass not run through the real binary is
invalid and must be discarded and re-run.

**Local capture path (established 2026-08-05, by observation):**

```
~/Library/Mobile Documents/com~apple~CloudDocs/AI Braintrust's Documents/agy-reviews/
    agy-pr{PR}-{model-slug}-{head-sha}.md
```

This folder is the operator-accessible location and already holds captures for
PRs #303-#307 and #116. Earlier revisions of this document said the path was
"not yet established"; it is.

## 1a. Read-only rule (applies to every review gate)

**A reviewer that can modify what it is reviewing is not an independent gate.**
This binds AGY, PPLX, and any future gate equally.

- **No write access, no tool grants that permit writes, no execution against a
  working tree.** Never launch AGY with `--dangerously-skip-permissions`.
- Run the binary with **no permission flags**, and from a directory that is not
  the repository under review, so the repo is not in its workspace.
- Everything the gate needs is supplied **inline in the packet** as read-only
  material. AGY runs fine with zero tool grants when the packet is self-contained.
- **If a gate cannot verify a claim by reading, it reports that claim as
  UNPROVEN.** It does not go execute it.
- **Execution verification is the coder's job** — done before the review, against
  a scratch database or disposable environment, and reported as part of the work.
  The gate then reads that reported evidence and critiques it.
- Record the worktree hash before and after every run and state whether it
  changed. A run that mutated the tree is void.

Establishing this cost a voided pass on PR #116 (2026-08-04): AGY was launched
with blanket tool approval so it could execute SQL. The worktree came back
clean, and the pass was discarded anyway — independence, not outcome, is what
makes a gate a gate.

## 2. Exact working command

`claude.md` § AGY does not exist in the current file — the "authoritative"
pointer below is stale and should not be trusted to resolve elsewhere. What
follows is empirically verified against the real binary (2026-08-08), not
copied from that missing section.

**Bare-prompt invocation fails clean, every time.** Running AGY headless with
just `"Review PR #<n>, head <sha>"` and no diff attached produces **zero
output** — the model tries to invoke a real tool (`command`, `read_file`, etc.)
to go look at the PR itself, headless mode cannot prompt for that permission,
so the call is auto-denied and nothing is returned:

```
jetski: no output produced — a tool required the "command" permission that
headless mode cannot prompt for, so it was auto-denied.
```

No text, no partial review, no error surfaced to a triager who isn't watching
stderr — and it leaves **no trace in `history.jsonl` at all**, success or
failure (see below). Never dispatch AGY with a bare PR reference in headless
mode; it cannot ground itself and will not tell you it failed to.

**The inline-packet method is the only one that works here**: paste the diff
directly into the prompt so the review is self-contained per §1a, e.g.

```
agy --model gemini-3.6-flash-high --prompt "Review PR #124, head bf173ba2.
Diff follows, read-only, do not execute:

$(gh pr diff 124)"
```

This is **nondeterministic** — three separate PRs reviewed this way on
2026-08-08 needed 1, 1, and 3 attempts respectively before returning output
(the two failed attempts hit the same tool-permission auto-denial as the
bare-prompt case, on a different tool each time: `command`, then `read_file`).
Retry on a silent/empty response before concluding the packet itself is bad.

**It has zero cross-PR or branch-stack awareness.** Reviewing a single PR's
diff in isolation, AGY flagged the removal of `maybeRunScheduledJobs` /
`piggyback-register` from `collect.ts` in PR #126 as an "unintended code
deletion... accidental regression" and recommended reverting it. It is not a
regression — PR #127 re-adds that exact wiring as its own dedicated feature
with full test coverage; the removal in #126 is intentional multi-PR
sequencing. **Any finding that reads like a regression, a stray deletion, or
a scope violation must be checked against sibling PRs in the same stack
before being treated as real** — AGY has no visibility into that context from
a single-PR packet and will confidently flag intentional sequencing as a bug.

For a batch: **fire all AGY instances as parallel background bash jobs
simultaneously** before doing anything else. (AGY and the coder are separate
agents and must run simultaneously whenever both have work; leaving either idle
while the other runs is a logged process violation.)

**`history.jsonl` does not corroborate headless runs, successful or failed.**
It only logs turns typed into the interactive TUI. A headless `--prompt` run
that returns a full, real review leaves the same zero-line trace in
`history.jsonl` as one that fails outright — confirmed across 5 headless
invocations (2 failed, 3 succeeded) on 2026-08-08, none of which added a
single line to it. The only verifiable trail for a headless run is
`~/.gemini/antigravity-cli/cli.log`, which logs real
`streamGenerateContent` calls with genuine trace/response IDs from the
backend. Before treating any headless AGY capture as proven-genuine, confirm
a matching `streamGenerateContent` entry in `cli.log` at the capture
timestamp — `history.jsonl` cannot do this job.

## 2a. Review packet size cap (hard operational constraint)

AGY **silently truncates** review packets at roughly **200KB**. Observed on
PR #116 head `d194b67` (2026-08-04): a 279KB packet was cut at byte 200,868
mid-artifact. AGY exited **0**, reported a clean pass, and gave **no** signal
in stdout, stderr, or exit status that evidence had been dropped. Empirically:
a ~150KB payload returns both start and end markers; a ~260KB payload returns
the start marker only.

**Rules:**

1. Keep every AGY `--prompt` / packet **under 150KB** (hard ceiling with
   margin under the observed ~200KB cut).
2. Split larger reviews into focused passes (e.g. provenance false-claims
   pass; SQL body pass; path-mapping pass) rather than one mega-packet.
3. **Never accept a clean AGY verdict** without confirming the packet that
   was delivered was under the cap. A gate that saw nothing reports the same
   as a gate that found nothing.
4. Prefer end-of-packet sentinel markers (unique start/end strings) when
   debugging delivery; absence of the end marker means truncation even if
   exit code is 0.

Recorded in `WALL-OF-STUPID.md` (2026-08-04). Do not rediscover this the hard
way.

## 3. The gate sequence

Every AGY prompt must **restate all of the following explicitly** — never assume
they are inherited:

1. **Loop until blocker confidence is high enough:** review → fix accepted
   blockers → review the new head → repeat. There is no mandatory count of
   repeated passes on an unchanged head — the loop ends when confidence is
   high enough, not at a fixed number.
2. **Fresh review on every head change.** Any commit that changes the head
   (an accepted fix, a rebase, a conflict-resolution commit) requires a new
   review against that head; a stale review of a prior head does not carry
   forward.
3. **Independent lenses when useful:** runtime correctness, data integrity and
   security, and cross-PR integration are lenses to draw on based on risk —
   apply the ones that matter for the PR rather than running all of them
   mechanically every time.
4. **Targeted failure-path verification on high-risk PRs:** Supabase outage
   fallback, SQL query plans on new indexes, Stripe metadata and catalog fixture
   correctness, migration lock behavior, and alert delivery state.
5. **Focused tests and a production build after accepted fixes**, when
   relevant to the change.
6. **One cross-stack ancestry pass last**, across every PR in the batch (against
   the effective merged ancestry).

### Head-change rule

If `main` advances after a PR's review is established and conflict resolution
creates a new commit, **that commit is a head change**: run a fresh review
against the resolved head before merge — even when focused conflict-resolution
tests pass. There is no clean-count to reset; the rule is simply that every
head gets its own review.

## 4. Gemini Code Assist final stamp — SUPERSEDED (bot sunset)

> **This section describes the Gemini Code Assist GitHub bot, which is sunset**
> (new installs blocked 2026-06-18, all activity ceased 2026-07-17). `CLAUDE.md`
> rules it out for new reviews. It is retained below only as a historical record
> of how the quota and `changes_requested` conventions worked. **Do not run a
> "final stamp" step; there is no bot to run it.** Note the name collision: the
> *models* named Gemini that AGY and PPLX drive are unrelated to this bot and are
> current.

### Historical record — Gemini Code Assist bot

- **Gemini fires only after AGY reaches 99% blocker confidence.** Gemini is the
  expensive final stamp on code already **proven clean** by AGY.
- **Target:** zero *confirmed blockers after triage*. Zero raw Gemini comments is
  **not** the target and is **not achievable**.
- **Quota:** Gemini is capped at **33 reviews per day across all of RT's
  projects.** Never waste that quota.
- **Quota status is time-sensitive:** before asserting availability or
  exhaustion, verify the current time and the reset window and state the
  exhaustion timestamp explicitly. **Never assert quota status from memory.**
- Any AGY/tool error containing an explicit quota/rate-limit message **with a
  stated reset time** must be reported to RT **verbatim, immediately**.
  Subsequent waits are computed as `(stated reset time − current verified time)`,
  never re-issued at the original full duration.

### `changes_requested` with zero unresolved threads

A Gemini review returning `changes_requested` with **zero unresolved threads is
functionally clean** under established project precedent. It is **not** a merge
blocker.

## 5. Substitute gate (mutual with PPLX)

When AGY is **quota-exhausted or unavailable**, use **PPLX** (Perplexity browser
session, **Gemini 3.1 Pro Thinking**) — see `docs/pplx-review-procedure.md`.
When PPLX is unavailable, AGY is the substitute. **PM instructs** either; there
is **no per-run authorization** and RT is not in the review loop (RT 2026-08-03 —
see `docs/review-procedure-conflicts.md`).

## 6. What is invalid and must be discarded

- Any AGY pass run by a Claude subagent (or any non-`agy`-binary / model other
  than **Gemini 3.6 Flash High**) instead of the real binary.
- Any AGY pass whose review packet was **at or above ~200KB** (or whose
  delivery was not confirmed under the **150KB** working ceiling) — silent
  truncation produces false cleans. See §2a.
- Any Perplexity review where a diff was pasted instead of the GitHub PR URL.
- Any Perplexity review where the grounding check failed.

## 7. Findings are input, not a verdict

AGY, Gemini, and PPLX findings are **review input**. They go through PM triage —
accept, downgrade, or reject per severity, with reasoning — and are never
treated as an automatic merge gate or automatic blocker without triage. Triage
is the PM's job, done against actual source; the coder does not merge on its own
initiative.

## 8. Historical — Resolved by RT 2026-07-23 (clean-pass definition)

*(Authorization language in this section is superseded by RT 2026-08-03 — see
`docs/review-procedure-conflicts.md`. Retained as dated record.)*

RT ruled on three open questions. A **PPLX review** (then **Gemini 3.1 Pro
Thinking** in Perplexity) is a full clean-pass — no per-run authorization
required. The resolutions still governing triage:

- **Definition of a "clean pass."** A pass is clean when there are **zero
  un-triaged blockers** at that head after triage against real source — not zero
  raw findings. Raw reviewer comments are input, not a verdict (see §7).
- **Merge authority of a PPLX-only gate.** A PPLX review is **itself sufficient**
  to clear a PR for merge. It is a full substitute gate carrying real merge
  authority, not merely a deferral of the AGY requirement until quota returns,
  and it does not require RT authorization per run.
- **Number of PPLX passes required.** There is **no separate substitute
  pass-count multiplier**. That framing was never benchmarked and is rejected as
  a requirement.

This ruling is recorded in `tasks.md` (DECIDED section, item 9, extended, and
the closed "AGY gate open questions" backlog item). The controlling canon
(`claude.md` / `AGENTS.md`) is to be updated to reflect it verbatim from RT's
drafted addendum. Do not re-litigate.
