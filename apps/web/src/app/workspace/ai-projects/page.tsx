import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import type { AIProjectCard } from '@/lib/ai-projects';
import type { ContentListResponse } from '@/lib/content-types';
import { AIProjectPortfolio } from '@/components/workspace/ai-project-portfolio';
import { CatalogFilterControls } from '@/components/workspace/catalog-filter-controls';

type AIProjectListResponse = Omit<ContentListResponse, 'items'> & { items: AIProjectCard[] };

export default async function AIProjectsPage({ searchParams }: { searchParams: Promise<{ search?: string; categoryId?: string; tag?: string; verificationStatus?: string }> }) {
  const { search = '', categoryId, tag, verificationStatus } = await searchParams;
  const filters = { search: search.trim() || undefined, categoryId, tag, verificationStatus };
  const currentUser = await loadCurrentUser();
  const canCreate = currentUser?.permissions.includes('content.create') ?? false;
  const query = new URLSearchParams({ type: 'AI_PROJECT', pageSize: '100' });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  const baseQuery = new URLSearchParams({ type: 'AI_PROJECT', pageSize: '100' });
  const [projects, filterSource] = await Promise.all([
    serverApiFetch<AIProjectListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() }),
    serverApiFetch<AIProjectListResponse>(`/api/contents?${baseQuery}`, { headers: await authenticatedApiHeaders() }),
  ]);

  return (
    <main className="px-5 py-8 md:px-8 md:py-10">
      <header className="border-b border-white/[.1] pb-7">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[.2em] text-white/45">AI PORTFOLIO</p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white">AI 项目库</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">围绕设计生产、增长运营、风险治理与组织能力沉淀的探索项目。项目状态与优先级需在真实试点中验证。</p>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
          <span className="rounded-full border border-white/[.11] bg-black/[.2] px-3 py-1.5">{projects.total} 个已发布项目</span>
          <span className="rounded-full border border-white/[.11] bg-black/[.2] px-3 py-1.5">数据来源：v9-1 已发布项目库</span>
          {search ? <span className="rounded-full border border-white/[.11] bg-black/[.2] px-3 py-1.5">搜索：{search}</span> : null}
        </div>
      </header>
      <CatalogFilterControls contents={filterSource.items} filters={filters} pathname="/workspace/ai-projects" searchPlaceholder="搜索项目编号、名称或摘要" />
      {projects.items.length ? (
        <AIProjectPortfolio projects={projects.items} />
      ) : <section className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center"><h2 className="text-base font-medium text-white">没有找到可访问的 AI 项目</h2><p className="mt-2 text-sm text-white/45">{search ? '请尝试缩短关键词或清除搜索条件。' : '项目发布后会显示在这里。'}</p></section>}
      {projects.items.length && canCreate ? <div className="mt-5 text-right"><Link className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white" href="/workspace/submit?type=AI_PROJECT">提交新项目 <ArrowRight className="size-4" /></Link></div> : null}
    </main>
  );
}
