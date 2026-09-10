# PM handover — 2026-09-10 (b)

**Supersedes** [`docs/pm-handover-2026-09-10.md`](./pm-handover-2026-09-10.md). Where the two disagree, this document wins — it reflects state verified against live GitHub after that document was written.

Verified directly against GitHub at time of writing: `gh pr list --state open`, `gh pr view`, `git fetch origin main`.

---

## 1. Merge authority

Merge authority is explicitly granted by RT to the PM role, confirmed this session. A zero-blocker review gate plus PM triage is what clears a PR to merge; no separate per-merge owner sign-off is required.

## 2. PR #20 — merged

PR #20 (`chore/remove-playwright-fix-theme-sync`) is merged to `main` at squash commit `57878ac4b4bbecf447c32e84b66903ba5a160e62`.

- The head that actually merged was `f849fc0`, not the `017e195` it was opened at — it moved one commit past `017e195` to resolve a real conflict in `planning.md`/`tasks.md` against `81fcc9b` (which had landed on `main` while the PR was open). Content of the PR itself was unchanged; only narrative-doc conflict resolution was added on top.
- Playwright is fully removed (package, config, `e2e/`, scripts, CI references).
- The cross-tab theme desync fix shipped (`ThemeProvider`: persist on explicit toggle only, `storage`-event listener without write-back).
- All three manual browser checks passed 3/3 against the PR's Vercel preview and are recorded as a PR comment on #20: reload persistence, live two-tab sync in both directions, unrelated-`localStorage`-key write has no effect on theme or in-progress quiz state.

## 3. Doc discipline — no direct pushes to main

Standing rule going forward: **no direct pushes to `main`, including docs-only changes.** Everything goes through a PR and required review gates.

This was violated once this session: a docs-only Wall of Stupid entry was pushed directly to `main` as commit `034c05a`. It was caught by RT, reverted on `main` (revert commit `a25cfcb`), and the same content was cherry-picked onto a proper PR branch instead (PR #21, below).

A written rule for this did not previously exist anywhere in the repo before this session — `AGENTS.md`, `CI_POLICY.md`, and every `docs/` review-procedure doc were checked and none stated it. **PR #22** (`docs/no-direct-main-pushes`) adds it to `AGENTS.md` § Git Rules: "All changes to this repository, including docs-only changes, go through a PR and required review gates before merging to main. No direct pushes to main, regardless of change size or type." **Open, unmerged:** https://github.com/aibraincoach/varkly/pull/22

## 4. PR #21 — open, unmerged

**Open, unmerged:** https://github.com/aibraincoach/varkly/pull/21 (`docs/wall-of-stupid-2026-09-10-b`). Contains two Wall of Stupid entries:

- **action-verb-without-dispatch** — described actions as happening ("Merging it") without a dispatch prompt attached in the same message. This is the entry that was mistakenly pushed direct to `main` (§3 above) and is now correctly carried on this PR instead.
- **wall of text on a binary approval** — given a binary approve/disapprove choice from RT, answered with the flat choice plus a full coder-dispatch prompt bundled into the same response, instead of the choice alone.

Waiting on RT approval to merge.

## 5. Standing rule — status-message format

Every PM status message ends in exactly one of three states:

- `Dispatched: [prompt]`
- `Waiting on [named report]`
- `Done: [commit SHA/PR link]`

No other phrasing. No action verb describes something that is not literally dispatched in that same message or already confirmed (commit SHA / PR link in hand).

## 6. Standing rule — binary approve/disapprove questions

A binary approve/disapprove question from RT gets the flat answer alone — nothing else in that message. Elaboration (a dispatch prompt, a revision, an explanation) is only appropriate following a **negative** — a rejection or a required revision. It never follows an approval; any dispatch that follows an approval goes in a separate message.

## 7. Standing rule — memory is not source of truth

Claude's private memory is not source of truth on this project. All state lives in the handover docs (this file and its predecessors) and `WALL_OF_STUPID.md`, both maintained by the coder in the repository. Updates to project state get dispatched to the coder to write into those documents — never just noted privately and carried forward in conversation memory alone.

---

## Live state at time of writing

- `main` at `a25cfcb` (the revert commit from §3).
- Two PRs open: **#21** (Wall of Stupid entries, §4) and **#22** (no-direct-main-pushes rule, §3). Neither merged.
- Zero other open PRs.
