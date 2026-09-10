# PM handover — Varkly — 2026-09-10

**Audience:** incoming PM  
**Authoring rule:** facts below were checked against live GitHub / default-branch file contents at write time. Chat narrative and the outgoing PM’s affidavit are labeled when they are not independently verifiable from the repo.

**Verification timestamp (UTC):** 2026-09-10T19:19:54Z (approx.; SHAs below rechecked via `gh` / `git fetch` during this writeup)

---

## 1. Repo identity

| Fact | Verified value |
|---|---|
| GitHub full name | `aibraincoach/varkly` |
| Fork | `true` |
| Parent | `tanvirahamed2001/ZooTech-Hackathon-2026` |
| Default branch | `main` |

**Standing rule (also in `planning.md` §12):** this fork is intentionally kept behind upstream. **Never run “sync fork.”** Because this is a fork, GitHub defaults new PR bases to the upstream repo; **every PR base must be set explicitly to `aibraincoach/varkly`.**

---

## 2. Panels redesign (PRs #12–#15)

Single-screen, four-view UI (`PanelsScreen`: landing / question / results / prompts) replaced the old multi-page questionnaire. Delivery and remediation history live in `tasks.md` Milestone 8 and Session Log (keyboard ownership, clipboard fallback, copy-feedback lifecycle, dataset-derived navigation bounds, image loading hints, rail tab-stop / Enter-Space activation).

| PR | Title (GitHub) | State | Merge commit |
|---|---|---|---|
| #12 | docs: synchronize repository state for PM handoff | MERGED | `9ed2ba0e8a4e27ac317322f8f9901c42ca75c991` |
| #13 | feat: establish VARK panels foundation | MERGED | `3fc1ae6c5311acfbe3dede583b8539f7f5522bda` |
| #14 | feat: ship VARK panels experience | MERGED | `20e5d573d694fb05205fbf133e8fcbbf45986129` |
| #15 | docs: synchronize VARK panels architecture | MERGED | `f0851bd9d44b924e5add916d76138e458b0fe12b` |

Same-day follow-up on `main` after the #15 merge:

