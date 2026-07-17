import { Search } from 'lucide-react';
import { ContentCard } from '@/components/content-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import type { ContentListResponse } from '@/lib/content-types';
import { searchResultAction } from '../engagement-actions';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = '' } = await searchParams;
  const query = q.trim();
  const result = query
    ? await serverApiFetch<ContentListResponse & { searchLogId: string }>(
        `/api/search?q=${encodeURIComponent(query)}&pageSize=50`,
        { headers: await authenticatedApiHeaders() },
      )
    : null;
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <p className="text-xs tracking-[.18em] text-white/45">GLOBAL SEARCH</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">全局搜索</h1>
      <form className="mt-6 flex max-w-2xl gap-2">
        <Input
          name="q"
          defaultValue={query}
          placeholder="搜索资产、Skill、案例或项目"
          className="border-white/15 bg-white/[.04] text-white"
        />
        <Button type="submit">
          <Search />
          搜索
        </Button>
      </form>
      {result ? (
        <section className="mt-8">
          <p className="mb-5 text-sm text-white/50">
            “{query}”共找到 {result.total} 项可访问内容
          </p>
          {result.items.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {result.items.map((content) => (
                <div className="relative" key={content.id}>
                  <ContentCard content={content} />
                  <form action={searchResultAction} className="absolute inset-0">
                    <input type="hidden" name="searchLogId" value={result.searchLogId} />
                    <input type="hidden" name="contentId" value={content.id} />
                    <input
                      type="hidden"
                      name="href"
                      value={`/workspace/${content.contentType === 'DESIGN_ASSET' ? 'design-assets' : content.contentType === 'AI_SKILL' ? 'ai-skills' : content.contentType === 'AI_CASE' ? 'ai-cases' : 'ai-projects'}/${content.slug}`}
                    />
                    <button
                      aria-label={`打开 ${content.title}`}
                      className="absolute inset-0"
                      type="submit"
                    />
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 p-8 text-sm text-white/50">
              没有匹配内容。可以更换关键词、缩短描述，或创建新的内容需求。
            </p>
          )}
        </section>
      ) : (
        <p className="mt-8 text-sm text-white/50">
          输入关键词，在全部正式内容中搜索。结果会先按你的权限过滤。
        </p>
      )}
    </main>
  );
}
