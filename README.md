# PalmPay体验设计Hub V1.0

这是 PalmPay体验设计Hub V1.0 的正式前后端产品化仓库。

## 当前状态

- 正式 Next.js Web、NestJS API、Prisma/PostgreSQL 数据模型和测试环境部署配置均已建立。
- 当前工作重点是 P0 功能闭环、数据库 E2E 与部署后三角色验收；详见 `docs/05-CURRENT-STATUS.md`。
- `AGENTS.md` 与 `CLAUDE.md` 分别约束 Codex 和 Claude Code 的协作方式。
- `legacy/v9-1/` 是本地归档参考；若归档与已部署最终 v9-1 不一致，以已部署基线及匹配历史源码为准。

## Codex 首次接管

打开整个项目根目录后，先阅读 `AGENTS.md` 与其中要求的项目文档，再按 `docs/05-CURRENT-STATUS.md` 的 Next Task 继续。

## Important

最终 v9-1 是唯一 legacy 基线。不要混入旧版本。
