'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type Entry = { content: ReactNode; time: number };
type CacheContext = { begin: (href: string) => void; register: (key: string, content: ReactNode) => void; invalidate: () => void; cancel: () => void; failed: boolean; fail: (retry: () => void) => (() => void); retry: (() => void) | null; pending: string | null; entries: Map<string, Entry> };
const Context = createContext<CacheContext | null>(null);
const titles: Record<string, string> = {
  '/workspace': '工作台', '/workspace/overview': '价值总览', '/workspace/insights': '数据洞察',
  '/workspace/design-assets': '设计资产', '/workspace/ai-tools': 'AI 工具', '/workspace/ai-skills': 'AI Skill',
  '/workspace/ai-cases': 'AI 案例', '/workspace/ai-projects': 'AI 项目库', '/workspace/contributions': '我的贡献',
  '/workspace/admin': '管理中心', '/workspace/submit': '发布内容', '/workspace/favorites': '收藏与浏览',
};
function keyFor(href: string) { const url = new URL(href, 'http://workspace'); url.searchParams.sort(); return url.pathname + url.search; }

export function NavigationCacheProvider({ children, scope }: { children: ReactNode; scope: string }) {
  const actualPath = usePathname();

  const [entries, setEntries] = useState(new Map<string, Entry>());
  const [retry, setRetry] = useState<(() => void) | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const begin = useCallback((href: string) => { setFailed(false); const key = keyFor(href); if (titles[key.split('?')[0]!]) { setEntries(previous => new Map([...previous].filter(([, entry]) => Date.now() - entry.time < 5 * 60_000))); setPending(key); } }, []);
  const cancel = useCallback(() => setPending(null), []);
  const invalidate = useCallback(() => setEntries(new Map()), []);
  const fail = useCallback((retryAction: () => void) => {
    const controller = new AbortController();
    setRetry(() => retryAction);
    setFailed(true);
    // Re-check identity/permissions before retaining stale content after a failed read.
    fetch('/api/workspace-session', {cache: 'no-store', signal: controller.signal})
      .then(async response => {
        if (controller.signal.aborted) return;
        if (response.status === 401) { invalidate(); cancel(); window.location.assign('/login'); return; }
        if (!response.ok) { invalidate(); cancel(); return; }
        const result = await response.json();
        if (result.scope !== scope) { invalidate(); cancel(); window.location.reload(); }
      }).catch(() => { if (!controller.signal.aborted) { invalidate(); cancel(); } });
    return () => controller.abort();
  }, [scope, invalidate, cancel]);
  const register = useCallback((key: string, content: ReactNode) => {
    setFailed(false);
    setEntries(previous => {
      const next = new Map(previous);
      next.delete(key); next.set(key, { content, time: Date.now() });
      if (next.size > 20) next.delete(next.keys().next().value!);
      return next;
    });
    setPending(previous => previous === key ? null : previous);
  }, []);
  useEffect(() => {
    // Mutating forms must never resurrect a previously rendered list after a write.
    const submit = (event: Event) => {
      const form = event.target;
      if (form instanceof HTMLFormElement && form.method.toLowerCase() !== 'get') invalidate();
    };
    const clearPending = () => setPending(null);
    document.addEventListener('submit', submit, true);
    window.addEventListener('popstate', clearPending);
    window.addEventListener('workspace-cache-invalidate', invalidate);
    return () => { document.removeEventListener('submit', submit, true); window.removeEventListener('popstate', clearPending); window.removeEventListener('workspace-cache-invalidate', invalidate); };
  }, [invalidate]);
  return <Context.Provider value={{ begin, register, invalidate, cancel, failed, fail, retry, pending: titles[actualPath] ? pending : null, entries }}>{children}</Context.Provider>;
}

export function useNavigationCache() { return useContext(Context); }
export function useVisibleWorkspacePath() { const cache = useContext(Context); const path = usePathname(); return cache?.pending?.split('?')[0] ?? path; }

export function CachedWorkspacePage({ children }: { children: ReactNode }) {
  const cache = useContext(Context);
  const path = usePathname();
  const search = useSearchParams();
  const key = keyFor(path + '?' + search.toString());
  const register = cache?.register;
  useEffect(() => { register?.(key, children); }, [key, children, register]);
  return children;
}

export function NavigationCacheOutlet({ children }: { children: ReactNode }) {
  const cache = useContext(Context);
  const pending = cache?.pending;
  const entry = pending ? cache?.entries.get(pending) : undefined;
  const fresh = Boolean(entry);
  return <>
    {pending && fresh && cache?.failed ? <div role="alert" className="mx-10 mt-4 rounded-xl bg-muted px-4 py-3 text-sm">刷新失败，暂时显示上次内容。<button className="ml-3 underline" onClick={() => cache.retry?.()}>重试</button></div> : null}
    <div style={pending && !(cache?.failed && !fresh) ? { display: 'none' } : { display: 'contents' }}>{children}</div>
    {pending && !(cache?.failed && !fresh) ? fresh ? <div style={{ display: 'contents' }}>{entry?.content}</div> : <main className="px-5 py-8" aria-busy="true" aria-label="页面加载中"><section className="workspace-page-card rounded-3xl bg-card p-6"><h1 className="text-[32px] font-semibold">{titles[pending.split('?')[0]!]}</h1></section><div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">{[0,1,2,3,4,5].map(index => <div key={index} className="rounded-2xl bg-card p-6 motion-safe:animate-pulse"><div className="h-3 w-24 rounded-lg bg-muted" /><div className="my-6 h-8 w-20 rounded-lg bg-muted" /><div className="h-3 w-3/4 rounded-lg bg-muted" /></div>)}</div></main> : null}
  </>;
}
