import { ContentCard } from '@/components/content-card';
import { authenticatedApiHeaders } from '@/lib/auth';
import { WorkspacePageHero } from '@/components/workspace/workspace-page-hero';
import { serverApiFetch } from '@/lib/api';
import type { ContentCard as ContentCardData } from '@/lib/content-types';

export default async function RecentPage() {
  const result = await serverApiFetch<{
    items: Array<{ viewCount: number; lastViewedAt: string; content: ContentCardData }>;
  }>('/api/me/recent-views', { headers: await authenticatedApiHeaders() });
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <WorkspacePageHero description="仅显示你仍有权限访问的正式内容。每次进入内容详情都会更新这里的浏览记录。" eyebrow="PERSONAL SPACE" metric={{ value: result.items.length, label: '近期内容' }} title="延续刚刚开始的工作。" />
      {result.items.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
        <p className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-8 text-sm text-white/50">
          最近没有浏览记录。打开一项正式内容后，它会出现在这里。
        </p>
      )}
    </main>
  );
}
