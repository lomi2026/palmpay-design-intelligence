# PalmPay体验设计Hub — Current Project Status

Last Updated: 2026-07-18

## Current Phase

**Phase 5.5 functional-interface acceptance is complete; Phase 6 non-visual QA and delivery preparation is next; final v9-1 pixel-parity remediation remains paused**

## Current Objective

Complete non-visual Phase 6 QA and delivery preparation while keeping the final v9-1 page-by-page visual-parity remediation paused by explicit user decision.

The next engineering objective is:

> By explicit user decision on 2026-07-17, pause pixel-level parity work and complete Phase 5.5 functional-interface coverage first. Visual parity remains a required launch gate after the formal flows are complete.

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
- The protected workspace now has shared loading feedback and a recoverable error boundary, so slow or failed formal API reads do not leave an unexplained blank interface.
- Role-flow acceptance now uses four isolated, temporary PostgreSQL identities: member, reviewer, manager and administrator. The integration suite verifies independent reviewer assignment, request-changes, contributor revision and resubmission, approval, administrator publishing/lifecycle authority, and manager analytics-only access; all temporary test records are removed after execution.
- Phase 5.5 functional-interface acceptance is complete: all implemented formal modules are reachable through permission-aware desktop/mobile navigation or contextual actions; primary controls are functional or explicitly unavailable; dashboard values come from formal APIs; and the core member, reviewer, manager and administrator workflows have automated PostgreSQL evidence.
- Phase 6 local QA has verified Prisma schema/migration status, production builds, 12 PostgreSQL integration checks, security-boundary assertions and authorized runtime smoke paths. During this verification, the restored database was found to be missing the approved design-asset import; the existing idempotent v9-1 import script added the missing 8 assets and the formal catalog now contains 8 assets, 6 Skills, 4 cases and 33 projects.

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

- Phase 6 non-visual QA and delivery preparation is next. Phase 5.5 delivered one permission-aware navigation model across desktop and mobile, route-aware active states, dynamic breadcrumbs, real dashboard data, personal contribution/submission surfaces and explicit unavailable-state behavior for unfinished controls.
- The administration surface is now separated into content, taxonomy, team, user, role-permission, audit and platform-settings modules. Team updates, user status changes and role assignment/removal use the protected formal APIs and retain audit logging; the platform-settings module reports the current environment boundary without presenting unavailable production integrations as active controls.
- Phase 4/5 implementation is in the working tree: the additive Prisma migration introduces persisted favorites, recent views, unified usage events, search logs and audit logs. The API provides permission-filtered PostgreSQL full-text search, search-click/no-result logging, favorites, recent views, real AI-project usage confirmation, content relations, analytics aggregates, taxonomy/content administration and audit-log endpoints. The workspace exposes global search, personal saved/recent pages, usage and relation flows, overview/insights and RBAC-gated administration pages. API strict typecheck, lint, Prisma validation/migration status and twelve PostgreSQL integration tests pass, including separate member/reviewer/manager/admin workflow coverage and input/CORS/file boundary assertions; Web typecheck, lint and production build also pass. The protected workspace correctly redirects to formal development login rather than substituting a static role.
- Phase 3 is verified functionally. The public home, workspace shell, catalog lists, submit/draft flow, notifications, my submissions, review center, login and access-denied pages have been moved onto the v9-1 dark visual language using shadcn/ui primitives while retaining the formal API and RBAC behavior.
- The mandatory v9-1 parity gate is still open: the public home has now received a complete desktop structure restoration against deployed source commit `bf39748` (hero, metric panel, task paths, AI project portfolio, asset toolbar/grid, verified case, governance and CTA), while the deployed workspace and project counterparts still need complete responsive and permission-state acceptance. Direct deployment checks established that several archived deep links (Design Assets, submit, demo workspace and AI Skill pages) are 404 and therefore are formal-only V1 routes rather than current deployed parity targets. Cloudflare R2 activation remains deferred until a payment method is available.
- The formal AI Project detail now uses the deployed project-template information hierarchy while binding every displayed signal to the persisted AIProjectDetail, ContentVersion, owner/team, priority and engagement models. It retains RBAC-gated lifecycle actions instead of copying the legacy static reset/action behavior.
- The formal AI Case detail now uses the deployed verified-practice information hierarchy while binding the before/after comparison, AI and human responsibilities, result and validation evidence to CaseDetail and ContentVersion data. Missing limits are explicitly marked as incomplete rather than presented as verified production evidence.
- The formal Design Asset detail now puts applicability and constraints ahead of implementation detail, while preserving persisted usage guidance, version, maintenance metadata, attachments, related content and engagement actions.
- The formal AI Skill detail now exposes the approved reusable-method model from `SkillDetail`: scope, input/output, Prompt, execution conditions, examples, human review, limitations, version and owner. It does not invent missing examples or limitations. Direct deployment checks confirm that the archived Skill catalog/detail filenames return 404, so these formal pages inherit the deployed workspace system instead of claiming a missing v9-1 counterpart.
- The deployed workspace desktop baseline has been checksum-verified against the matching historical source and compared side by side with an authenticated formal local workspace at `1280 x 720`. The sidebar, top bar, dashboard hero, metric, update and todo layout has received a source-informed correction pass; matching reviewer/admin test identity and the remaining page/state captures are still required for acceptance.
- The workspace Design Assets module uses 8 formally imported, source-traceable v9-1 assets instead of an empty catalog. Its header, filters, card-cover hierarchy and metadata use the deployed workspace component language with shadcn/ui composition. The historical `design-assets.html` URL is 404 on the current deployment, so it is not a separate parity blocker.

