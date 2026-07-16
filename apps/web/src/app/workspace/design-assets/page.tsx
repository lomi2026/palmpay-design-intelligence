import { ContentCard } from '@/components/content-card';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import type { ContentListResponse } from '@/lib/content-types';

export default async function DesignAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = '' } = await searchParams;
  const query = new URLSearchParams({ type: 'DESIGN_ASSET', pageSize: '24' });
  if (search.trim()) query.set('search', search.trim());
  const contents = await serverApiFetch<ContentListResponse>(`/api/contents?${query}`, {
    headers: await authenticatedApiHeaders(),
  });

  return (
    <main className="px-6 py-7 md:px-8 lg:px-10">
      <div className="flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-xs tracking-[0.18em] text-neutral-500">DESIGN ASSETS</p>
          <h1 className="mt-2 text-2xl font-semibold">设计资产</h1>
          <p className="mt-2 text-sm text-neutral-400">
            查找可直接复用的规范、模板、方法与工作流程。
          </p>
        </div>
        <form className="flex w-full max-w-sm gap-2" method="get">
          <label className="sr-only" htmlFor="asset-search">
            搜索设计资产
          </label>
          <input
            className="h-9 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-neutral-500"
            defaultValue={search}
            id="asset-search"
            name="search"
            placeholder="搜索标题或摘要"
            type="search"
          />
          <button
            className="h-9 rounded-md border border-neutral-600 px-3 text-sm hover:bg-neutral-900"
            type="submit"
          >
            搜索
          </button>
        </form>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-neutral-500">
        <span>{contents.total} 项已发布资产</span>
        {search ? <span>搜索：{search}</span> : null}
      </div>

      {contents.items.length ? (
        <section className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {contents.items.map((content) => (
            <ContentCard content={content} key={content.id} />
          ))}
        </section>
      ) : (
        <section className="mt-5 rounded-xl border border-dashed border-[var(--border)] px-6 py-16 text-center">
          <h2 className="text-base font-medium">没有找到可访问的设计资产</h2>
          <p className="mt-2 text-sm text-neutral-500">
            {search ? '请尝试缩短关键词或清除搜索条件。' : '正式内容发布后会显示在这里。'}
          </p>
        </section>
      )}
    </main>
  );
}
