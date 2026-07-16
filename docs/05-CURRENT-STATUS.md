# PalmPay体验设计Hub — Current Project Status

Last Updated: 2026-07-16

## Current Phase

**Phase 3 — Draft, version and review (initial backend boundary in progress)**

## Current Objective

Start the Phase 3 content-lifecycle workflow from the approved draft, autosave and version model.

The next engineering objective is:

> Build the formal content draft workflow without weakening organization isolation, ownership, version immutability or the deployed v9-1 visual baseline.

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
- Review workflow data migration and protected APIs for submit, reviewer assignment, approval and request-changes; protected reviewer queue and eligible-reviewer APIs are available, and the draft editor can submit a draft for review
- Draft attachment binding: only ready, organization-scoped files that the editor can manage may be attached to a draft version and are returned on draft recovery

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

- Phase 3 draft API, dedicated four-type draft forms, attachment-binding API, editor shell and review queue APIs are verified; reviewer workbench, attachment upload UI and immutable published-version editing remain to be implemented. Cloudflare R2 activation remains deferred until a payment method is available

## Next Task

Codex should:

1. Implement the review center UI: reviewer queue, assignment and decision controls.
2. Create a new editable draft version when published content is edited.
3. Add attachment upload and selection controls to the shared editor shell.
4. Configure Cloudflare R2 later using `docs/08-CLOUDFLARE-R2-SETUP.md` when a payment method is available.

## Next Milestone

**Phase 3 — Draft, version and review**

Milestone definition:

- A contributor can create, autosave and resume a draft across sessions.
- Draft history is tied to a formal content version.
- Review and publish transitions remain permission-controlled and traceable.
- Published content is never mutated in place.
- Type check, lint, relevant integration tests and production build pass.

## Not Started

- Formal content center core catalogs (verified; real attachments remain)
- Content version workflow
- Review workflow
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
- The local development PostgreSQL instance is extracted under `/private/tmp` and is not a persistent system service.
- AI input data policy and approved external model boundary are not yet confirmed.
- Single-reviewer or multi-reviewer formal publishing policy is not yet confirmed.

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
