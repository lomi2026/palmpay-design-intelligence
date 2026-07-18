'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getImportedProjectBody, stageLabels, verificationLabels, type AIProjectCard, type ProjectStage } from '@/lib/ai-projects';

type FilterKey = 'domain' | 'value' | 'stage';

type FilterChipProps = {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

function FilterChip({ active, children, onClick }: FilterChipProps) {
  const activeStyle = active
    ? {
        backgroundColor: 'var(--v9-strong)',
        borderColor: 'var(--v9-strong)',
        color: 'var(--v9-strong-foreground)',
      }
    : undefined;

  return (
    <Button
      aria-pressed={active}
      className={cn(
        'h-8 rounded-full border px-3 text-[11px] font-medium transition',
        active
          ? 'hover:opacity-90'
          : 'border-white/[.12] bg-transparent text-white/55 hover:bg-white/[.07] hover:text-white',
      )}
      onClick={onClick}
      size="sm"
      style={activeStyle}
      type="button"
      variant="outline"
    >
      {children}
    </Button>
  );
}

function projectDomain(project: AIProjectCard) {
  return project.projectDetail?.domain ?? project.category?.name ?? '未分类';
}

function projectValue(project: AIProjectCard) {
  return project.projectDetail?.targetValue ?? '待补充';
}

function projectStage(project: AIProjectCard) {
  return project.projectDetail?.projectStage ?? 'EXPLORING';
}

function projectRank(project: AIProjectCard) {
  const rank = getImportedProjectBody(project.currentVersion?.body).prioritization?.rank;
  return typeof rank === 'number' && Number.isFinite(rank) ? rank : null;
}

export function AIProjectPortfolio({ projects }: { projects: AIProjectCard[] }) {
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    domain: '全部领域',
    value: '全部价值',
    stage: '全部阶段',
  });

  const options = useMemo(() => ({
    domain: ['全部领域', ...Array.from(new Set(projects.map(projectDomain)))],
    value: ['全部价值', ...Array.from(new Set(projects.map(projectValue)))],
    stage: ['全部阶段', ...Array.from(new Set(projects.map((project) => stageLabels[projectStage(project)])))],
  }), [projects]);

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const stage = stageLabels[projectStage(project)];
    return (filters.domain === '全部领域' || projectDomain(project) === filters.domain)
      && (filters.value === '全部价值' || projectValue(project) === filters.value)
      && (filters.stage === '全部阶段' || stage === filters.stage);
  }), [filters, projects]);

  function setFilter(type: FilterKey, value: string) {
    setFilters((current) => ({ ...current, [type]: value }));
  }

  const hasFilters = Object.values(filters).some((value) => !value.startsWith('全部'));
  const stageCounts = useMemo(() => ({
    ready: projects.filter((project) => ['READY', 'PILOTING'].includes(projectStage(project))).length,
    verified: projects.filter((project) => project.verificationStatus === 'VERIFIED').length,
    domains: new Set(projects.map(projectDomain)).size,
    values: new Set(projects.map(projectValue)).size,
  }), [projects]);
  const suggestedProjects = useMemo(() => projects
    .map((project) => ({ project, rank: projectRank(project) }))
    .filter((item): item is { project: AIProjectCard; rank: number } => item.rank !== null)
    .sort((left, right) => left.rank - right.rank)
    .slice(0, 4), [projects]);

  return (
    <section className="mt-6">
      <section className="border-y border-white/[.1] py-7 md:py-8" aria-labelledby="portfolio-overview-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-white/45">Portfolio overview</p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-[-.045em] text-white md:text-[30px]" id="portfolio-overview-title">项目探索组合</h2>
          </div>
          <p className="max-w-md text-[12px] leading-5 text-white/45">项目状态与优先级均来自已发布内容；建议优先验证不替代正式立项和审批。</p>
        </div>
        <div className="mt-5 grid gap-px overflow-hidden rounded-[18px] border border-white/[.1] bg-white/[.1] sm:grid-cols-2 lg:grid-cols-5">
          {[
            ['探索项目', projects.length, '已发布项目总数'],
            ['可进入验证', stageCounts.ready, '可立项或试点中'],
            ['已验证', stageCounts.verified, '已有验证结论'],
            ['探索领域', stageCounts.domains, '真实项目领域'],
            ['目标价值', stageCounts.values, '价值方向覆盖'],
          ].map(([label, value, caption]) => (
            <div className="min-w-0 bg-[#101011] px-4 py-4" key={label}>
              <p className="text-[10px] font-semibold tracking-[.1em] text-white/42">{label}</p>
              <p className="mt-2 text-[28px] font-semibold leading-none tracking-[-.055em] text-white">{value}</p>
              <p className="mt-2 truncate text-[10px] text-white/42" title={String(caption)}>{caption}</p>
            </div>
          ))}
        </div>
        {suggestedProjects.length ? <div className="mt-7"><div className="flex items-center gap-2 text-[12px] font-medium text-white/65"><Sparkles className="size-3.5" />建议优先验证</div><div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{suggestedProjects.map(({ project, rank }) => <Link className="group rounded-[16px] border border-white/[.1] bg-white/[.025] p-4 transition hover:border-white/[.25] hover:bg-white/[.055]" href={`/workspace/ai-projects/${project.slug}`} key={project.id}><div className="flex items-center justify-between gap-3"><span className="font-mono text-[11px] font-semibold tracking-[.08em] text-white/65">{project.projectDetail?.projectCode ?? 'AI'}</span><span className="text-[10px] text-white/42">优先级 #{rank}</span></div><h3 className="mt-5 line-clamp-2 min-h-10 text-[15px] font-semibold leading-5 tracking-[-.025em] text-white">{project.title}</h3><p className="mt-2 line-clamp-2 text-[11px] leading-5 text-white/48">{project.summary ?? '尚未补充项目摘要。'}</p><span className="mt-4 inline-flex items-center gap-1 text-[11px] text-white/55 transition group-hover:text-white">查看项目 <ArrowUpRight className="size-3.5" /></span></Link>)}</div></div> : null}
      </section>
      <div className="overflow-hidden rounded-[20px] border border-white/[.11] bg-[#101011]">
        <div className="flex flex-col gap-5 border-b border-white/[.1] px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[12px] font-medium text-white/65"><SlidersHorizontal className="size-3.5" />按探索维度筛选</div>
            <div className="text-[12px] text-white/45">显示 <strong className="font-semibold text-white">{filteredProjects.length}</strong> / {projects.length} 个项目</div>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {(['domain', 'value', 'stage'] as const).map((type) => (
              <div className="flex flex-wrap items-center gap-2" key={type}>
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-[.12em] text-white/40">{type === 'domain' ? '领域' : type === 'value' ? '目标价值' : '项目阶段'}</span>
                {options[type].map((option) => <FilterChip active={filters[type] === option} key={option} onClick={() => setFilter(type, option)}>{option}</FilterChip>)}
              </div>
            ))}
          </div>
        </div>

        {filteredProjects.length ? (
          <div className="grid divide-y divide-white/[.1]">
            {filteredProjects.map((project) => {
              const detail = project.projectDetail;
              const stage = stageLabels[projectStage(project) as ProjectStage];
              const priority = detail?.priority ?? 'MEDIUM';
              return (
                <article className="group grid gap-4 px-5 py-5 transition hover:bg-white/[.035] md:grid-cols-[84px_minmax(0,1fr)_minmax(168px,.42fr)_auto] md:items-center md:gap-6 md:px-6" key={project.id}>
                  <div className="flex items-center justify-between gap-3 md:block">
                    <span className="font-mono text-[13px] font-semibold tracking-[.08em] text-white">{detail?.projectCode ?? 'AI'}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-white/45"><span className="size-1.5 rounded-full bg-white/60" />{stage}</span>
                  </div>
                  <div className="min-w-0">
                    <Link className="inline-flex items-start gap-2 text-[17px] font-semibold leading-6 tracking-[-.025em] text-white transition group-hover:text-white/80" href={`/workspace/ai-projects/${project.slug}`}>
                      <span>{project.title}</span><ArrowUpRight className="mt-1 size-4 shrink-0 text-white/45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                    </Link>
                    <p className="mt-1.5 max-w-3xl text-[13px] leading-6 text-white/52">{project.summary ?? '暂无项目说明'}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:justify-start">
                    <Badge className="rounded-full border-white/[.12] bg-white/[.035] px-2.5 text-[10px] font-medium text-white/65" variant="outline">{projectDomain(project)}</Badge>
                    <Badge className="rounded-full border-white/[.12] bg-white/[.035] px-2.5 text-[10px] font-medium text-white/65" variant="outline">{projectValue(project)}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-white/48 md:justify-end"><CheckCircle2 className="size-3.5" />{verificationLabels[project.verificationStatus] ?? project.verificationStatus}<span className="rounded-full border border-white/[.12] px-2 py-0.5 font-mono text-[10px] text-white/60">{priority}</span></div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-white">没有符合当前筛选条件的项目</p>
            <p className="mt-2 text-[13px] text-white/45">可清除筛选，查看所有已发布的项目探索方向。</p>
            {hasFilters ? <Button className="mt-5 border-white/[.14] bg-transparent text-white hover:bg-white/[.07] hover:text-white" onClick={() => setFilters({ domain: '全部领域', value: '全部价值', stage: '全部阶段' })} variant="outline">清除筛选</Button> : null}
          </div>
        )}
      </div>
    </section>
  );
}
