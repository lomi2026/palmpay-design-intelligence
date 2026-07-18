import { redirect } from 'next/navigation';
import { ArrowDownRight, ArrowUpRight, BarChart3, Clock3, SearchX, ShieldCheck } from 'lucide-react';

import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

type Insights = {
  periodDays: number;
  contentStatus: Array<{ status: string; _count: number }>;
  typeDistribution: Array<{ contentType: string; _count: number }>;
  topSearches: Array<{ keyword: string; count: number }>;
  noResultSearches: Array<{ keyword: string; count: number }>;
  eventCounts: Array<{ eventType: string; count: number }>;
  staleContent: Array<{ id: string; title: string; updatedAt: string; contentType: string }>;
  governance: { averageReviewHours: number; returnRate: number };
};

const contentStatusLabels: Record<string, string> = { DRAFT: '草稿', IN_REVIEW: '审核中', PUBLISHED: '已发布', UNPUBLISHED: '已下架', ARCHIVED: '已归档' };
const contentTypeLabels: Record<string, string> = { DESIGN_ASSET: '设计资产', AI_SKILL: 'AI Skill', AI_CASE: 'AI 案例', AI_PROJECT: 'AI 项目' };
const eventLabels: Record<string, string> = { VIEW: '浏览详情', FAVORITE: '收藏内容', USE_CONFIRMED: '确认使用', PROJECT_REFERENCE: '项目引用', SEARCH: '全局搜索' };

