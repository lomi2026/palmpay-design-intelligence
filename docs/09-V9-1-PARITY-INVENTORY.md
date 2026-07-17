# v9-1 Visual and Interaction Parity Inventory

Last Updated: 2026-07-17

## Purpose

This inventory is the mandatory gate before Phase 4. The deployed v9-1 site is the visual, information-architecture and interaction authority. The formal V1 application must preserve that experience while moving state to the API and PostgreSQL.

Do not accept a formal page merely because its data flow works.

## Verification method

For every deployed v9-1 page:

1. Capture the deployed desktop page at the same viewport as the formal page.
2. Record its navigation, sections, wording, controls, states and interactions.
3. Restore the counterpart in the formal application.
4. Capture the formal page with realistic database-backed content.
5. Compare screenshots before marking the row complete.

## Initial counterpart map

| Deployed v9-1 source | Formal V1 counterpart | Current parity status |
| --- | --- | --- |
| `index.html` — public home | `/` | Implemented; local visual smoke check complete; deployed screenshot comparison pending |
| `design-intelligence-hub-demo.html` — workspace / presentation structure | `/workspace` and workspace shell | Implemented visual shell; deployed screenshot comparison pending |
| `workspace.html` — Design Assets module state | `/workspace/design-assets` | Source/local side-by-side captured at `1280 x 720`; formal page now uses the 8 approved PostgreSQL-backed v9-1 assets and source-aligned catalog layout. Acceptance blocked by favorite persistence and role-state mismatch. |
| v9-1 asset-detail interaction | `/workspace/design-assets/[slug]` | Existing formal detail retained; visual final pass and deployed comparison pending |
| `ai-skill-toolkit.html` — Skill catalog | `/workspace/ai-skills` | Implemented visual shell and real catalog data; deployed screenshot comparison pending |
| `skill-detail-*.html` — Skill detail | `/workspace/ai-skills/[slug]` | Existing formal detail retained; visual final pass and deployed comparison pending |
| `upload-asset.html` — submit flow | `/workspace/submit` and `/workspace/submit/[id]` | Implemented with formal draft workflow; deployed screenshot comparison pending |
| deployed AI project library | `/workspace/ai-projects` and `/workspace/ai-projects/[slug]` | List implemented; formal detail visual final pass and deployed comparison pending |
| deployed AI case pages | `/workspace/ai-cases` and `/workspace/ai-cases/[slug]` | List implemented; formal detail visual final pass and deployed comparison pending |
| deployed review-center experience | `/workspace/reviews` | Implemented with formal queue actions; deployed screenshot comparison pending |

## Formal-only pages

The following pages have no confirmed v9-1 counterpart. They must inherit the deployed workspace shell, typography, spacing, controls and density; they must not introduce a new style direction.

- `/login`
- `/workspace/submissions`
- `/workspace/notifications`

## Current evidence status

- The deployed home page was successfully reached at `https://lomi2026.github.io/palmpay-design-intelligence/` on 2026-07-16.
- Browser automation did not reliably return a DOM snapshot or screenshot during the initial connection. Screenshot evidence remains pending and must be captured before page acceptance.
- The local `legacy/v9-1/` pages are a supporting source only. Any mismatch or missing page must be resolved in favour of the deployed site.
- Local visual smoke checks completed on `/` and `/workspace/ai-cases`: the public hero, workspace shell, data-backed catalog cards and search controls render at the local desktop viewport. This is not equivalent to deployed side-by-side acceptance.
- The source workspace's Design Assets state was captured at `1280 x 720` and compared directly against the authenticated formal route. Header title, filter-frame start, source wording, categories, 3-column card density, metadata and official v9-1 asset examples are now restored with database persistence. `design-qa.md` retains the blocking favorite and role-state differences; this row is not accepted yet.
