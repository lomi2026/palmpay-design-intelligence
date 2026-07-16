import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { stageLabels, verificationLabels, type AIProjectCard } from '@/lib/ai-projects';
import type { ContentListResponse } from '@/lib/content-types';

type AIProjectListResponse = Omit<ContentListResponse, 'items'> & { items: AIProjectCard[] };

export default async function AIProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search = '' } = await searchParams;
  const query = new URLSearchParams({ type: 'AI_PROJECT', pageSize: '100' });
  if (search.trim()) query.set('search', search.trim());
  const projects = await serverApiFetch<AIProjectListResponse>(`/api/contents?${query}`, {
    headers: await authenticatedApiHeaders(),
  });

  return (
    <main className="px-6 py-7 md:px-8 lg:px-10">
      <header className="border-b border-[var(--border)] pb-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <p className="text-xs tracking-[0.18em] text-neutral-500">AI PORTFOLIO</p>
            <h1 className="mt-2 text-2xl font-semibold">AI 项目库</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
              围绕设计生产、增长运营、风险治理与组织能力沉淀的探索项目。项目状态与优先级需在真实试点中验证。
            </p>
          </div>
          <form className="flex w-full max-w-md gap-2" method="get">
            <label className="sr-only" htmlFor="project-search">
              搜索 AI 项目
            </label>
            <input
              className="h-9 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-neutral-500"
              defaultValue={search}
              id="project-search"
              name="search"
              placeholder="搜索项目编号、名称或摘要"
              type="search"
            />
            <button className="h-9 rounded-md border border-neutral-600 px-3 text-sm hover:bg-neutral-900" type="submit">
              搜索
            </button>
          </form>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500">
          <span>{projects.total} 个已发布项目</span>
          <span>数据来源：v9-1 已发布项目库</span>
          {search ? <span>搜索：{search}</span> : null}
        </div>
      </header>

      {projects.items.length ? (
        <section className="mt-5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="hidden grid-cols-[82px_minmax(250px,1.8fr)_minmax(130px,.8fr)_110px_96px] gap-4 border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3 text-xs font-medium tracking-wide text-neutral-500 lg:grid">
            <span>项目</span>
            <span>项目说明</span>
            <span>领域 / 目标</span>
            <span>阶段</span>
            <span>优先级</span>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {projects.items.map((project) => {
              const detail = project.projectDetail;
              const stage = detail ? stageLabels[detail.projectStage] : '待补充';
              return (
                <article
                  className="grid gap-3 px-5 py-4 transition hover:bg-white/[0.025] lg:grid-cols-[82px_minmax(250px,1.8fr)_minmax(130px,.8fr)_110px_96px] lg:items-center lg:gap-4"
                  key={project.id}
                >
                  <div className="flex items-center gap-2 lg:block">
                    <span className="font-mono text-sm font-medium text-neutral-200">{detail?.projectCode ?? '—'}</span>
                    <span className="lg:hidden text-xs text-neutral-500">{stage}</span>
                  </div>
                  <div>
                    <h2 className="text-base font-medium leading-6 text-neutral-100">
                      <Link className="hover:underline hover:underline-offset-4" href={`/workspace/ai-projects/${project.slug}`}>
                        {project.title}
                      </Link>
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-neutral-400">{project.summary ?? '暂无项目说明'}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs text-neutral-400">
                    <span className="rounded border border-[var(--border)] px-2 py-1">{detail?.domain ?? project.category?.name ?? '未分类'}</span>
                    {detail?.targetValue ? <span className="rounded border border-[var(--border)] px-2 py-1">{detail.targetValue}</span> : null}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-300">
                    <span className="hidden lg:inline-block h-1.5 w-1.5 rounded-full bg-neutral-500" />
                    {stage}
                  </div>
                  <div className="text-sm text-neutral-400">
                    {detail?.priority ?? 'MEDIUM'}
                    <span className="ml-2 text-xs text-neutral-600">{verificationLabels[project.verificationStatus] ?? project.verificationStatus}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="mt-5 rounded-lg border border-dashed border-[var(--border)] px-6 py-16 text-center">
          <h2 className="text-base font-medium">没有找到可访问的 AI 项目</h2>
          <p className="mt-2 text-sm text-neutral-500">{search ? '请尝试缩短关键词或清除搜索条件。' : '项目发布后会显示在这里。'}</p>
        </section>
      )}
    </main>
  );
}
