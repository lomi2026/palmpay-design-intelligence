import { redirect } from 'next/navigation';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

type Overview = {
  periodDays: number;
  publishedAssets: number;
  publishedSkills: number;
  publishedCases: number;
  effectiveUsage30d: number;
  projectReferences30d: number;
  activeUsers30d: number;
  contributors: number;
  verifiedCases: number;
  favorites: number;
};
const metrics: Array<[keyof Overview, string]> = [
  ['publishedAssets', '已发布资产'],
  ['publishedSkills', '已发布 Skill'],
  ['publishedCases', '已发布案例'],
  ['effectiveUsage30d', '近 30 天有效使用'],
  ['projectReferences30d', '项目引用'],
  ['activeUsers30d', '活跃用户'],
  ['contributors', '内容贡献者'],
  ['verifiedCases', '已验证案例'],
  ['favorites', '累计收藏'],
];

export default async function OverviewPage() {
  const user = await loadCurrentUser();
  if (!user?.permissions.includes('analytics.read')) redirect('/unauthorized');
  const overview = await serverApiFetch<Overview>('/api/analytics/overview', {
    headers: await authenticatedApiHeaders(),
  });
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <p className="text-xs tracking-[.18em] text-white/45">VALUE OVERVIEW</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">价值总览</h1>
      <p className="mt-2 text-sm text-white/55">
        基于正式内容、行为事件和项目引用的真实口径。近 {overview.periodDays} 天。
      </p>
      <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map(([key, label]) => (
          <article className="rounded-xl border border-white/10 bg-white/[.035] p-5" key={key}>
            <p className="text-xs text-white/45">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-.05em]">{overview[key]}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
