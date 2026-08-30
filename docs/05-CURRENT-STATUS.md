# PalmPay体验设计Hub — Current Project Status

Last Updated: 2026-08-30

## Current Phase

**Stage-one functional closure and release verification are active; desktop visual parity and mobile adaptation remain paused**

## Current Objective

Close the high-priority content-integrity, scoped-RBAC and authentication-recovery gaps found by the 2026-07-31 prelaunch audit, then execute the deployed contributor → reviewer → administrator acceptance flow. Commit `46b988d` on `codex/v1-project-handoff` is the current external-test implementation baseline.

The stage-one correction release atomically projects every approved four-type `ContentVersion.body` into its formal detail table at publication; enforces `content.edit_own`, TEAM-scoped review processing and owner transfer before user disable; records restricted file downloads and blocks deletion of bound files; preserves valid sessions when the test API is cold-starting; and aligns the API Docker runtime with Node 24. On 2026-08-01 Postgres.app was started against the restored `palmpay_design_hub` database, all six Prisma migrations were confirmed current, and the full API suite passed 46/46 with all 14 PostgreSQL E2E checks actually executed (0 failed, 0 skipped). Web tests pass 20/20; typecheck, lint and the 23-page production build plus the notification-count route pass.

The latest governance correction separates reviewer assignment from review processing through a new `review.assign` permission granted only to the platform administrator role. Reviewers retain read access to the authorized pending queue but can approve, request changes or add internal notes only for records assigned to them and only from “待我审核”; the administrator receives the assignment controls and opens the complete pending queue by default.

Contributor review feedback now updates the persisted notification badge through focus-aware, recoverable background synchronization. Notification cards route to the review center, submission status or the related revision editor; change-requested submissions expose the same “按意见修改” path as My Contributions. Dashboard todos now aggregate actionable contributor, assigned-reviewer and unassigned-administrator work with stable deduplication. The data-sensitive Recent Views route is excluded from background warming and refreshes once on re-entry without disabling the global 120-second workspace route cache.

Opening an unread notification now persists it as read before redirecting to its authorized Workspace destination, then revalidates the notification list and shell so the unread badge decreases immediately and disappears at zero. The first-entry Workspace loading presentation has been restored from the temporary top progress strip to the earliest full-page skeleton pattern; routing, caching, prefetch, authorization and data-loading logic are unchanged.

The first P0 pass removes unused global client providers and eager background prefetching of every permission-visible dynamic Workspace route, restores native App Router Link prefetch behavior, and adds a Workspace content loading boundary so the persistent Sidebar and Header remain visible while only the route content changes. Local production-build, typecheck, lint and unit-test verification passes; post-deployment browser profiling and Vercel Speed Insights comparison remain open.

The follow-up P0 incident fix addresses the externally observed `/workspace` page hanging on its content skeleton: the workspace shell now treats notification and project-count badges as optional summaries, and the dashboard streams metrics, recent updates and personal todos behind separate Suspense boundaries with short timeout fallbacks. This prevents one slow Render/API/database summary request from blocking the entire dashboard content area. Moving from Render free hosting to a warm Alibaba Cloud service may reduce cold-start latency, but it is not a substitute for keeping non-critical dashboard data out of the blocking render path.

The local production contribution workflow no longer refreshes an editor route after a successful review submission. Successful submissions replace the editor with `/workspace/submissions`, and direct access to a draft URL that has already entered review is redirected to the same status page instead of falling into the Workspace error boundary. A production-browser check confirmed create → submit → submission-list navigation with the persisted review shown as pending.

The 2026-07-31 external test-login incident was traced to the cold-start path: the Render container repeated database migration, seed, identity bootstrap and all three catalog imports before starting the API, while the Vercel login action aborted after 12 seconds and reported every transport or service failure as invalid credentials. Release commit `4b5f6da` restored a migration-only API startup, kept the test login request alive for the free-instance cold-start window, and distinguished unavailable authentication infrastructure from rejected credentials. Local Web/API typecheck and lint, the Web production build, and the API test suite passed; Vercel reported a successful deployment and the Render health endpoint returned 200. The shared-code verification that existed at that time was superseded by the 2026-08-30 decision below.

