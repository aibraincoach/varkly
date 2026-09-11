# PPLX review procedure — project-local Claude Code runbook

Read root REVIEW_POLICY.md for existing route obligations, project-specific model conventions, grounding and privacy requirements. This procedure adds no PPLX obligation. Claude Code with Claude in Chrome is the approved harness. Cursor cannot perform PPLX merely because it has Sonnet or Playwright. Codex is observed/unproven and is not the approved default. Missing harness/account/connector access is a recorded blocked prerequisite, never a request for the owner to operate the browser.

## Prepare and reserve

Use the actual Claude Code harness with its connected Claude in Chrome extension. Verify capability without opening or altering user tabs. Resolve the exact PR URL, repository, full head/base and any sibling-stack scope. Confirm the PM-assigned dispatch owner and existing receipts; no disconnected sandbox may assume missing local files mean a review never ran.

Prepare a project-local scope packet and dispatch record using the AGY procedure's marker format, but declare route PPLX. This ledger packet is local provenance: it is not pasted into Perplexity. Reserve before opening the review tab:

```sh
python3 scripts/agy-review.py plan --route pplx --head <SHA> --base <BASE_SHA> --pr <PR> --owner <Claude-Code-owner> --dispatch <local-dispatch-record> --packet <local-scope-packet>
python3 scripts/agy-review.py begin --id <set-id>
```

Keep the returned attempt ID. An existing accepted receipt, unfinished attempt or quota stop requires inspection and the documented per-route question/recovery process; it is not permission to start a fresh tab/review automatically.

## Own exactly the review tab

1. Create a dedicated tab for this attempt and immediately persist its returned tab ID, attempt ID and URL in a local ownership record. Never reuse a user-owned tab or infer ownership from its title. Do not create a browser window or alter window-wide settings.
2. Open Perplexity in that tab, verify the signed-in account and enable Perplexity's own Incognito mode where required. Confirm the project's approved model in the actual picker and record the visible selection. Do not guess a missing label or substitute models automatically after quota exhaustion.
3. Submit the project's PR-URL request, normally exactly `code review <GitHub PR URL>`. Preserve the project's permitted sibling-context convention. Verify the full input before submission. Never paste private diffs or add grounding follow-up prompts where the existing project prohibits them.
4. Wait for the actual completed answer. Do not submit again because a response is pending. A quota/error/refusal or inaccessible private PR is not a grounded review. Capture the complete visible response and metadata, including model, requested full head/base, URL, timestamps and owned tab ID.
5. Verify grounding against exact source: a verbatim source quotation absent from title/body and actual changed paths/symbols. A private-repo claim, plausible summary or LGTM is insufficient. Apply any explicit grounding alternative in REVIEW_POLICY.md; otherwise preserve stricter whole-line requirements. Independently triage findings against source; never let the reviewer approve or merge its own result.
6. Save raw capture and separate triage inside project-owned common Git review state. Read the saved capture back before closing the tab. Export redacted copies under this project's docs/reviews convention; post full captures/triage where the existing workflow requires and publication is authorized, then read back the posted content. Record failures rather than claiming delivery.
7. In a cleanup/finally step on success, failure or interruption, close **only the recorded owned tab** after preserving available evidence. Never close the browser/window or other tabs. Persist cleanup status. After a crash, recover from the ownership record and confirm tab ID and URL still identify the owned review before closing it; if ambiguous, leave it and record the unresolved cleanup. No blanket close-all operation.

## Record outcome and recover without churn

```sh
python3 scripts/agy-review.py record --id <set-id> --attempt <attempt-id> --capture <local-raw-capture> --status received
python3 scripts/agy-review.py triage --id <set-id> --disposition accepted --evidence <local-source-triage>
```

Use `failed` or `quota` for those outcomes; `received` means capture available, not approval. Use `needs-fix` or `ungrounded` for failed triage. If the harness crashes before recording, the reserved attempt remains blocking until PM inspection. Quota exhaustion stops PPLX; no retry loop, paid fallback, account/model switch or polling. A failed capture does not authorize automatic redispatch. Use the local controller's documented recovery operations with a specific diagnosis, missing coverage and PM evidence. A second grounded review on the same route/head requires a documented unresolved question.

Material code changes invalidate required coverage; evidence-only updates require an explicit delta check. Preserve existing independent routes and product acceptance requirements. Do not impose a dual gate on an either/or project or collapse an already required dual gate.
