# PalmPay体验设计Hub — Current Project Status

Last Updated: 2026-07-15

## Current Phase

**Phase 1 preparation / project handoff**

## Current Objective

Prepare the formal V1.0 engineering project and establish a shared project context for GPT, Codex and Claude.

The next engineering objective is:

> Build the formal frontend and backend foundation, PostgreSQL / Prisma base, user / team / role models, authentication boundary and RBAC verification.

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

No formal V1.0 engineering task has been confirmed complete yet.

The immediate next step is Codex project takeover inspection.

## Next Task

Codex should:

1. Read `AGENTS.md`.
2. Read required docs.
3. Inspect final v9-1.
4. Inspect current repository structure.
5. Do not modify code.
6. Report:
   - product understanding
   - current architecture
   - v9-1 structure
   - gap to V1.0
   - Phase 1 task order
   - technical risks
   - documentation conflicts

## Next Milestone

**Phase 1 foundation verified**

Milestone definition:

- Formal web project exists.
- Formal API project exists.
- PostgreSQL / Prisma migration succeeds.
- Organization, Team, User, Role, Permission and UserRole exist.
- Authentication boundary exists.
- Current user endpoint works.
- Backend RBAC guard works.
- Frontend protected routing works.
- Disabled user access is denied.
- Member cannot call admin API.
- Type check passes.
- Lint passes.
- Relevant tests pass.
- Production build passes.

## Not Started

- Formal content center
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