By explicit user decision on 2026-08-30, the isolated external-test login no longer asks for or validates the shared test access code. Email-only login still requires a pre-provisioned active database user and issues the same short-lived HMAC-signed session, so disabled-user checks and RBAC remain authoritative; the production OIDC/SSO boundary is unchanged. The login page starts a health request when opened to wake the sleeping Render API and shows connection and form-pending feedback. Commit `7a382cc` was deployed successfully by Vercel. After the original free PostgreSQL instance expired, the attempted paid upgrade was withdrawn and failed without becoming the accepted route. Replacement free PostgreSQL `palmpay-design-hub-test-db-v2` (`dpg-daa41qlg1s2s73c30f1g-a`) and the existing free API were deployed successfully. A one-time idempotent bootstrap applied migrations, restored the organization, roles, permissions and three test users, and imported 33 AI projects, 6 AI Skills, 4 AI cases and 8 design assets. Live API acceptance confirmed HTTP 201 passwordless session creation and HTTP 200 current-user resolution for the active administrator, member and reviewer accounts with the expected roles and permission counts; catalog counts and the P01 v9-1 detail also match the source snapshot. Routine startup has returned to migration-only mode. The replacement free database remains an acceptance-only route and will expire 30 days after creation.

The shared light/dark control state is synchronized with the root shadcn theme class. Token-driven primary buttons now render black-on-white in dark mode and white-on-black in light mode, while active administration tabs, review filters and catalog view toggles expose their selected state correctly. Link-backed buttons use the shadcn `asChild` contract, so their foreground tokens are no longer overridden by global anchor inheritance.

The 2026-08-02 Workspace consistency pass centralizes repeated content-type labels, status labels/tones, page hero metrics and empty states, and moves catalog cards, filters, form controls, dashboards, review/submission flows and administration lists onto the same semantic surface, border and text hierarchy. Five representative dark-mode routes (`/workspace`, `/workspace/insights`, `/workspace/admin`, `/workspace/submit`, `/workspace/ai-skills`) were verified at 1280 px with no horizontal overflow or browser console errors. Web typecheck, lint, 24 tests and the 23-page production build pass. Release commit `8399b96` was successfully deployed by Vercel to the external test web. This changes presentation only; API, RBAC and workflow state logic are unchanged.

The next engineering objective is:

> A route or server action is not accepted merely because it exists. The next gate is a complete, deployed contributor → reviewer → administrator workflow, including real attachment download and P0 content validation. Desktop parity resumes after that gate; mobile adaptation is last.

## Approved Product Baseline

- The deployed final v9-1 website at `https://lomi2026.github.io/palmpay-design-intelligence/` is the only approved legacy code baseline.
- Older v5, v6, v8 and v9 variants are not implementation baselines.
- The deployed v9-1 public home, workspace and module pages are the approved visual, information architecture and interaction reference.
- `legacy/v9-1/` is an archival local snapshot and cannot override or narrow the deployed baseline when it is incomplete.
- v9-1 is not the production architecture.

## Completed

