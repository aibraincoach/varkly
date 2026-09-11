# AGY review procedure — project-local authority

Read the root REVIEW_POLICY.md for this project's existing review routes and exemptions. This procedure creates no new external-review requirement. The local config/agy-review-policy.json is the model-selection authority; scripts/agy-review.py implements it. Python 3 (standard library), Git and an authenticated `agy` on PATH are prerequisites. Missing prerequisites block dispatch; do not install, upgrade or consult another project's files automatically.

## Model selection

Immediately before an already-needed AGY review, the controller reads the actual tab-separated `agy models` catalog. It ignores unrelated model families, checks Gemini slug/label agreement and orders versions numerically. Prefer the newest eligible Pro High; otherwise the newest eligible Flash High. Versions through 3.1 are retired from this owner's review workflow even if the provider lists them. Both the High slug and explicit `--effort high` are required. There is no global-settings, historical-document, Medium/Low or quota-triggered model fallback. The current slug belongs in the invocation receipt, not in copied canon. A model release alone never creates review debt.

## Grounded packet and dispatch

The PM designates one dispatch owner for the exact repository/head/route and checks existing receipts/active assignments before a call. A missing local state file is not proof that a disconnected sandbox has never reviewed the head. If ownership or prior attempts cannot be established, coordinate with the PM instead of dispatching. No owner/RT approval step is added.

Inspect the exact committed head, base and stack. Include complete bounded source/diff context, changed paths and enough surrounding code to substantiate findings. Packets must be UTF-8 and under 150,000 bytes, with these exact markers:

```text
REVIEW_HEAD=<full committed head SHA>
REVIEW_SCOPE=<specific source coverage and any unresolved integration question>
<exact committed source/diff, relevant context, full base SHA and repo identity>
END_REVIEW_PACKET=<same full head SHA>
```

Normally one packet covers one route review. If a real size limit requires splitting, plan all non-overlapping source coverage and any distinct integration question before dispatch. One review set can contain multiple physical invocations; record the actual call count. Changing packet names or review lenses cannot justify repeating unchanged coverage.

Create a local dispatch record naming the PM decision, exact scope, assigned owner and reconciliation of existing receipts. Then, from this repository (replace placeholders):

```sh
python3 scripts/agy-review.py plan --head <SHA> --base <BASE_SHA> --pr <PR-number-or-unpublished-branch> --owner <dispatch-owner> --dispatch <local-dispatch-record> --packet <packet-file>
python3 scripts/agy-review.py status
python3 scripts/agy-review.py run --id <returned-set-id> --packet 1
```

For a split set, pass `--packet` once per planned packet. For a second set on the same head/route, `--question` must name a substantive unresolved question; it never overrides an unfinished reservation. Retrospective work additionally requires an explicit PR/head allowlist and unresolved question; accepted alternative review creates no retroactive AGY debt.

The controller resolves the project/common Git directory before spawning AGY. Canonical manifests, attempts, raw stdout/stderr, catalog, invocation log and receipt metadata are stored under the common Git directory's `review-state/`, with restricted permissions; linked worktrees share these records. Raw captures survive temporary worktree removal. The parent captures output; AGY runs in a separate empty directory using a supplied inline packet, sandbox restrictions and disabled skill expansion, without `--add-dir`, agent continuation or permission bypass. Never attach a live coder checkout. Do not add `--mode plan` alongside `--disable-slash-commands`: the CLI warns that mode is ineffective in that combination. Prompts/mode alone are not a filesystem security boundary. If actual isolation cannot be established, stop rather than grant broader access.

## Capture and source-based triage

A zero exit code, introduction, refusal, pending output, quota message or LGTM label is not a review. The controller requires a successful structured response, then marks it **received**, never automatically approved. Inspect all output and provider diagnostics. Record the actual chosen model, effort, catalog/invocation evidence, full head/base, packet hashes and scope. Model self-identification alone is not proof of selection.

For grounding, require a verbatim source quotation absent from PR title/body plus real paths/symbols traceable to the supplied exact source. Preserve stricter project requirements in REVIEW_POLICY.md. Independently disposition every finding with source evidence: fix, refute or explicitly accept/defer under existing project rules. Review is not runtime/product proof.

```sh
python3 scripts/agy-review.py triage --id <set-id> --packet 1 --disposition accepted --evidence <local-source-triage-record>
```

Use `needs-fix` or `ungrounded` when applicable. Prior packets require accepted triage before the next dispatch. A full accepted receipt exists only when all declared coverage is accepted. Preserve raw evidence and separate triage; export redacted copies to this project's docs/reviews convention and authorized PR receipt location, record their hashes, and read back posted content. Never publish credentials or protected customer/member data. No iCloud destination exists.

Evidence-only receipt commits may retain coverage only with an explicit source/base/stack delta check linking the actually reviewed SHA to the current head; do not claim the newer SHA was reviewed when it was not. Material changes invalidate affected review coverage where external review already applies.

## Quota, failure and recovery

Quota exhaustion is a hard stop for that route, including provider errors returned with exit code zero. Preserve the exact error, observation time and any reset diagnostic. No automatic retry, waiting loop, model/account change, paid fallback or quota upgrade. Other independent required routes remain required; a permitted alternative is a PM routing decision, never an automatic bypass.

Interrupted, failed and ungrounded attempts remain durable and block automatic repetition. Recovery is distinct from another review after an accepted receipt: document the failure diagnosis, evidence resolving it and original coverage still missing. Do not invent a code finding from an absent response. A PM disposition may be recorded with:

```sh
python3 scripts/agy-review.py resolve-quota --route agy --reason <current-passive-resolution> --evidence <local-evidence-record>
python3 scripts/agy-review.py resolve-attempt --id <set-id> --packet <number> --decision resume --reason <diagnosis-and-missing-coverage> --evidence <local-PM-disposition>
```

These operations record transitions without calling a reviewer. They preserve earlier attempts/captures; they do not auto-delete stop markers or assume an old reset estimate proves present availability. `abandon` explicitly closes failed or unstarted scope without erasing its history. A still-running recorded owner cannot be interrupted by recovery. Resume only missing packets, never completed coverage. Shared-account quota failures must also be reported to the other responsible PMs through an authorized coordination channel; this project-local ledger does not claim fleet-wide mutual exclusion.

## Verification scope

Run `python3 scripts/test-agy-review.py` for offline fixtures with fake AGY, or syntax/static checks. This policy remediation authorizes no builds, installs, full suites, browser suites, databases or substantial local compute. Existing application verification obligations are unchanged. Publication requires passive build-suppression evidence; a blocked publication stays local and is reported accurately.