function MetricList({
  eyebrow,
  title,
  items,
  label,
}: {
  eyebrow: string;
  title: string;
  items: Array<{ key: string; count: number }>;
  label: (key: string) => string;
}) {
  const maximum = Math.max(1, ...items.map((item) => item.count));
  return (
    <section className="rounded-[18px] border border-white/[.1] bg-[#111112] p-5 sm:p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/42">{eyebrow}</p>
      <h2 className="mt-2 text-[20px] font-semibold tracking-[-.035em] text-white">{title}</h2>
      <div className="mt-6 space-y-4">
        {items.length ? items.map((item) => <div key={item.key}><div className="flex items-center justify-between gap-3 text-[12px]"><span className="truncate text-white/62">{label(item.key)}</span><strong className="shrink-0 text-white">{item.count}</strong></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.09]"><div className="h-full rounded-full bg-white/75" style={{ width: `${Math.max(8, (item.count / maximum) * 100)}%` }} /></div></div>) : <p className="rounded-xl border border-dashed border-white/[.12] px-4 py-5 text-[12px] text-white/45">统计周期内暂无数据。</p>}
      </div>
    </section>
  );
}

export default async function InsightsPage() {
  const user = await loadCurrentUser();
  if (!user?.permissions.includes('analytics.read')) redirect('/unauthorized');
  const insights = await serverApiFetch<Insights>('/api/analytics/insights', {
    headers: await authenticatedApiHeaders(),
  });
  const noResultTotal = insights.noResultSearches.reduce((sum, item) => sum + item.count, 0);
  const topSearchTotal = insights.topSearches.reduce((sum, item) => sum + item.count, 0);
  const contentTotal = insights.typeDistribution.reduce((sum, item) => sum + item._count, 0);

  return (
    <main className="mx-auto min-h-full w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="flex flex-col justify-between gap-5 border-b border-white/[.1] pb-7 md:flex-row md:items-end">
        <div><p className="text-[11px] font-semibold uppercase tracking-[.2em] text-white/45">Data insights</p><h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white sm:text-[44px]">把团队行为转化为下一步治理决策。</h1><p className="mt-3 max-w-3xl text-[14px] leading-7 text-white/55">本页使用最近 {insights.periodDays} 天的搜索、内容状态、使用事件和审核数据。数字说明现状，不替代设计负责人对原因与行动的判断。</p></div>
        <Badge className="h-7 w-fit rounded-full border-white/[.12] bg-white/[.035] px-3 text-[11px] text-white/65" variant="outline">正式行为事件 · {insights.periodDays} 天</Badge>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[18px] border border-white/[.1] bg-white/[.03] p-5"><BarChart3 className="size-4 text-white/70" /><strong className="mt-8 block text-[37px] font-semibold leading-none tracking-[-.06em] text-white">{contentTotal}</strong><p className="mt-2 text-[13px] font-medium text-white">正式目录内容</p><p className="mt-1 text-[11px] text-white/45">按当前内容类型分布汇总</p></article>
        <article className="rounded-[18px] border border-white/[.1] bg-white/[.03] p-5"><ArrowUpRight className="size-4 text-white/70" /><strong className="mt-8 block text-[37px] font-semibold leading-none tracking-[-.06em] text-white">{topSearchTotal}</strong><p className="mt-2 text-[13px] font-medium text-white">有效搜索信号</p><p className="mt-1 text-[11px] text-white/45">可用于发现高频能力需求</p></article>
        <article className="rounded-[18px] border border-white/[.1] bg-white/[.03] p-5"><SearchX className="size-4 text-white/70" /><strong className="mt-8 block text-[37px] font-semibold leading-none tracking-[-.06em] text-white">{noResultTotal}</strong><p className="mt-2 text-[13px] font-medium text-white">无结果搜索</p><p className="mt-1 text-[11px] text-white/45">提示目录和标签可能存在缺口</p></article>
        <article className="rounded-[18px] border border-white/[.1] bg-white/[.03] p-5"><Clock3 className="size-4 text-white/70" /><strong className="mt-8 block text-[37px] font-semibold leading-none tracking-[-.06em] text-white">{insights.governance.averageReviewHours}<small className="ml-1 text-[16px] text-white/50">h</small></strong><p className="mt-2 text-[13px] font-medium text-white">平均审核耗时</p><p className="mt-1 text-[11px] text-white/45">退回率 {insights.governance.returnRate}%</p></article>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
        <MetricList eyebrow="Catalog health" items={insights.contentStatus.map((item) => ({ key: item.status, count: item._count }))} label={(key) => contentStatusLabels[key] ?? key} title="内容状态分布" />
        <MetricList eyebrow="Capability coverage" items={insights.typeDistribution.map((item) => ({ key: item.contentType, count: item._count }))} label={(key) => contentTypeLabels[key] ?? key} title="内容类型覆盖" />
        <MetricList eyebrow="Findability" items={insights.topSearches.map((item) => ({ key: item.keyword, count: item.count }))} label={(key) => key} title="团队最常搜索什么" />
        <MetricList eyebrow="Activity" items={insights.eventCounts.map((item) => ({ key: item.eventType, count: item.count }))} label={(key) => eventLabels[key] ?? key} title="核心行为信号" />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
        <section className="rounded-[20px] border border-white/[.1] bg-[#111112] p-5 sm:p-6"><div className="flex items-start gap-3"><SearchX className="mt-0.5 size-4 shrink-0 text-white/70" /><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/42">Search gap</p><h2 className="mt-2 text-[21px] font-semibold tracking-[-.035em] text-white">用户想找、但当前没有命中的能力</h2></div></div>{insights.noResultSearches.length ? <ul className="mt-6 divide-y divide-white/[.1] border-y border-white/[.1]">{insights.noResultSearches.map((item) => <li className="flex items-center justify-between gap-4 py-3.5 text-[13px]" key={item.keyword}><span className="text-white/70">{item.keyword}</span><Badge className="rounded-full border-white/[.12] bg-white/[.035] text-[10px] text-white/65" variant="outline">{item.count} 次</Badge></li>)}</ul> : <p className="mt-6 rounded-xl border border-dashed border-white/[.12] px-4 py-5 text-[12px] text-white/45">当前周期内没有记录到无结果搜索。</p>}</section>
        <section className="rounded-[20px] border border-white/[.1] bg-white p-6 text-black"><ShieldCheck className="size-5" /><p className="mt-8 text-[10px] font-semibold uppercase tracking-[.16em] text-black/50">Governance signal</p><h2 className="mt-3 text-[29px] font-semibold leading-[1.08] tracking-[-.05em]">审核速度与退回率都需要结合内容质量一起判断。</h2><dl className="mt-7 divide-y divide-black/15 border-y border-black/15 text-[13px]"><div className="flex justify-between py-3"><dt className="text-black/60">平均审核耗时</dt><dd className="font-semibold">{insights.governance.averageReviewHours} 小时</dd></div><div className="flex justify-between py-3"><dt className="text-black/60">退回率</dt><dd className="font-semibold">{insights.governance.returnRate}%</dd></div></dl></section>
      </section>

      <section className="mt-6 rounded-[20px] border border-white/[.1] bg-[#111112] p-5 sm:p-6"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/42">Maintenance queue</p><h2 className="mt-2 text-[21px] font-semibold tracking-[-.035em] text-white">长期未更新内容</h2>{insights.staleContent.length ? <ul className="mt-6 divide-y divide-white/[.1] border-y border-white/[.1]">{insights.staleContent.map((item) => <li className="flex flex-col justify-between gap-2 py-3.5 text-[13px] sm:flex-row sm:items-center" key={item.id}><div><strong className="font-medium text-white">{item.title}</strong><span className="ml-2 text-[11px] text-white/45">{contentTypeLabels[item.contentType] ?? item.contentType}</span></div><time className="text-[11px] text-white/45">最后更新：{new Intl.DateTimeFormat('zh-CN').format(new Date(item.updatedAt))}</time></li>)}</ul> : <p className="mt-5 rounded-xl border border-dashed border-white/[.12] px-4 py-5 text-[12px] text-white/45">暂无需要关注的长期未更新内容。</p>}</section>
    </main>
  );
}