- v9-1 high-fidelity interaction prototype
- Public home and internal workspace product structure
- Core product positioning
- V1.0 product reconstruction blueprint
- V1.0 PRD
- Database ER model
- Frontend / backend development plan
- Design decision consolidation
- AI collaboration rules
- Codex `AGENTS.md`
- Claude `CLAUDE.md`
- pnpm workspace with formal Next.js Web and NestJS API projects
- PostgreSQL 17 development database and applied Prisma initial migration
- Organization, Team, User, Role, Permission and UserRole persistence and APIs
- Seeded system roles, role-permission matrix and default taxonomy
- Isolated development authentication adapter and current-user API
- Backend RBAC, organization isolation and disabled-user enforcement
- Frontend development login, current-user loading, protected workspace and logout
- Lint, strict type checking, integration tests and production builds
- Unified Content / ContentVersion and four content-type detail models
- Tags, file metadata, attachment relations and content relations
- Applied Phase 2 content catalog migration
- Permission-filtered published-content list and detail APIs
- Formal design-asset list, search, empty state and detail pages
- Audited deployed v9-1 source commit `bf39748` and created an idempotent AI-project migration script
- Imported 33 v9-1 AI projects (P01–P26 and S01–S07) into PostgreSQL with formal versions, categories, tags, source traceability and organization-safe visibility
- Created the `PalmPay Experience Design` umbrella team; all imported projects are initially owned by `lomi2026@126.com` per the explicit migration decision
- Formal AI project catalog list and detail pages backed by the permission-filtered API, with v9-1 project-library visual and information hierarchy
- Imported 6 v9-1 AI Skills and 4 v9-1 AI cases into PostgreSQL, retaining source traceability and their original verification states
- Formal AI Skill and AI case catalog list/detail pages backed by the permission-filtered API, using the deployed v9-1 information hierarchy
- Cloudflare R2 S3-compatible attachment adapter, protected upload intents, checksum verification, short-lived download URLs and cleanup endpoints
- Cloudflare R2 configuration guide that keeps the Bucket private and credentials out of source control
- A private Cloudflare R2 Bucket and least-privilege API credentials have been configured and accepted through a live signed-upload smoke test: direct R2 upload, server-side SHA-256 verification, short-lived signed download, content comparison and cleanup all pass. The R2 adapter was corrected to use Cloudflare-compatible `Content-Type`-only presigned uploads while retaining server-side streamed checksum verification before a file becomes `READY`; the private Bucket CORS policy also passed a `http://localhost:3000` browser-origin `PUT` preflight.
- Verified signed local-development attachment storage: upload intent, size and checksum validation, short-lived download and cleanup; files remain outside the repository on the current Mac
- Phase 3 draft API foundation: explicit team selection, draft creation, autosave, draft recovery and per-content version history, with organization and owner-or-`content.edit_all` enforcement
- v9-1-aligned workspace entry for 提交内容: content-type selector, four dedicated type-specific draft forms and shared draft editor shell backed by server actions and formal APIs
- Review workflow data migration and protected APIs for submit, reviewer assignment, approval and request-changes; the permission-gated review center supports queue, reviewer assignment and decisions, and the draft editor can submit a draft for review
- Draft attachment binding and editor controls: files are uploaded, checksum-verified, then bound to a draft version; only ready organization-scoped files that the editor can manage are restored with a draft
- Published-content editing now creates or resumes a separate editable draft version based on the immutable current published version; autosave and review of that draft never mutate or hide the published catalog version
- Approved draft versions can now be published only by `content.publish` users; the operation atomically promotes the approved version to `currentVersion`, clears the draft pointer and retains the prior published version as immutable history
- Reviewers can load a permission-gated structured comparison between a submitted version and its base version, including title, summary, structured body and attachment changes
- Permission-controlled unpublish and archive operations are available from each published content detail page; active draft, review and approved versions block lifecycle changes
- Review center now supports content preview, internal reviewer notes, traceable assignment/decision history and the required pending/handled/overdue filters; contributors have a dedicated My Submissions view
- In-app review notifications are persisted through a Prisma migration and sent on submission, assignment and decisions; users can retrieve and mark their own notifications as read
- The workspace notification badge now reads the current user’s persisted unread count rather than a static value; the notification center supports single-item and bulk read acknowledgement through the formal API.
- The workspace shell now derives the displayed role and AI-project count from the authenticated user and permission-filtered API data; it no longer uses a static member label or fixed project total.
- The workspace search affordance now supports the deployed `⌘/Ctrl + K` shortcut and opens the formal permission-filtered search page.
- Draft editor now debounces field changes into server-side autosave and exposes saving, saved and failure feedback
- Created `docs/09-V9-1-PARITY-INVENTORY.md` to track the mandatory deployed v9-1 page-by-page visual and interaction restoration gate
- v9-1 parity implementation must use shadcn/ui conventions and token-driven variants; custom replacement primitives or arbitrary component behavior changes are not permitted
- API development startup now compiles TypeScript to `dist` and watches that output before restarting Node, avoiding direct runtime loading of Prisma-generated TypeScript files
- Applied and Prisma-recorded the local `review_notifications` migration that was absent from the restored database, then applied and recorded the Phase 4/5 engagement-and-analytics migration; `prisma migrate status` now reports the local schema is up to date.
- Created `docs/10-MACHINE-TRANSFER-HANDOFF.md` with the current dirty-worktree warning, setup sequence, validation commands and next-computer Codex prompt.
- By explicit user decision, the restored `lomi2026@126.com` development identity now also holds the organization-scoped system `admin` role in addition to `member`; all 16 seeded permissions resolve through the formal RBAC model, and the bootstrap assignment is recorded in `audit_logs`.
- The personal contribution surface is now backed by a formal `GET /api/content-drafts` query scoped to the current organization and owner. It lists each owned draft, review version and published item with the correct next action, and an integration assertion confirms that even an administrator does not receive another user's items from this personal endpoint.
- The protected workspace retains a recoverable error boundary. Its former root route-level skeleton boundary was removed because Next.js displayed it on every child-menu navigation; a skeleton is now scoped only to the initial `/workspace` dashboard route group. Other menu destinations keep the current page visible until the prefetched destination is ready, avoiding repeated full-page loading flashes.
- Role-flow acceptance now uses four isolated, temporary PostgreSQL identities: member, reviewer, manager and administrator. The integration suite verifies independent reviewer assignment, request-changes, contributor revision and resubmission, approval, administrator publishing/lifecycle authority, and manager analytics-only access; all temporary test records are removed after execution.
- Phase 5.5 functional-interface acceptance is complete: all implemented formal modules are reachable through permission-aware desktop/mobile navigation or contextual actions; primary controls are functional or explicitly unavailable; dashboard values come from formal APIs; and the core member, reviewer, manager and administrator workflows have automated PostgreSQL evidence.
- Phase 6 local QA has verified Prisma schema/migration status, production builds, 12 PostgreSQL integration checks, security-boundary assertions and authorized runtime smoke paths. During this verification, the restored database was found to be missing the approved design-asset import; the existing idempotent v9-1 import script added the missing 8 assets and the formal catalog now contains 8 assets, 6 Skills, 4 cases and 33 projects.
- A safe external-test authentication adapter now issues short-lived, HMAC-signed bearer sessions only when `AUTH_MODE=test`; it first resolves the active database user and therefore preserves formal disabled-user and RBAC enforcement. In test mode, a forged development identity header is rejected. The adapter is explicitly excluded from the future production OIDC/SSO path.
- Test-environment deployment configuration is prepared for Vercel (web), Render free Docker API and isolated free PostgreSQL, and the existing private Cloudflare R2 test Bucket. A test-only idempotent bootstrap command creates the configured team plus the fixed contributor, reviewer and administrator identities with organization-scoped roles before the approved v9-1 catalog imports. The original Railway route was blocked by the account's exhausted free resource-creation quota and is retained only as a future paid-hosting fallback.
- The Render Blueprint has created the isolated PostgreSQL 17 test database and deployed the `palmpay-design-hub-api-test` API. Its public health check at `/api/health` returns `{"status":"ok"}` after the production-startup safeguard was corrected for the explicitly supported `AUTH_MODE=test` deployment path.
- The public Vercel test web at `https://palmpay-design-intelligence-web.vercel.app` is deployed from `apps/web` on `codex/v1-project-handoff`. Render `WEB_ORIGIN` and the private R2 test Bucket CORS policy both allow that exact HTTPS origin. The free Render plan does not offer a Shell, so the Docker test-only startup path now runs the idempotent database migration, seed, test-admin bootstrap and approved v9-1 imports automatically. A remote test-session request for `lomi2026@126.com` now returns `201`.
- The idempotent test-environment bootstrap now maintains three active acceptance identities in the PalmPay Experience Design team: `lomi2026@126.com` (`member`, `manager`, `admin`), `lomi2025@126.com` (`member`) and `lomi2024@126.com` (`reviewer`). This lets the externally deployed test environment exercise contributor, reviewer and administrator separation after every redeploy.

