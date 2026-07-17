import { ContentCard } from '@/components/content-card';
import { FavoriteControl } from '@/components/workspace/engagement-controls';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import type { ContentCard as ContentCardData } from '@/lib/content-types';

export default async function FavoritesPage() {
  const result = await serverApiFetch<{
    items: Array<{ createdAt: string; content: ContentCardData }>;
  }>('/api/me/favorites', { headers: await authenticatedApiHeaders() });
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <p className="text-xs tracking-[.18em] text-white/45">PERSONAL SPACE</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">我的收藏</h1>
      <p className="mt-2 text-sm text-white/55">收藏会同步到你的正式账号，可在其他设备继续使用。</p>
      {result.items.length ? (
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
        <p className="mt-8 rounded-xl border border-dashed border-white/15 p-8 text-sm text-white/50">
          还没有收藏内容。浏览资产、Skill、案例或项目时可以加入收藏。
        </p>
      )}
    </main>
  );
}
