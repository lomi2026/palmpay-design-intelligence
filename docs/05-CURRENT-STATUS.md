# PalmPay体验设计Hub — Current Project Status

Last Updated: 2026-07-17

## Current Phase

**Phase 4 — Search, favorite and usage (in progress); Phase 5 follows before final visual-parity remediation**

## Current Objective

Complete the remaining formal Phase 4 and Phase 5 product capabilities before returning to the final v9-1 page-by-page visual-parity remediation.

The next engineering objective is:

> Phase 3 is complete. By explicit user decision on 2026-07-17, Phase 4 and Phase 5 proceed before the final visual-parity pass. Visual parity remains a required launch gate, not a prerequisite for this implementation order.

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
- Draft editor now debounces field changes into server-side autosave and exposes saving, saved and failure feedback
- Created `docs/09-V9-1-PARITY-INVENTORY.md` to track the mandatory deployed v9-1 page-by-page visual and interaction restoration gate
- v9-1 parity implementation must use shadcn/ui conventions and token-driven variants; custom replacement primitives or arbitrary component behavior changes are not permitted
- API development startup now compiles TypeScript to `dist` and watches that output before restarting Node, avoiding direct runtime loading of Prisma-generated TypeScript files

## Validated Product Modules

- 公开首页
- 工作台
- 价值总览
- 设计资产
- AI Skill
- AI 项目库
- AI 案例
- 提交内容
- 审核中心
- 数据洞察
- 管理中心
- 演示模式
- 明暗主题
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

- By explicit user decision, Phase 4 and Phase 5 now take priority over the remaining visual-parity gate. The team will return to and complete the mandatory deployed-v9-1 page, state and responsive comparison work after those formal capabilities are implemented and verified.
- Phase 3 is verified functionally. The public home, workspace shell, catalog lists, submit/draft flow, notifications, my submissions, review center, login and access-denied pages have been moved onto the v9-1 dark visual language using shadcn/ui primitives while retaining the formal API and RBAC behavior.
- The mandatory v9-1 parity gate is still open: formal detail pages need a final visual pass, and every deployed counterpart still needs reliable side-by-side screenshot acceptance. Cloudflare R2 activation remains deferred until a payment method is available.
- The deployed workspace desktop baseline has been checksum-verified against the matching historical source and compared side by side with an authenticated formal local workspace at `1280 x 720`. The sidebar, top bar, dashboard hero, metric, update and todo layout has received a source-informed correction pass; matching reviewer/admin test identity and the remaining page/state captures are still required for acceptance.
- The workspace Design Assets module has a direct `1280 x 720` source/local comparison and now uses 8 formally imported, source-traceable v9-1 assets instead of an empty catalog. Its header, filters, card-cover hierarchy and metadata have been restored with shadcn/ui composition. Formal favorite persistence and a matching reviewer/admin visual state remain parity blockers.

## Next Task

Codex should:

1. Complete Phase 4: permission-filtered full-text search and logs, favorites, recent views, usage confirmation and content relations.
2. Complete Phase 5: event recording/aggregation, value and analytics APIs, administration, taxonomy, user-role management and audit log.
3. Return to the visual-parity inventory, complete every required source/local desktop and mobile comparison, then accept the v9-1 gate. Configure Cloudflare R2 later using `docs/08-CLOUDFLARE-R2-SETUP.md` when a payment method is available.

## Next Milestone

**Phase 4 and Phase 5 capability completion; then v9-1 visual and interaction parity gate**

Milestone definition:

- Each page with a deployed v9-1 counterpart matches the approved layout, information hierarchy, wording, density and interaction behavior.
- Screenshot comparison records the verification outcome for every counterpart page.
- Formal data, authentication, RBAC and lifecycle behavior remain intact behind the restored interface.

## Not Started

- Formal content center core catalogs (verified; real attachments remain)
- Cloudflare R2 production object storage (local development storage is verified)
- Full search
- Favorites persistence
- Usage confirmation
- Analytics event pipeline
- Value overview with real data
- Admin center
- Audit log
- AI Gateway
- Online AI Skill execution
- Figma integration
- Yuque integration
- Jira integration
- GitHub integration

## Current Blockers / Decisions Needed

The following decisions may affect later implementation:

- Enterprise SSO / OIDC provider is not yet confirmed.
- Production hosting and database provider are not yet confirmed.
- Cloudflare R2 remains the approved production storage target, but activation is deferred because no payment method is currently available. Local signed filesystem storage is development-only.
- Legacy examples contain team labels but no formal owner-user identity mapping required by the V1.0 ER model.
- The ER defines `restricted` visibility but does not define a user/group ACL entity; current catalog access is limited to the owner or `content.edit_all` users.
- PostgreSQL 17 is installed locally through Postgres.app. The `palmpay_design_hub` database was restored on 2026-07-17 from the supplied old-computer dump and brought up to date with the current Prisma migration set; the development API is available on port 3001.
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
