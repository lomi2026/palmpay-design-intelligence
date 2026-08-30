import { ContentCard } from '@/components/content-card';
import { FavoriteControl } from '@/components/workspace/engagement-controls';
import { WorkspacePageHero } from '@/components/workspace/workspace-page-hero';
import { WorkspaceEmptyState } from '@/components/workspace/workspace-empty-state';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import type { ContentCard as ContentCardData } from '@/lib/content-types';

export default async function FavoritesPage() {
  const result = await serverApiFetch<{
    items: Array<{ createdAt: string; content: ContentCardData }>;
  }>('/api/me/favorites', { headers: await authenticatedApiHeaders() });
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <WorkspacePageHero description="收藏会同步到你的正式账号，可在其他设备继续使用；仅展示你仍具备访问权限的团队内容。" eyebrow="PERSONAL SPACE" metric={{ value: result.items.length, label: '已收藏内容' }} title="把值得复用的方法留在手边。" />
      {result.items.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {result.items.map(({ content }) => (
            <div key={content.id}>
              <ContentCard content={content} />
              <div className="mt-2">
                <FavoriteControl contentId={content.id} active returnTo="/workspace/favorites" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <WorkspaceEmptyState className="mt-5">
          还没有收藏内容。浏览资产、Skill、案例或项目时可以加入收藏。
        </WorkspaceEmptyState>
      )}
    </main>
  );
}
