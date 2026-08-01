# PalmPay体验设计Hub — Approved Design Decisions

This file records **final approved decisions**.

Historical chat discussions, temporary variants and abandoned visual experiments do not override this file.

## 1. Overall visual direction

- Use a restrained black-and-white visual system.
- Do not use green as the primary brand color.
- Default theme is dark mode.
- Support light mode.
- The platform should feel professional, calm, precise and suitable for a senior experience-design leadership audience.
- Avoid colorful generic SaaS dashboard aesthetics.
- Avoid excessive gradients, decorative glow and visual noise.
- Avoid page layouts that look like a traditional corporate marketing website.

## 2. Product tone

The platform is not a portfolio.

Approved positioning expression:

> 平台不是作品集，而是治理机制

At normal desktop width, this sentence should remain on one line when space allows.  
Only wrap when the available width is truly insufficient.

## 3. Brand and logo

- Use the approved elliptical outline logo style.
- Do not replace it with the abandoned circular logo direction.
- The logo inside the ellipse should be visually smaller and more refined than early versions.
- Apply the same logo-scale rule consistently across navigation, footer and other logo placements.
- Do not arbitrarily enlarge the logo.

## 4. Theme

- Default: dark mode.
- Light mode is optional but fully supported.
- Dark mode is the primary visual reference.
- Theme tokens must be centralized.
- Do not implement separate unrelated dark and light component styles.

## 5. Typography

- English font direction: Inter Tight.
- Chinese text uses appropriate system fallback.
- UI controls should use compact typography.
- Buttons, Inputs, Tags, Selects and navigation text should not use oversized SaaS dashboard typography.
- Prefer smaller UI text with appropriate component density over large text inside oversized controls.
- Headline hierarchy should remain clear and confident.
- Avoid excessive bold weights across all text.

## 6. UI density

Approved direction:

> Compact, precise, high-information-density workspace.

Rules:

- Buttons should not be unnecessarily tall.
- Inputs should not be unnecessarily tall.
- Selects should match the compact control system.
- Tags should be visually light and compact.
- Navigation spacing should be controlled.
- Cards should not be excessively narrow.
- Card spacing should adapt to the viewport.
- Avoid large empty gaps that reduce scanning efficiency.

## 7. Home page

Approved requirements:

- Keep the dual-entry product structure: public-facing home + internal workspace.
- Public home explains platform value and provides task-oriented entry points.
- Core task-oriented entrances include:
  - 找设计资产
  - 用 AI Skill
  - 看业务影响
- The statement “平台不是作品集，而是治理机制” should stay on one line at normal desktop width when possible.
- The expression “让设计资产被复用 让设计价值被衡量” uses white text in the approved dark visual direction.
- Keep the page readable and suitable for leadership presentation.
- Do not turn the page into a decorative campaign landing page.

## 8. Workspace

Approved primary navigation modules:

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

Workspace rules:

- Maintain a compact professional density.
- Navigation text should not feel oversized.
- Controls should align to one consistent size system.
- The workspace should prioritize scanning and task completion.
- Avoid oversized cards and excessive vertical whitespace.

## 9. Terminology

Final wording:

- 汇报模式 → 演示模式
- 退出汇报模式 → 退出演示模式

Do not restore the previous wording unless explicitly requested.

## 10. AI 项目库

- AI 项目库 remains an independent first-class module.
- Do not merge AI 项目库 into AI Skill.
- AI 项目库 represents exploration directions, opportunity portfolio and pilot candidates.
- It is not a full project-management system.
- Keep project-domain, target-value and stage filtering.
- Project cards and detail pages should preserve a clear exploration / evaluation mental model.

## 11. 设计资产

- Asset detail must help the user decide whether the asset applies to the current task.
- Clearly show:
  - what it is
  - what problem it solves
  - applicable scenarios
  - unsuitable scenarios
  - how to use it
  - current version
  - owner
  - updated time
  - related assets
- Do not reduce asset detail to a title and download button.

## 12. AI Skill

- A Skill is a reusable AI work method, not merely a Prompt text box.
- Skill detail should expose:
  - goal
  - applicable scenarios
  - input requirements
  - output structure
  - Prompt
  - execution steps
  - human review rules
  - limitations
  - examples
  - version
  - owner
- The “新增 Skill” action must have a complete interaction path.
- Do not create a decorative button with no follow-through.

## 13. AI 案例

AI case presentation must answer:

- What was the original problem?
- Where did AI intervene?
- What did AI do?
- What judgment remained with the designer?
- What changed?
- How was it validated?
- What are the limits?
- Can others reuse the method?

Do not present AI cases only as success marketing.

## 14. Asset creation and Skill creation

Approved interaction principle:

- Primary action buttons must have a working end-to-end path.
- “新增资产” must open a valid creation flow.
- “新增 Skill” must open a valid creation flow.
- Do not leave primary action buttons inert.
- Formal V1.0 flows use backend persistence.

## 15. Search

- Search inputs include a clear search icon.
- Search should feel like a core work action, not a decorative filter.
- Search and filtering should respond quickly.
- No-result state must be useful.
- Search state should not visually overwhelm the content list.

## 16. Cards

- Card width should use available space intelligently.
- Avoid overly narrow cards that cause unnecessary title wrapping.
- Avoid huge gaps between cards.
- Important card-level actions must be discoverable.
- The AI project collection card action “打开 +” should not be visually tiny.

## 17. Presentation mode

