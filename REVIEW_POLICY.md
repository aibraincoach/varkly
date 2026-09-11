# Review execution policy — project-local authority

Effective 2026-09-11 under the owner-approved remediation. This is an update to existing review procedures, not a new review obligation.

## Existing routes

AGENTS.md requires both AGY and PPLX before merge: preserve each route once. AGY is not merely a fallback in this repository. Both require grounded captures and independent PM triage.

## Review ceiling and quota

An unchanged head receives at most one grounded review per required review route. Additional review on the same route requires a documented unresolved question.

If a workflow already requires external review, material code changes invalidate that review receipt and require review of the changed head. This creates no review requirement where none exists.

No clean counters, confidence targets, automatic reruns, compulsory review concurrency or retrospective AGY debt after an accepted alternative. Preserve reviewer independence, source-based triage, existing exemptions, independent routes and product verification. One route review normally has one invocation; necessary predeclared source packets form one coverage set, with actual invocation counts recorded. A final checkpoint reuses valid same-route coverage where applicable. Evidence-only receipts require a delta check, not another model call by default.

Quota exhaustion means STOP the affected route, including provider errors returned with exit code zero. Preserve exact diagnostics and timestamps. No automatic retries, waiting, account/model switches, paid fallback or upgrades. A permitted alternative is a documented PM routing decision; it never waives an independently required route.

## Local procedures and model authority

Use the currently approved AGY model resolved by [config/agy-review-policy.json](config/agy-review-policy.json) and [the local AGY procedure](docs/agy-review-procedure.md). The policy prefers eligible Gemini Pro over Flash and always requires High reasoning. No global settings file, sibling repository or external document is authoritative.

PPLX capability: Claude Code with Claude in Chrome is approved; Cursor cannot perform PPLX; Codex is observed/unproven and not the approved default. Complete operation and owned-tab cleanup live in [the local PPLX procedure](docs/pplx-review-procedure.md).

In the live Perplexity picker, use the newest eligible Gemini model under the existing project convention; prefer Pro when eligible, otherwise Flash. Do not use the retired 3.1 generation. Record the actual picker selection; do not infer AGY availability from the PPLX catalog.

## Project obligations retained

- Keep actual diff grounding, exact reviewed-head provenance, PM triage and both existing independent routes.

Keep canonical attempts, raw captures, packet progress, model/invocation evidence and separate triage in project-owned common Git metadata. Redacted durable exports belong in this project's docs/reviews convention and authorized GitHub receipts, never an external personal folder. Existing filename prefixes may remain within that local convention. Never delete captures automatically after merge. Linked worktrees share local state; disconnected sandboxes require PM dispatch ownership and receipt reconciliation. Missing local state is not proof that no previous review ran.

## Remediation execution boundary

The PM authorizes this remediation's corrections, publication and merges. RT is the owner/CEO and is not a routine engineering approval gate. This does not authorize unrelated coder work or waive independently applicable review/product gates.

Work sequentially in fresh isolated worktrees; reconcile current main before editing. Leave active coder checkouts, processes and tabs untouched. Classify duplicate/stale copies without deleting or consolidating them. Static inspection and narrowly targeted offline fixtures only: no installs, builds, full suites, browser suites, databases or substantial local compute. Record expensive verification as unverified. AGY/PPLX are expressly authorized for defined review questions and existing required routes; no repeat calls to accumulate clean verdicts.

Verify build suppression passively from existing configuration/provider state before publication. Do not trigger a build, deployment, preview or other metered execution merely to test suppression. If suppression cannot be established without execution, publication is blocked. Prepared local work is not delivered work; report corrected/reviewed/pushed/merged/held separately.

## Historical evidence

Earlier replaced instructions are preserved under docs/review-policy-history/. They are provenance, never live model selection, retry, capture-path or browser instructions. Existing incident entries and historical receipts remain intact; append corrections rather than rewrite them. Do not create or restore a central repository/runbook dependency, personal-folder export or symlink.
