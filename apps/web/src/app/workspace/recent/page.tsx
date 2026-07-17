import { ContentCard } from '@/components/content-card';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import type { ContentCard as ContentCardData } from '@/lib/content-types';

export default async function RecentPage() {
  const result = await serverApiFetch<{
    items: Array<{ viewCount: number; lastViewedAt: string; content: ContentCardData }>;
  }>('/api/me/recent-views', { headers: await authenticatedApiHeaders() });
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <p className="text-xs tracking-[.18em] text-white/45">PERSONAL SPACE</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">最近浏览</h1>
      <p className="mt-2 text-sm text-white/55">仅显示你仍有权限访问的正式内容。</p>
      {result.items.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map(({ content, viewCount, lastViewedAt }) => (
            <div key={content.id}>
              <ContentCard content={content} />
              <p className="mt-2 text-xs text-white/40">
                浏览 {viewCount} 次 ·{' '}
                {new Intl.DateTimeFormat('zh-CN').format(new Date(lastViewedAt))}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-white/15 p-8 text-sm text-white/50">
          最近没有浏览记录。打开一项正式内容后，它会出现在这里。
        </p>
      )}
    </main>
  );
}