- Final name: 演示模式.
- It is used for leadership or structured presentation.
- It should hide unnecessary operational noise when appropriate.
- It must not expose sensitive personal or internal data.
- It is not a second disconnected product.

## 18. AI collaboration UI constraint

For the GPT collaboration workflow around this project:

- Do not embed large HTML previews or auto-load heavy code previews in chat.
- Prefer plain-text completion reporting.
- Only generate deployment packages when explicitly requested.
- For PalmPay code modifications, use the latest clean code baseline as the only code baseline.
- Do not reintroduce older code versions.

## 19. Approved v9-1 code baseline (2026-07-16)

- The deployed website at `https://lomi2026.github.io/palmpay-design-intelligence/` is the sole approved v9-1 legacy code baseline.
- Its public home, workspace and all module pages define the approved visual system, layout, information architecture and validated interactions.
- The current V1 placeholder pages do not establish a replacement visual direction.
- V1 must migrate the deployed v9-1 experience into the formal Next.js application while replacing static/localStorage-only implementation with the approved backend and database architecture.
- Do not treat an incomplete local legacy snapshot as a reason to redesign, omit or simplify a deployed v9-1 page.

## 20. Mandatory v9-1 visual parity gate (2026-07-16)

- The deployed v9-1 pages are not only a loose reference: every V1 page that has a v9-1 counterpart must restore the same approved layout, visual hierarchy, information density, wording, interaction behavior and responsive presentation before it is accepted.
- Formal Next.js, API, authentication, RBAC, PostgreSQL, versioning and review implementations must sit behind that approved experience; they must not introduce a substitute visual direction or simplified placeholder page.
- No Phase 4 feature work may begin until the v9-1 counterpart pages have been inspected side by side and their visual/interaction parity is verified with screenshots.
- New formal-only pages such as notifications and personal submissions must inherit the v9-1 workspace shell, density and component language. They cannot redefine the system style.

## 21. Delivery order override (2026-07-17)

- By explicit user decision, complete formal Phase 4 and Phase 5 capabilities before resuming the final v9-1 visual-parity remediation.
- The deployed v9-1 visual and interaction baseline remains mandatory for final acceptance and launch; this decision changes delivery order only.

## 22. Decision change process

When a new explicit user decision changes this file:

1. Update this file.
2. Record the new final decision.
3. Remove or clearly mark the replaced decision.
4. Update implementation if needed.
5. Do not keep two conflicting active rules.

## 23. shadcn/ui implementation constraint (2026-07-16)

- All formal V1 UI primitives must follow shadcn/ui component conventions, accessibility behavior and token-driven styling.
- Do not invent replacement Button, Input, Select, Dialog, Tabs, Sheet, Card, Badge, Toast or navigation primitives when an appropriate shadcn/ui component exists.
- v9-1 visual parity must be achieved through approved composition, theme tokens, spacing and variants; do not fork or arbitrarily alter shadcn/ui component behavior to imitate the legacy static implementation.
- Any required component extension must preserve the upstream shadcn/ui API and accessibility contract, be isolated as an explicit variant, and be documented before use.

## 24. Functional interface completion before final pixel parity (2026-07-17)

- By explicit user decision, pause the remaining pixel-level v9-1 remediation and complete the formal workspace functional interface first.
- Add a Phase 5.5 functional-interface completion pass before Phase 6 acceptance.

## 25. Functional closure, desktop parity, then mobile adaptation (2026-07-18)

- The functional-interface pass must be judged by an explicit P0 workflow audit and deployed browser evidence, not merely by the existence of routes or server actions.
- The current delivery order is: complete and verify desktop functional workflows first; restore desktop Web v9-1 parity second; perform mobile adaptation last.
- Do not spend implementation capacity on pixel-level polish or mobile-specific parity while an identified P0 action, validation rule, attachment path or role workflow remains incomplete.
- The existing workspace navigation-performance defect is tracked separately and is not represented as accepted merely because a code change was deployed.

## 26. Superseded continuous v9-1 parity remediation (2026-07-18)

This previous delivery order is superseded by Decision 25. It remains as historical context only; functional closure is now the active priority.

- By explicit user decision, resume and complete the final v9-1 visual and interaction parity work for every page that has a deployed v9-1 counterpart.
- Work through the approved priority order without waiting for further confirmation between individual page or flow batches: public entry, workspace shell and overview, knowledge catalogs and details, contribution/review flows, then formal-only pages inheriting the same system.
- Every parity change must preserve the formal V1 API, PostgreSQL, RBAC, versioning, review and audit behavior already implemented. Static prototype behavior and localStorage must not be reintroduced as a substitute.
- Completion still requires applicable automated checks and source-versus-rendered visual evidence at desktop and mobile breakpoints. A page without that evidence remains open in the parity inventory.
- Phase 5.5 must expose the implemented modules through a complete permission-aware desktop and mobile navigation system, remove inert controls, bind the workspace dashboard to formal APIs, and complete the missing personal, governance, analytics and administration surfaces.
- RBAC remains authoritative: a menu item may be absent for a user who does not have its permission, and no visual completion work may bypass API or page authorization.
- Final v9-1 parity remains a launch gate after functional-interface and critical-flow completion.

## 27. Workspace first-entry loading state (2026-08-01)

- By explicit user decision, the first entry to a Workspace menu page uses the earliest approved full skeleton pattern: heading lines, four summary-card placeholders and one main-content placeholder.
- Do not replace this pattern with the top progress strip and loading text.
- This decision changes loading presentation only. Route boundaries, caching, prefetch, permissions and data-fetching behavior remain unchanged.