## Validated Product Modules

- 公开首页
- 工作台
- 价值总览
- 设计资产
- AI Skill
- AI 项目库
- AI 案例
- 提交内容
- 我的贡献
- 我的提交
- 审核中心
- 数据洞察
- 管理中心
- 演示模式
- 全局搜索

## Known Legacy Limitations

- Static or compiled frontend structure
- Business data embedded in frontend
- localStorage used for part of user / favorite / submission / review simulation
- Simulated roles
- No formal enterprise authentication
- No formal PostgreSQL business database
- No real file storage
- No durable review history
- No formal audit log
- Analytics contains demo-oriented logic
- AI Skill mainly supports viewing and Prompt copy
- AI projects are exploration content, not formal pilot workflow

## In Progress

- F-01 local implementation is complete: the four dedicated editors persist the full P0 version snapshots, and publication now atomically upserts the approved snapshot into `AssetDetail`, `SkillDetail`, `CaseDetail` or `AIProjectDetail`. Draft/autosave changes cannot mutate the current published detail, and second publication updates the same formal detail row. External test-environment browser and PostgreSQL E2E verification remain required before F-01 is accepted as deployed.
- F-02 local implementation is complete: each formal published detail page renders ready attachments from its immutable current version and requests a short-lived protected download URL only after a user action. The API now records `file_download`, audits restricted downloads and rejects deletion while a file remains bound to any version or workflow record. External R2/browser and PostgreSQL E2E verification remain required before F-02 is accepted as deployed.
- F-03 local implementation is complete: all four formal published detail pages now expose a canonical copy-link action. It copies only the origin plus detail pathname, records the authorized `content_share` event and introduces no public token or visibility bypass; recipients remain subject to the normal content/RBAC checks. External test-environment browser verification remains required before F-03 is accepted as deployed.
- F-04 local implementation is complete: all four formal catalogs share URL-backed `search`, `categoryId`, `tag` and `verificationStatus` filters, which are preserved across refresh, direct links and further submissions. The server applies the verification-status filter only after existing published-content visibility rules; local integration evidence covers a combined category/tag/status query returning only the authorized matching content. External test-environment browser verification remains required before F-04 is accepted as deployed.
- F-05 local implementation is complete: the contributor can save the current draft and open a formal-detail preview before review submission. The preview has an explicit unpublished-draft banner, is served only through the existing owner/content-editor draft authorization path, and is not exposed through public routes, catalogs or search. Local integration evidence confirms author/editor access and reviewer denial. External test-environment browser verification remains required before F-05 is accepted as deployed.
- F-06 browser acceptance remains open. On 2026-07-31 Chrome exposed an existing authenticated tab at `/workspace/favorites`, confirming that the current browser session reaches the protected workspace. Page-structure, screenshot and interaction capture still time out, and one cookie scope cannot prove three independent roles. No acceptance content or files were written. Resume with responsive control plus isolated browser profiles/contexts, then perform the contributor/reviewer/administrator workflow.
- Release commit `46b988d` publishes the stage-one correction pass on `codex/v1-project-handoff`. GitHub reports a successful Vercel deployment; Render returns 200 from `/api/health`, and the new protected `/api/notifications/unread-count` route returns the expected unauthenticated 401. Because Render starts the API only after `prisma migrate deploy`, the successful new-route response also confirms the six-migration startup gate completed. Deployed three-role browser acceptance remains open.
- The user-approved functional-closure audit is complete and recorded in `docs/13-FUNCTIONAL-COMPLETENESS-AUDIT.md`. F-01 through F-05 are locally implemented; active work is deployed browser E2E evidence and external role-workflow verification. Pixel-level visual work and mobile adaptation are paused until this functional gate passes. The workspace menu/tab performance issue remains deferred and is not counted as accepted.

