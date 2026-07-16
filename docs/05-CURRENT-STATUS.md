# PalmPay体验设计Hub — Current Project Status

Last Updated: 2026-07-16

## Current Phase

**Phase 1 engineering and identity foundation — verified**

## Current Objective

Begin the Phase 2 content center with the approved unified content model and permission-safe read APIs.

The next engineering objective is:

> Establish unified content persistence, content-type detail models and permission-safe catalog APIs before migrating content pages.

## Approved Product Baseline

- Final v9-1 only.
- Older v5, v6, v8 and v9 variants are not implementation baselines.
- v9-1 is the approved visual, information architecture and interaction reference.
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

- v9-1 content migration source and ownership mapping review

## Next Task

Codex should:

1. Resolve whether commit `bf39748` (labelled “Deploy Phase 4 v9.1”) is an approved source for the 33 AI projects missing from `legacy/v9-1/`.
2. Confirm formal owner-user and team mappings for legacy content; do not create placeholder owners.
3. Confirm an object-storage provider before claiming real attachment acceptance.
4. After source approval, migrate verified content idempotently and implement the remaining three catalog list/detail pages.
5. Keep draft creation, autosave and version-history workflows in Phase 3 per the development plan.

## Next Milestone

**Phase 2 content catalog foundation**

Milestone definition:

- Four content types and their formal detail records can be persisted in PostgreSQL.
- Published catalog lists and details load from permission-filtered APIs.
- Category and tag relationships use formal entities.
- File metadata uses an explicit storage adapter boundary; localStorage is not used.
- Type check, lint, relevant integration tests and production build pass.

## Not Started

- Formal content center (in progress)
- Content version workflow
- Review workflow
- Real file storage
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
- Object storage provider is not yet confirmed.
- The approved `legacy/v9-1/` directory does not contain the 33 AI projects required by Phase 2 acceptance; a matching v9.1 Git commit contains them but is outside the approved baseline directory.
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
