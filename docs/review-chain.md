# Review chain — actors, mechanisms, and handoffs

[REVIEW_POLICY.md](../REVIEW_POLICY.md) governs the existing dual routes. Both AGY and PPLX are required once each with grounded captures and independent PM triage; neither substitutes for the other. Every reviewer remains read-only and reports what cannot be verified from supplied source as unproven. There is no required ordering among independent reviewers or bots.

Manual verification is separate from and not satisfied by AGY/PPLX: any PR-specific manual browser check the PM instructs must run against the deployed preview, with pass/fail results recorded on the PR before merge. This preserves an existing requirement; it does not order a preview or browser check for every policy-only change.

| Actor | Mechanism and handoff |
| --- | --- |
| PM | Names the PR/head, route, bounded scope and any unresolved question; independently triages the grounded findings and makes merge decisions. RT is not the review operator or routine merge gate. |
| AGY operator | Uses the local [AGY procedure](agy-review-procedure.md) and controller, which selects the eligible High model from the live catalog and saves raw capture and durable attempt state. The operator posts the capture and source-grounded triage to the PR; AGY does not post it. |
| Claude Code with Claude in Chrome | Approved PPLX harness. Follows the local [PPLX procedure](pplx-review-procedure.md), captures the completed response, closes only its owned tab, and posts the receipt with exact-head evidence. |
| Cursor / Codex | Cursor cannot perform PPLX; Codex capability is observed but unproven. Use an existing approved route or route PPLX to the approved harness; never route browser operation to RT. |
| Cursor Bugbot | A distinct reviewer; its ability to post automatically remains unverified in this project. It is not PPLX. |
| GitHub PR bot | A distinct configured service that may post its own comments. Its availability is observed, not assumed, and it is not PPLX. |

Use [resolved procedure conflicts](review-procedure-conflicts.md) for precedence. Original actor/version/capture-path instructions remain [historical provenance](review-policy-history/2026-09-11/docs/review-chain.md), not current dispatch authority. No external folder is required.
