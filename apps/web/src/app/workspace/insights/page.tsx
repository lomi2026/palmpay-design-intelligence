import { redirect } from 'next/navigation';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

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
function List({
  title,
  items,
}: {
  title: string;
  items: Array<{
    keyword?: string;
    eventType?: string;
    status?: string;
    contentType?: string;
    count?: number;
    _count?: number;
  }>;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[.035] p-5">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        {items.length ? (
          items.map((item, index) => (
            <li
              className="flex justify-between gap-4"
              key={`${item.keyword ?? item.eventType ?? item.status ?? item.contentType}-${index}`}
            >
              <span>{item.keyword ?? item.eventType ?? item.status ?? item.contentType}</span>
              <span className="text-white">{item.count ?? item._count}</span>
            </li>
          ))
        ) : (
          <li>暂无数据</li>
        )}
      </ul>
    </section>
  );
}
export default async function InsightsPage() {
  const user = await loadCurrentUser();
  if (!user?.permissions.includes('analytics.read')) redirect('/unauthorized');
  const insights = await serverApiFetch<Insights>('/api/analytics/insights', {
    headers: await authenticatedApiHeaders(),
  });
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <p className="text-xs tracking-[.18em] text-white/45">DATA INSIGHTS</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">数据洞察</h1>
      <p className="mt-2 text-sm text-white/55">
        以最近 {insights.periodDays} 天行为和现有内容状态为基础。
      </p>
      <section className="mt-7 grid gap-4 md:grid-cols-2">
        <List title="内容状态" items={insights.contentStatus} />
        <List title="内容类型" items={insights.typeDistribution} />
        <List title="高频搜索" items={insights.topSearches} />
        <List title="无结果搜索" items={insights.noResultSearches} />
        <List title="核心行为" items={insights.eventCounts} />
        <section className="rounded-xl border border-white/10 bg-white/[.035] p-5">
          <h2 className="text-sm font-medium">治理效率</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/55">平均审核耗时</dt>
              <dd>{insights.governance.averageReviewHours} 小时</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/55">退回率</dt>
              <dd>{insights.governance.returnRate}%</dd>
            </div>
          </dl>
        </section>
      </section>
      <section className="mt-5 rounded-xl border border-white/10 bg-white/[.035] p-5">
        <h2 className="text-sm font-medium">长期未更新内容</h2>
        {insights.staleContent.length ? (
          <ul className="mt-4 divide-y divide-white/10">
            {insights.staleContent.map((item) => (
              <li className="flex justify-between gap-4 py-3 text-sm" key={item.id}>
                <span>{item.title}</span>
                <span className="text-white/45">
                  {new Intl.DateTimeFormat('zh-CN').format(new Date(item.updatedAt))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-white/50">暂无需要关注的长期未更新内容。</p>
        )}
      </section>
    </main>
  );
}
