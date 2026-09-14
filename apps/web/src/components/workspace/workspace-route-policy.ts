export function shouldPrefetchWorkspaceRoute(href: string) {
  const [pathname, query] = href.split('?');
  return pathname !== '/workspace/recent'
    && !(pathname === '/workspace/favorites' && new URLSearchParams(query).get('tab') === 'recent');
}

export function filterWorkspaceWarmRoutes(routes: string[]) {
  return routes.filter(shouldPrefetchWorkspaceRoute);
}