- The management-center tab performance defect has been corrected: each server render loads only its own authorized data (one or two endpoints rather than all eight administration datasets), then the compact finite tab set is full-prefetched into the client router cache for instant tab revisits. Current-user/auth-header reads are request-memoized across the workspace shell and page. A workspace-wide route review found no other query-tab surface that eagerly loads unrelated administration datasets.
- The external-test workspace now keeps recently visited dynamic route segments in the browser for 120 seconds. After the workspace shell becomes interactive, its finite permission-filtered navigation set and the seven management tabs are explicitly warmed through the client router; pointer or keyboard intent also invokes direct route prefetching. This makes ordinary back-and-forth navigation and admin tab revisits use the client cache rather than repeat a Vercel-to-Render read. Large catalog/detail-link sets still do not automatically prefetch all visible records. Server-side RBAC remains enforced whenever a request is required; Render free-instance cold starts remain a hosting limitation.
- The external test environment core is live: Render API/PostgreSQL, Vercel Web, test auth, exact-origin API/R2 CORS, test database initialization and the administrator session have remote evidence. Remaining delivery evidence is the browser acceptance of actual attachment upload, review and publication. Phase 5.5 delivered one permission-aware navigation model across desktop and mobile, route-aware active states, dynamic breadcrumbs, real dashboard data, personal contribution/submission surfaces and explicit unavailable-state behavior for unfinished controls.
- The administration surface is now separated into content, taxonomy, team, user, role-permission, audit and platform-settings modules. Team updates, user status changes and role assignment/removal use the protected formal APIs and retain audit logging; the platform-settings module reports the current environment boundary without presenting unavailable production integrations as active controls.
- Phase 4/5 implementation is in the working tree: the additive Prisma migration introduces persisted favorites, recent views, unified usage events, search logs and audit logs. The API provides permission-filtered PostgreSQL full-text search, search-click/no-result logging, favorites, recent views, real AI-project usage confirmation, content relations, analytics aggregates, taxonomy/content administration and audit-log endpoints. The workspace exposes global search, personal saved/recent pages, usage and relation flows, overview/insights and RBAC-gated administration pages. API strict typecheck, lint, Prisma validation/migration status and twelve PostgreSQL integration tests pass, including separate member/reviewer/manager/admin workflow coverage and input/CORS/file boundary assertions; Web typecheck, lint and production build also pass. The protected workspace correctly redirects to formal development login rather than substituting a static role.
- Phase 3 is verified functionally. The public home, workspace shell, catalog lists, submit/draft flow, notifications, my submissions, review center, login and access-denied pages have been moved onto the v9-1 dark visual language using shadcn/ui primitives while retaining the formal API and RBAC behavior.
- The mandatory v9-1 parity gate is still open: deployed/authenticated desktop first-viewport pairs for the public home, workspace and AI project library were captured on 2026-07-18. Source-informed corrections restored the public header’s constrained desktop container and the AI project portfolio’s overview/suggested-priority layer using real published records. Responsive, project-detail, interaction-state and post-deployment captures still need to be completed before acceptance. Direct deployment checks established that several archived deep links (Design Assets, submit, demo workspace and AI Skill pages) are 404 and therefore are formal-only V1 routes rather than current deployed parity targets. The test R2 Bucket is configured and live-signed-upload validated.
- The formal AI Project detail now uses the deployed project-template information hierarchy while binding every displayed signal to the persisted AIProjectDetail, ContentVersion, owner/team, priority and engagement models. It retains RBAC-gated lifecycle actions instead of copying the legacy static reset/action behavior.
- The formal AI Case detail now uses the deployed verified-practice information hierarchy while binding the before/after comparison, AI and human responsibilities, result and validation evidence to CaseDetail and ContentVersion data. Missing limits are explicitly marked as incomplete rather than presented as verified production evidence.
- The formal Design Asset detail now puts applicability and constraints ahead of implementation detail, while preserving persisted usage guidance, version, maintenance metadata, attachments, related content and engagement actions.
- The formal AI Skill detail now exposes the approved reusable-method model from `SkillDetail`: scope, input/output, Prompt, execution conditions, examples, human review, limitations, version and owner. It does not invent missing examples or limitations. Direct deployment checks confirm that the archived Skill catalog/detail filenames return 404, so these formal pages inherit the deployed workspace system instead of claiming a missing v9-1 counterpart.
- The deployed workspace desktop baseline has been checksum-verified against the matching historical source and compared side by side with an authenticated formal local workspace at `1280 x 720`. The sidebar, top bar, dashboard hero, metric, update and todo layout has received a source-informed correction pass; matching reviewer/admin test identity and the remaining page/state captures are still required for acceptance.
- The workspace Design Assets module uses 8 formally imported, source-traceable v9-1 assets instead of an empty catalog. Its header, filters, card-cover hierarchy and metadata use the deployed workspace component language with shadcn/ui composition. The historical `design-assets.html` URL is 404 on the current deployment, so it is not a separate parity blocker.
- By the latest explicit user direction, v9-1 parity remediation now continues automatically through small page/flow batches. The first resumed batch adds the required domain, value and stage filters to the real AI Project portfolio and aligns its portfolio density with the approved project-library model; the value overview, data-insights and review-center entry surfaces also now use the same high-density workspace hierarchy while retaining their live PostgreSQL metrics and actions. Web typecheck, lint and production build pass after this batch. Browser capture is now available for deployed source/formal comparisons, although the remaining desktop/mobile states and the new code’s post-deployment capture are still open.
- The continuous parity pass now also covers the formal contribution, submission and review flows; AI Skill and AI Case catalog hierarchy; personal saved/recent space; notifications; global search; relationship management; usage confirmation; login/access-denied states; shared content cards; and all administration tabs. The draft editor, attachment binding/removal, review handoff, published-detail actions and recoverable-error states now share the dense workspace hierarchy; the admin panels retain every protected server action while adding consistent operational headers, counts, empty states and responsive panels. Web typecheck, lint and the 23-route production build pass after this batch. Required desktop/mobile source-versus-rendered comparison remains open before visual acceptance.
- The local light/dark theme remediation is complete and recorded in `docs/14-THEME-AUDIT.md`. Theme selection is applied before first paint, the Workspace shell/sidebar/header now use shared semantic tokens, restored v9-1 dark utility tokens receive exact light-mode compatibility mappings, and Dialog/Sheet portals use global shadcn theme tokens. Twenty-five accessible product routes were checked in both themes on a production build, with additional light-mode search-dialog and mobile-sheet evidence. Web/API typecheck, lint and builds pass; API tests report 13 passed, 0 failed and 11 existing integration-environment skips. External Vercel deployment and post-deploy theme sampling remain open.

