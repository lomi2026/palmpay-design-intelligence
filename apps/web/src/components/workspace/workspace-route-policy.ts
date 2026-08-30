const FRESH_ON_ENTRY_ROUTES = new Set(['/workspace/recent']);

export function shouldPrefetchWorkspaceRoute(href: string) {
  return !FRESH_ON_ENTRY_ROUTES.has(href.split('?')[0] ?? href);
}

export function filterWorkspaceWarmRoutes(routes: string[]) {
  return routes.filter(shouldPrefetchWorkspaceRoute);
}
