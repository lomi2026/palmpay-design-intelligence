'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const VISITED_KEY = 'palmpay-recent-route-visited';

export function RefreshRecentOnEntry() {
  const router = useRouter();
  const refreshed = useRef(false);

  useEffect(() => {
    if (refreshed.current) return;
    refreshed.current = true;

    // With prefetch disabled, the first entry already has a fresh server
    // payload. Later mounts can come from Next's dynamic client cache, so
    // refresh exactly once for that entry. router.refresh preserves client
    // state, including this guard, while merging the new server payload.
    try {
      if (window.sessionStorage.getItem(VISITED_KEY)) {
        router.refresh();
        return;
      }
      window.sessionStorage.setItem(VISITED_KEY, '1');
    } catch {
      // Storage can be unavailable in hardened browser contexts. A guarded
      // refresh still gives the route fresh data without relying on storage.
      router.refresh();
    }
  }, [router]);

  return null;
}