## Next Task

Codex should:

1. Use three isolated browser profiles/contexts, then execute F-06 contributor/reviewer/administrator evidence including upload, signed download, audit and cleanup.
2. Resume desktop-only v9-1 visual parity only after the functional acceptance gate passes; perform mobile adaptation after desktop acceptance.

## Next Milestone

**P0 functional closure and deployed workflow acceptance; then desktop v9-1 visual parity; then mobile adaptation**

Milestone definition:

- Each page with a deployed v9-1 counterpart matches the approved layout, information hierarchy, wording, density and interaction behavior.
- Screenshot comparison records the verification outcome for every counterpart page.
- Formal data, authentication, RBAC and lifecycle behavior remain intact behind the restored interface.

## Not Started

- Formal content center core catalogs (verified; real attachments remain)
- Cloudflare R2 production object storage (local development storage is verified)
- Full search (verified)
- Favorites persistence (verified)
- Usage confirmation (verified)
- Analytics event pipeline (verified)
- Value overview with real data (verified)
- Admin center (verified)
- Audit log (verified)
- AI Gateway
- Online AI Skill execution
- Figma integration
- Yuque integration
- Jira integration
- GitHub integration
- External deployment and post-deploy verification of the completed local light/dark theme remediation

## Current Blockers / Decisions Needed

