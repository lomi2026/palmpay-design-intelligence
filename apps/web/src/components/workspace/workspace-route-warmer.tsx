'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type WorkspaceRouteWarmerProps = {
  canAnalyze: boolean;
  canCreate: boolean;
  canManage: boolean;
  canReview: boolean;
  canSubmit: boolean;
};

/**
 * The workspace is an authenticated, data-backed application, not a static
 * website. Its most common destinations are nevertheless a small and stable
 * set. Warm their complete router payload after the shell is interactive so a
 * normal menu switch reads from Next's client router cache instead of waiting
 * for a Vercel -> Render request.
 *
 * This deliberately excludes catalog detail records and search results: their
 * cardinality is unbounded and they should only be prefetched on user intent.
 */
export function WorkspaceRouteWarmer({
  canAnalyze,
  canCreate,
  canManage,
  canReview,
  canSubmit,
}: WorkspaceRouteWarmerProps) {
  const router = useRouter();
  const routes = useMemo(() => {
    const nextRoutes = [
      '/workspace',
      '/workspace/favorites',
      '/workspace/recent',
      '/workspace/notifications',
      '/workspace/design-assets',
      '/workspace/ai-skills',
      '/workspace/ai-projects',
      '/workspace/ai-cases',
    ];

    if (canCreate) nextRoutes.push('/workspace/contributions', '/workspace/submit');
    if (canSubmit) nextRoutes.push('/workspace/submissions');
    if (canReview) nextRoutes.push('/workspace/reviews');
    if (canAnalyze) nextRoutes.push('/workspace/overview', '/workspace/insights');
    if (canManage) {
      nextRoutes.push(
        '/workspace/admin',
        '/workspace/admin?tab=taxonomy',
        '/workspace/admin?tab=teams',
        '/workspace/admin?tab=users',
        '/workspace/admin?tab=roles',
        '/workspace/admin?tab=audit',
        '/workspace/admin?tab=settings',
      );
    }

    return nextRoutes;
  }, [canAnalyze, canCreate, canManage, canReview, canSubmit]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    let routeIndex = 0;

    const warmNext = () => {
      if (cancelled || routeIndex >= routes.length) return;
      const route = routes[routeIndex];
      if (!route) return;
      router.prefetch(route);
      routeIndex += 1;
      // Pace background reads so they never compete with the page the user is
      // actively viewing, while still warming the compact workspace quickly.
      timeoutId = window.setTimeout(warmNext, 120);
    };

    // Do not compete with the initial route hydration or the first interaction.
    timeoutId = window.setTimeout(warmNext, 500);
    return () => {
      cancelled = true;
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [router, routes]);

  return null;
}