- `7a9f9652fd192b11463c0969242b188d1ac3ad21` — `fix: remove duplicated CI-policy banner in AGENTS.md` (duplicate banner introduced by the #15 merge auto-combine).

`7a9f965` is an ancestor of current `main`.

---

## 3. PR #17 — rail-exit proof + docs

| Fact | Verified value |
|---|---|
| Title | test: close rail exit and documentation gaps |
| State | MERGED |
| Merged at | 2026-09-09T12:10:49Z |
| Merge commit | `8c24b526383804bdc3166f89e20e82c93412a1db` |

Repo session log (`tasks.md`) records: strengthened rail-exit cases (prove actual exit, not mere movement), keyboard-contract doc sync, fresh `measure:assets` evidence, then merge to `main`.

---

## 4. Designer sync (PRs #18 / #19)

| PR | Title (GitHub) | State | Merge commit | Merged at |
|---|---|---|---|---|
| #18 | feat: designer sync 2026-09-09 — landing tiles, About VARK, results explanation | MERGED | `cf2bcdb85b66a1104cff19aa332c407e8ff723ea` | 2026-09-10T16:53:29Z |
| #19 | feat: reinstate dark mode with a single token set driving both modes | MERGED | `675f8bb0fc49a9cb517e1af4daf54337db7a9240` | 2026-09-10T16:53:50Z |

Shipped product surface (verified present on `main`): landing VARK tiles, `/about` + `AboutView`, results `ExplanationCard`, `ThemeProvider` / `ThemeToggle`, `data-theme` token set.

**Remediation (recorded in `tasks.md` Session Log 2026-09-09, then merged):** first pass had real defects — clipped intro text via an `h1` overflow/clamp, invisible spacer buttons gaming a layout invariant, PR #19 stacked on a stale PR #18 head, theme toggle keyboard collision. Audit → fix commits on the feature branches → re-review → merge at `675f8bb`.

**Important product fact still true on `main` after #19:** `ThemeProvider` persists preference through a `useEffect` on every `preference` change. There is **no** `storage` event listener on `main`. Cross-tab sync fix exists only on open PR #20 (see §7).

---

## 5. Post-merge findings list (“19-item backlog”)

**Repo check:** there is **no** checked-in file on `main` titled or structured as a numbered 19-item backlog from the post-merge PPLX/audit pass.

What *is* independently visible:

- Milestone 7 / Milestone 9 deferred items remain in `tasks.md` (older backlog + designer follow-ups).
- Outgoing-PM / owner narrative (affidavit + this session’s authorized plan): a planner produced a large remediation list after PPLX/audit; most items were classified as decisions / enhancements / unconfirmed defects, **not** confirmed bugs; **one** item called out as a real functional bug was cross-tab theme desync (internally labeled “#15” in that findings list — **not** GitHub PR #15).

Treat the exact “19” enumeration as **session/process record**, not as a file that exists on `main` for the new PM to open.

---

## 6. Owner scope cut (authorized work)

**Verified by what was actually authorized and implemented as PR #20** (PR body + branch contents), and by the owner’s written plan executed in-session:

Owner rejected a multi-PR remediation plan as scope creep on a non-revenue project. **Authorized exactly two items:**

1. **Remove Playwright entirely** (stated operational reason in owner/PM narrative: Playwright was crashing a shared Raspberry Pi and taking down unrelated revenue work).
2. **Fix cross-tab theme desync** (findings-list #15).

Everything else from that findings list is **closed / not tracked** under the scope cut — do not reopen it without a new owner authorization.

Open Playwright / E2E backlog checkboxes that still appeared on `main` `tasks.md` before this handover pass are historical debt relative to that cut; this handover pass marks them closed as superseded by the cut + PR #20.

---

## 7. PR #20 — Playwright removal + theme sync (OPEN)

| Fact | Verified value |
|---|---|
| URL | https://github.com/aibraincoach/varkly/pull/20 |
| Title | chore: remove Playwright and fix cross-tab theme sync |
| State | **OPEN** (not merged) |
| Base OID at open | `675f8bb0fc49a9cb517e1af4daf54337db7a9240` |
| Head OID | `017e195baa11061b45d8b217408167808698161f` |
| Merge commit | none |
| Vercel status on PR | SUCCESS (preview) at last check |

**On the PR branch (not on `main`):**

- Deletes `playwright.config.ts`, entire `e2e/`, `tsconfig.e2e.json`
- Removes `@playwright/test`, `test:e2e`, e2e typecheck step, ESLint/gitignore Playwright report ignores
- Updates AGENTS/README/planning/tasks language: browser behavior verified manually; no automated E2E suite
- Rewrites `ThemeProvider` to persist only on explicit toggle and to listen for `localStorage` theme-key / clear events without write-back

**Automated verification claimed on the PR** (coder report in PR body; not re-run in this docs session): lint/typecheck/test/build/measure/diff-check clean; **147 Vitest + 9 Node = 156/156**.

### Manual browser confirmation — NOT DONE

PR body explicitly leaves unchecked:

- toggle + reload persistence
- two-tab same-origin sync both ways without reload/refocus
- unrelated storage writes do not change theme

Coder reported Claude-in-Chrome unavailable. **As of this writeup: the cross-tab theme fix is not verified in a real browser. Do not assume it works. Do not report PR #20 merge-ready on product grounds until those three checks pass.**

**On `main` today:** Playwright **still present**; theme provider **still** uses preference-persistence `useEffect` with **no** storage listener.

---

## 8. Process failures on record (`WALL_OF_STUPID.md`)

Read the full file. Entries relevant to the outgoing PM tenure include (non-exhaustive; headings as in file):

- Self-verification / direct tool access instead of coder dispatch (earlier tenure)
- Non-dispatchable Wall of Stupid entries
- Hedged / soft merge-authorization language (proximate firing cause in an earlier session — see file)
- Stating unverified SHAs as fact (`2026-09-08 (stating unverified SHAs as fact)`)
- Padding a yes/no with commentary (`2026-09-10 (yes plus commentary)` — already on `main` at `a13aa55`)
- Unverified product/UX claim (`2026-09-10 (unverified product claim)` — appended in the same docs pass as this handover)

**Standing rules distilled for the new PM:**

- Closed-form questions get closed-form answers (yes/no, numbered choice) first; commentary only after, on a separate line, if needed.
- Never state SHAs / heads / repo state as personal fact without live verification capability — relay “as last reported by X at time T.”
- Do not invent product/UX doctrine without reading `PRD.md`, `COPY.md`, and source. This quiz is **multi-select** (`Select all that apply`); Next means “done selecting,” not single-choice indecision.
- Merge authority is a PM call under `AGENTS.md`, but **do not merge PR #20** until the owner’s manual Chrome checks for theme sync are actually done (or the owner explicitly waives them).

---

## 9. Current repo state (writeup time)

Rechecked against GitHub during this document’s authoring session:

| Item | Value |
|---|---|
| Live `origin/main` tip (before this docs commit) | `a13aa55979096da6cb7128fe1f82d8fc7eafb401` — `docs: record yes-plus-commentary failure on Wall of Stupid [skip ci]` |
| Open PRs | **PR #20 only** (OPEN) |
| Playwright on `main` | **still installed** (`package.json` has `@playwright/test` `1.63.0`, `test:e2e`, `e2e/` tree present) |
| Theme sync fix on `main` | **absent** |
| PR #20 core fix (#15 findings / cross-tab theme) | **not confirmed working in a real browser** |

After this handover docs commit lands, `main` tip will move forward; re-read `git rev-parse origin/main` rather than trusting any SHA pasted into chat.

### Immediate open work for the new PM

1. Owner/Chrome: run the three PR #20 manual theme checks (or explicitly waive).
2. Only then: merge PR #20 (base `aibraincoach/varkly` `main`), confirm Vercel, confirm Playwright gone from default branch.
3. Do **not** reopen the cancelled 19-item findings list without new owner authorization.
4. Remaining real open product items still in `tasks.md` (examples): live prompt wording validation vs ChatGPT/Claude/Gemini; custom domain; GA `/r/` path privacy decision; npm audit review — none of these were in the two-item cut.

### Canonical reading order for the new PM

1. This file  
2. `WALL_OF_STUPID.md`  
3. `AGENTS.md` + `CI_POLICY.md`  
4. `planning.md` §12 (kept current by this pass)  
5. `tasks.md` Session Log from 2026-09-08 forward  
6. Open PR #20 diff / body  

---

## Affidavit note (outgoing PM — process, not product)

Owner interview excerpt (paraphrase of the recorded charge): the outgoing PM escalated into the owner’s boardroom to insist three items would not merge until actually checked. That insistence matches the standing rule against unverified claims and against merging without evidence. The firing record for *other* process failures is in `WALL_OF_STUPID.md`; this note does not convert the affidavit into a merge block by itself — the merge block for PR #20 is the **unchecked manual Chrome verification** documented on the PR.