The following decisions may affect later implementation:

- Enterprise SSO / OIDC provider is not yet confirmed.
- Production hosting and database provider are not yet confirmed.
- Railway cannot create the required API service for the current account because its free resource-creation quota is exhausted. The external test deployment uses the committed Render Blueprint for an isolated free Docker API and free PostgreSQL plus the Vercel web at `https://palmpay-design-intelligence-web.vercel.app`. Render's free PostgreSQL database expires after 30 days and the free API sleeps after inactivity, so this is an acceptance environment rather than a production route. The prepared configuration uses test-only signed sessions and the private `palmpay-design-hub-test` R2 Bucket; the exact Vercel origin has been added to both Render `WEB_ORIGIN` and R2 CORS.
- Cloudflare R2 is the approved production storage target. A private test Bucket, Bucket-scoped Object Read & Write Token, live signed upload/download/checksum verification, localhost browser-origin preflight and the exact external-test HTTPS origin CORS policy were completed on 2026-07-18. Local signed filesystem storage remains the fallback development adapter.
- Legacy examples contain team labels but no formal owner-user identity mapping required by the V1.0 ER model.
- The ER defines `restricted` visibility but does not define a user/group ACL entity; current catalog access is limited to the owner or `content.edit_all` users.
- PostgreSQL 17 and the restored `palmpay_design_hub` database are running through Postgres.app. On 2026-08-01 all six migrations were current and the complete 46-test API suite, including all 14 PostgreSQL E2E checks, passed with 0 failures and 0 skips.
- Release commit `46b988d` is the current pushed external-test baseline on `codex/v1-project-handoff`; its Vercel deployment is successful, and Render serves the new protected notification-count route after a healthy migration-gated startup. GitHub Pages remains enabled but serves the legacy static `main`-branch root; it is not the formal V1 deployment route. `docs/11-RELEASE-READINESS.md` records the remaining production-hosting, database, SSO, domain and CI/CD prerequisites.
- AI input data policy and approved external model boundary are not yet confirmed.
- Single-reviewer or multi-reviewer formal publishing policy is not yet confirmed.
- The mandatory v9-1 visual-parity gate cannot be accepted yet: workspace desktop now has validated source/local side-by-side evidence, but mobile, other routes and matching reviewer/admin state captures remain outstanding. `design-qa.md` records this as a blocking launch-verification issue; no route may be called 100% restored until every required state has evidence. By explicit user decision, it no longer blocks Phase 4 or Phase 5 implementation.

These unresolved items must not block repository setup, initial data model, RBAC base or an authentication adapter boundary.

## AI Responsibility

### GPT

- Product and experience decision
- PRD and IA
- Design decision updates
- Phase planning
- Product and UX review

### Claude

- Primary implementation
- Approved feature development
- Tests
- Normal implementation defect fixes

### Codex

- Project takeover
- Architecture review
- Complex implementation
- CI / test / security investigation
- Code review
- Confirmed defect fixes

## Update Rule

Update this file when:

- Phase changes
- Milestone completes
- Major blocker appears
- Architecture decision changes
- Next task changes

Do not use this file as a daily activity log.
