import { Search } from 'lucide-react';
import { ContentCard } from '@/components/content-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import type { ContentListResponse } from '@/lib/content-types';
import { searchResultAction } from '../engagement-actions';
import { WorkspacePageHero } from '@/components/workspace/workspace-page-hero';
import { WorkspaceEmptyState } from '@/components/workspace/workspace-empty-state';

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
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <WorkspacePageHero description="在全部正式内容中搜索；结果会先按你的组织与权限范围过滤。" eyebrow="GLOBAL SEARCH" metric={result ? { value: result.total, label: '可访问结果' } : undefined} title="用一个关键词，找到可复用的团队经验。" />
      <form className="mt-5 flex max-w-3xl gap-2">
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
        <section className="mt-6">
          <p className="mb-5 text-sm text-white/50">
            “{query}”共找到 {result.total} 项可访问内容
          </p>
          {result.items.length ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
            <WorkspaceEmptyState>
              没有匹配内容。可以更换关键词、缩短描述，或创建新的内容需求。
            </WorkspaceEmptyState>
          )}
        </section>
      ) : (
        <WorkspaceEmptyState className="mt-6">
          输入关键词，在全部正式内容中搜索。结果会先按你的权限过滤。
        </WorkspaceEmptyState>
      )}
    </main>
  );
}
