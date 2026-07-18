# PalmPay Design Hub — Functional Completeness Audit

Last updated: 2026-07-18

## Purpose and delivery order

This document is the execution baseline for the user's latest delivery decision:

> Complete and externally verify the desktop functional workflow first. Restore desktop Web visual parity second. Perform mobile adaptation last.

Pixel-level visual remediation, mobile-specific layouts and the unresolved workspace navigation-performance issue are explicitly outside this functional remediation pass. They must not prevent a missing P0 workflow from being identified or completed.

## Evidence rules

Status labels:

- **Implemented** — the formal UI and protected API path exist, and the repository has code-level or integration-test evidence.
- **Partial** — a route or API exists, but a required P0 field, action, validation rule or user-facing path is absent.
- **External verification required** — implementation exists but has not been demonstrated in the deployed test environment through the appropriate user role.
- **Deferred** — intentionally outside the current functional pass.

The audit reviewed the formal web routes, server actions, NestJS controllers/services and the PostgreSQL integration tests. Local integration evidence does not substitute for an external browser workflow.

## Functional matrix

| P0 area | Current status | Evidence / functional gap |
| --- | --- | --- |
| Test login, users, teams and RBAC | Implemented; external verification required | Test-mode signed session, disabled-user checks and three bootstrap identities exist. Enterprise SSO/OIDC is a production prerequisite, not a test-environment blocker. |
| Permission-aware navigation and protected routes | Implemented; external verification required | Workspace navigation filters modules by permission; API guards remain authoritative. |
| Four content catalogs and detail pages | Implemented; external verification required | Design assets, Skills, cases and projects read persisted PostgreSQL content through permission-filtered APIs. |
| Search, favorites, recent views, Prompt copy, usage confirmation and relations | Implemented; external verification required | Formal APIs and routes exist. Search/favorite/usage persistence has integration evidence. |
| Catalog filtering | Partial | Asset and project client filters exist and global search supports server filters, but category/tag/status filtering is not consistently exposed or URL-backed across all four catalog surfaces. |
| Share link | Missing | PRD requires a share-link action. There is an event type for `content_share`, but no user-facing copy/share action in formal detail pages. |
| Draft creation, autosave, versioning and published-content edit draft | Implemented; external verification required | Four content types use the draft API and server actions; published edits create a separate draft version. |
| Four content-type creation forms and completeness gate | Partial | Each type has an editor, but the forms do not collect all P0 structured fields and the server does not enforce type-specific completeness before review/publish. Examples: Skill examples/limitations/security, Asset unsuitable scenarios/resources, Case sample/metric/relations and Project stage/risk/evaluation are incomplete. |
| Author-facing content preview | Partial | Reviewers can preview submitted body data, but the contributor has no dedicated pre-submit rendered preview of the formal detail presentation. |
| R2 attachment upload, checksum and draft binding | Implemented; external verification required | Signed upload, completion verification and draft attachment binding exist. |
| Published attachment download | Missing user path | The protected API can create short-lived download URLs, but formal published detail pages show an attachment count only; they do not render downloadable attachments. |
| Submit, assign reviewer, compare versions, approve, request changes, comment, publish, unpublish and archive | Implemented; external verification required | Formal server actions and protected API transitions exist; local PostgreSQL integration covers independent contributor/reviewer/admin lifecycle behaviour. |
| Notifications and My Submissions | Implemented; external verification required | Persistent notification APIs, read actions and personal submission views exist. |
| Management centre: content, taxonomy, teams, users, roles, audit and platform settings | Implemented; external verification required | Protected administration APIs and UI actions exist. Tab responsiveness is a separate deferred performance defect. |
| Value overview and data insights | Implemented; external verification required | Pages read formal analytics APIs; their meaning and rendered data need test-environment acceptance. |
| Browser-side E2E evidence for all three roles | Missing | No completed deployed-browser record yet proves upload → review → publication across the three fixed acceptance identities. |
| Workspace menu/tab performance | Deferred | User paused this after the current implementation did not meet perceived responsiveness. It remains open and is not counted as fixed. |

## Functional remediation backlog

The following items are the next implementation work. They are ordered by the core governance loop, not by visual polish.

1. **F-01 — Complete structured four-type editor contracts and server-side completeness rules.** Add the missing P0 fields to each editor, validate them in the draft/review/publish path and show specific missing-field feedback. A Skill cannot become publishable without its required input/output, human review, test example, scope and limitations.
2. **F-02 — Render protected attachment download controls on published detail pages.** Use the existing signed-download endpoint; do not expose R2 objects or credentials publicly.
3. **F-03 — Add a canonical share-link action.** Copy the current formal detail URL and record the existing `content_share` event without making restricted content publicly accessible.
4. **F-04 — Normalize catalog filters.** Expose category, tag and applicable status filters as URL-backed, permission-filtered controls for all four catalogs. Preserve filters on refresh and direct links.
5. **F-05 — Add contributor preview before review submission.** Render the draft in the same formal content-detail structure, with a clear draft banner; it must not expose unpublished content to unauthorized users.
6. **F-06 — Add a deployed test-environment browser acceptance script and execute it.** Validate the fixed contributor, reviewer and administrator accounts against the public Vercel/Render/R2 environment, including file upload/download and lifecycle cleanup.

## Functional acceptance gate

The functional pass is complete only when the following deployed path has evidence:

1. `lomi2025@126.com` logs in, finds content, favorites it, confirms usage, creates each required content type, uploads an attachment, previews it and submits it.
2. `lomi2024@126.com` receives/opens the review, assigns or accepts it as allowed, reviews the diff, requests changes, then approves the resubmission.
3. `lomi2026@126.com` publishes the approved version, confirms it is discoverable, verifies attachment download, then performs authorized lifecycle and administration actions.
4. Unauthorized and disabled-user access remains rejected, and audit/notification records are present.

Only after this gate is complete should the project resume desktop v9-1 screenshot parity. Mobile adaptation remains the final UI phase.
