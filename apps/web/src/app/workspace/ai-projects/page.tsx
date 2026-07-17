import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { stageLabels, verificationLabels, type AIProjectCard } from '@/lib/ai-projects';
import type { ContentListResponse } from '@/lib/content-types';
import { CatalogPageHeader } from '@/components/workspace/catalog-page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

type AIProjectListResponse = Omit<ContentListResponse, 'items'> & { items: AIProjectCard[] };

export default async function AIProjectsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search = '' } = await searchParams;
  const query = new URLSearchParams({ type: 'AI_PROJECT', pageSize: '100' });
  if (search.trim()) query.set('search', search.trim());
  const projects = await serverApiFetch<AIProjectListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() });

  return (
    <main className="px-5 py-8 md:px-8 md:py-10">
      <CatalogPageHeader eyebrow="AI PORTFOLIO" title="AI 项目库" description="围绕设计生产、增长运营、风险治理与组织能力沉淀的探索项目。项目状态与优先级需在真实试点中验证。" search={search} searchId="project-search" searchPlaceholder="搜索项目编号、名称或摘要" count={`${projects.total} 个已发布项目`} source="数据来源：v9-1 已发布项目库" />
      {projects.items.length ? (
        <Card className="mt-5 overflow-hidden border border-white/10 bg-white/[0.035] py-0 shadow-none">
          <div className="hidden grid-cols-[90px_minmax(250px,1.8fr)_minmax(130px,.8fr)_110px_110px] gap-4 border-b border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-medium tracking-wide text-white/40 lg:grid"><span>项目</span><span>项目说明</span><span>领域 / 目标</span><span>阶段</span><span>优先级</span></div>
          <CardContent className="divide-y divide-white/10 p-0">
            {projects.items.map((project) => {
              const detail = project.projectDetail;
              const stage = detail ? stageLabels[detail.projectStage] : '待补充';
              return <article className="grid gap-3 px-5 py-5 transition hover:bg-white/[0.04] lg:grid-cols-[90px_minmax(250px,1.8fr)_minmax(130px,.8fr)_110px_110px] lg:items-center lg:gap-4" key={project.id}>
                <div className="flex items-center gap-2 lg:block"><span className="font-mono text-sm font-medium text-white/85">{detail?.projectCode ?? '—'}</span><span className="text-xs text-white/40 lg:hidden">{stage}</span></div>
                <div><h2 className="text-base font-medium leading-6 text-white"><Link className="hover:text-violet-200 hover:underline hover:underline-offset-4" href={`/workspace/ai-projects/${project.slug}`}>{project.title}</Link></h2><p className="mt-1 line-clamp-2 text-sm leading-6 text-white/55">{project.summary ?? '暂无项目说明'}</p></div>
                <div className="flex flex-wrap gap-1.5 text-xs"><Badge variant="outline" className="border-white/10 text-white/55">{detail?.domain ?? project.category?.name ?? '未分类'}</Badge>{detail?.targetValue ? <Badge variant="outline" className="border-white/10 text-white/45">{detail.targetValue}</Badge> : null}</div>
                <div className="flex items-center gap-2 text-sm text-white/65"><span className="hidden size-1.5 rounded-full bg-violet-300 lg:inline-block" />{stage}</div>
                <div className="text-sm text-white/60">{detail?.priority ?? 'MEDIUM'}<span className="ml-2 text-xs text-white/35">{verificationLabels[project.verificationStatus] ?? project.verificationStatus}</span></div>
              </article>;
            })}
          </CardContent>
        </Card>
      ) : <section className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center"><h2 className="text-base font-medium text-white">没有找到可访问的 AI 项目</h2><p className="mt-2 text-sm text-white/45">{search ? '请尝试缩短关键词或清除搜索条件。' : '项目发布后会显示在这里。'}</p></section>}
      {projects.items.length ? <div className="mt-5 text-right"><Link className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white" href="/workspace/submit">提交新项目 <ArrowRight className="size-4" /></Link></div> : null}
    </main>
  );
}
