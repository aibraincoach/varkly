# Current review routes and resolved procedure conflicts

This repository requires both AGY and PPLX before merge: preserve each route once. AGY is not merely a fallback in this repository. Both require grounded captures and independent PM triage.

Manual verification is separate from and not satisfied by AGY/PPLX: any PR-specific manual browser check the PM instructs must run against the deployed preview, with pass/fail results recorded on the PR before merge. This preserves an existing requirement; it does not order a preview or browser check for every policy-only change.

Read [REVIEW_POLICY.md](../REVIEW_POLICY.md), [AGY](agy-review-procedure.md) and [PPLX](pplx-review-procedure.md). These are complete project-local procedures. No external runbook or old model example is current authority. Old conflicting instructions remain historical provenance under review-policy-history/.
