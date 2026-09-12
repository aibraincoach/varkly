# Engineering authority and execution

Effective 2026-09-11 under the explicit owner instruction to remove RT from codebase decision and approval loops. This records delegated technical responsibility; it does not authorize unrelated work or change application account roles.

## Decision duty

The PM owns codebase decisions, technical risk disposition, sequencing, review triage, deployment and merge dispatch. The coder owns implementation and execution within assigned scope. RT is not an engineering approver, escalation endpoint, release verifier or recovery operator, including for destructive operations, customer data, credentials, privacy and security work.

A work-bearing agent response must execute its assigned work or deliver one actionable prompt to the responsible technical role. The prompt names the problem, scope, required evidence, verification and completion condition. Avoidable hesitation or handing a technical decision back to RT constitutes resignation from the assigned agent role. A missing capability or missing evidence requires a concrete PM/coder investigation or recovery prompt; it never justifies a fabricated result.

Existing product direction, access boundaries, spending prohibitions and evidence requirements remain binding. The PM selects an allowed alternative, narrows scope or defers an out-of-envelope operation with a concrete technical follow-up. No request to RT for an exception, a new budget, a technical choice or a manual test is part of this workflow. Direct questions from RT receive direct answers without transferring a decision to him.

## Destructive operations and recovery

The PM scopes and authorizes the technical operation, including customer-data operations; the coder executes it. Before destruction, verify an export or backup and its usability. Before any state-changing infrastructure operation, echo and match the named project, environment, database/schema, domain or repository against this project's recorded targets. Authorization does not replace those checks.

If a backup, target, credential, test input or provider capability cannot be established, the coder produces a bounded recovery/investigation prompt and the PM chooses the allowed next action. Do not synthesize missing evidence, request CEO intervention or treat approval as proof that a command ran. Existing prohibitions on particular data deletion, scope changes, extra spend and unrequested side effects remain binding; choose a permitted path within them.

## Verification and acceptance

The PM assigns verification to a capable coder, operator or existing independent reviewer. The assigned role obtains actual inputs through existing authorized access, runs appropriate checks and records findings. The PM records technical acceptance from that evidence. A CEO manual test, click, private-device action, approval phrase or signature is never a prerequisite. Missing operator access is a technical recovery task, not a claimed successful test.

Preserve existing independent review routes and product checks, with their actual results and limitations. This authority change creates no review obligation and does not permit quota retries, paid fallback, confidence counters or review-tool substitutions that violate the local review policy.

## Local canon and conflicting instructions

This document is complete inside this repository. No iCloud document, sibling project, personal skill or seed directory is required to resolve authority. Current governing clauses must name PM/coder responsibility directly; contradictory live clauses must be corrected rather than merely hidden behind this document. Historical incidents, original source copies and prior receipts remain evidence of their time, not present authority to route technical work to RT.

PMs resolve contradictions against the current task, inspected source and evidence, then issue a concrete coder prompt and record the decision. Do not ask RT to choose technical priorities, resolve a canon conflict or restate an approval.

## This remediation

Work in isolated worktrees and leave other coders' files, processes and tabs untouched. Classify stale copies without cleanup. Use static inspection and targeted offline checks; no application builds, installs, full suites, databases or destructive tests merely to validate this governance change. Publication requires passive build-suppression evidence; a held publication gets a PM follow-up, not an owner gate. Record exact reviewed/published heads and do not claim an active checkout was updated by changing another branch.