## Next Task

Codex should:

1. Begin Phase 6 non-visual QA: broaden security and authorization checks, record release evidence and resolve production-delivery prerequisites without resuming pixel parity.
2. Return to the visual-parity inventory only when the user resumes it, then complete required deployed/local desktop and mobile comparisons.
3. Provision the external test environment and add its exact HTTPS web origin to the existing private R2 Bucket CORS policy before validating browser-origin upload there.

## Next Milestone

**Phase 6 non-visual QA and delivery preparation; then v9-1 visual and interaction parity gate when resumed**

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
- Full light-theme token migration

## Current Blockers / Decisions Needed

The following decisions may affect later implementation:

- Enterprise SSO / OIDC provider is not yet confirmed.
- Production hosting and database provider are not yet confirmed.
- Cloudflare R2 is the approved production storage target. A private Bucket, Bucket-scoped Object Read & Write Token, live signed upload/download/checksum verification and localhost browser-origin CORS preflight were completed on 2026-07-18. The external test-web HTTPS origin must be added to the private Bucket CORS policy only after that deployment URL exists. Local signed filesystem storage remains the fallback development adapter.
- Legacy examples contain team labels but no formal owner-user identity mapping required by the V1.0 ER model.
- The ER defines `restricted` visibility but does not define a user/group ACL entity; current catalog access is limited to the owner or `content.edit_all` users.
- PostgreSQL 17 is installed locally through Postgres.app. The `palmpay_design_hub` database was restored on 2026-07-17 from the supplied old-computer dump and brought up to date with the current Prisma migration set; the development API is available on port 3001.
- Commit `987651f` is pushed to the GitHub default branch `codex/v1-project-handoff`. GitHub Pages remains enabled but serves the legacy static `main`-branch root (last modified 2026-07-13), with no workflow or deployment record for the formal V1 branch. A GitHub Pages push alone cannot deploy the formal V1 Next.js + NestJS + PostgreSQL application; `docs/11-RELEASE-READINESS.md` records the verified local release evidence and the outstanding production-hosting, database, SSO, R2 and CI/CD prerequisites.
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
