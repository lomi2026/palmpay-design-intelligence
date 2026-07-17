# v9-1 visual parity QA

**Comparison target**

- Source visual truth: `https://lomi2026.github.io/palmpay-design-intelligence/`
- Formal implementation: local Next.js routes in `apps/web`
- Required viewports: desktop and `390 x 844` mobile
- Required state: default dark theme, top of each route, then every visible interactive state

**Evidence status**

- The reference URL resolves to the expected PalmPay Design Intelligence Hub title.
- Captured the deployed public-home desktop default state at `1280 x 720` in the in-app browser on 2026-07-16, including its DOM structure and computed layout measurements.
- Captured the matching local public-home desktop default state at `1280 x 720`; the first comparison found P1 structural differences in the header and hero. The home header, hero copy, grid, controls and workspace-preview geometry were then corrected and locally re-captured.
- Captured the deployed `workspace.html` desktop default state and DOM on 2026-07-17. The live HTML checksum matches the local historical release snapshot from `origin/main` exactly (`5cf2ad16…c2da`), so the snapshot is valid evidence when the hosted browser page is slow to settle.
- Restored PostgreSQL, applied the pending Prisma migration, started the formal API, and authenticated the local development workspace with the restored `lomi2026@126.com` member account.
- Captured a same-state, side-by-side in-app-browser comparison of `http://localhost:4174/workspace.html` (the checksum-matched v9-1 source) and `http://localhost:3000/workspace` at `1280 x 720`. The source and local hero frame, card geometry, text wrapping, journey graphic, action sizes, metric start line, sidebar density and top-bar hierarchy were corrected in this iteration. The latest browser capture has no local console errors.
- Captured the actual v9-1 Design Assets module by opening `设计资产` from the checksum-matched workspace source, then compared it side-by-side with `http://localhost:3000/workspace/design-assets` at `1280 x 720`. The local page is backed by 8 idempotently imported v9-1 assets, formal content versions, categories, tags and AssetDetail records—not placeholder data. A second source/local capture was completed after restoring the source header, filter frame, 3-column grid, 160px asset covers, metadata, copy, search, platform filter, category filters and card/list toggles. Matched geometry in the final capture: title `y=88`, filter frame `y=182`, local first card `y=354` vs source `y≈356`.
- The mobile capture request at `390 x 844` still timed out, and source captures for all other deployed routes and interaction states remain outstanding.

**Findings**

- [P1] Visual parity is incomplete outside the corrected public-home desktop hero.
  Location: public-home lower sections, every workspace/module/detail route, and all mobile states.
  Evidence: only the default desktop home state has a deployed-to-local capture pair; no other route or mobile state has a valid comparison pair.
  Impact: the requested 100% visual and interaction parity cannot be accepted.
  Fix: capture each matching state, compare it side by side, correct all P0/P1/P2 differences, and record each iteration here.

- [P1] The public-home desktop preview remains a structural approximation below the verified first viewport.
  Location: `/`, workspace preview interior and sections below the fold.
  Evidence: the outer frame, header, hero layout and visible controls were aligned from the captured source, but the remaining preview-content details and below-fold sections have not yet been compared against a source capture.
  Impact: it must not be represented as a complete or pixel-perfect home restoration.
  Fix: capture the full source page in incremental viewport screenshots and iterate against matching local captures.

- [P1] The workspace default desktop state is still not an exact state match because the restored local dump contains only member users.
  Location: `/workspace` sidebar and account menu.
  Evidence: the v9-1 source capture shows `Lomi Peng` and its management navigation; the formal local capture correctly shows the restored member `lomi2026`, omits reviewer/admin navigation by RBAC, and preserves the source's AI-project count badge.
  Impact: the formal implementation must not falsify identity or RBAC merely to imitate a static demo, but the required exact screenshot state cannot yet pass.
  Fix: obtain or define an approved local reviewer/admin test identity that corresponds to the v9-1 reference state, then recapture both permitted and member states.

- [P2] Workspace desktop residual geometry is within a few pixels but has not been accepted.
  Location: top-bar search/action alignment and the metric row offset.
  Evidence: source and local are now compared side by side at `1280 x 720`; the source account label has a different width, so the top-bar's auto-layout distributes a small remaining offset differently.
  Impact: this prevents a claim of 100% parity.
  Fix: repeat the capture with the approved matching user state, then tune the remaining header alignment from that exact content width.

- [P1] Design Assets has no equivalent persisted favorite state yet.
  Location: `/workspace/design-assets` card favorite affordance.
  Evidence: the v9-1 source default screenshot includes a selected first-card favorite; the formal page preserves the visual control but cannot claim the source's static favorite selection without a formal Favorites persistence feature.
  Impact: the member-state interaction cannot be called fully restored, and should not be faked with localStorage.
  Fix: implement the approved formal Favorites persistence only after the visual-parity gate allows Phase 4 work, then recapture the matched user state.

- [P2] Design Assets residual visual differences remain.
  Location: source card preview micro-geometry, top-bar identity width, and the source's role-specific sidebar state.
  Evidence: final `1280 x 720` side-by-side captures align the page frame, title, filter start and card grid; source preview art uses its own rem scale and selected favorite state, while the formal member page uses the restored `lomi2026` identity and RBAC-visible navigation.
  Impact: visual acceptance remains blocked rather than overstated as 100%.
  Fix: run the same capture with an approved matching reviewer/admin identity and finish the micro-geometry pass after the formal favorite state is available.

**Open Questions**

- None. The approved reference is unambiguous; the blocker is capture reliability, not product intent.

**Implementation Checklist**

1. Complete the public-home desktop and mobile comparison, including all below-fold regions.
2. Capture each deployed route and key interaction state at matched desktop and mobile viewports.
3. Capture the matching authenticated/local formal route state for member and reviewer/admin permissions.
4. Compare the paired captures, fix every P0/P1/P2 mismatch, and record each iteration here.
5. Re-run the Design Assets comparison after formal favorites and the approved matching role state exist.

**Comparison history**

- 2026-07-17 — workspace desktop, source `http://localhost:4174/workspace.html`, implementation `http://localhost:3000/workspace`, viewport `1280 x 720`, default dark state. The first authenticated local capture showed a 20px vertical offset, forced hero title line breaks, a too-large journey graphic and incorrect metric start. The formal workspace page and Shadcn-composed controls were adjusted; a fresh same-viewport side-by-side capture confirms those structural issues are corrected. Remaining P1/P2 findings are the account/role state mismatch and small content-width-dependent header offset above.
- 2026-07-17 — Design Assets desktop, source state reached from `http://localhost:4174/workspace.html` via its `设计资产` navigation, implementation `http://localhost:3000/workspace/design-assets`, viewport `1280 x 720`, default dark state. The initial local page was an empty generic catalog and failed the source comparison. The 8 approved v9-1 assets were imported into PostgreSQL with source traceability; the formal page was rebuilt using Shadcn Input, Select, Button, Card and Badge components. The second comparison showed missing asset covers and incorrect vertical card density, so the exact approved source cover layouts and card structure were migrated into the Shadcn composition. The final capture aligned title `y=88`, filter frame `y=182`, card grid start within two pixels, copy, categories, status labels, metadata and the 3-column density. Remaining blockers are recorded above.

**Follow-up Polish**

- None until the blocking source evidence is available.

final result: blocked
