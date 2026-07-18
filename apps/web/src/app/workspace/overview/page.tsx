import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BookOpenCheck, ChartNoAxesCombined, Heart, Lightbulb, MousePointer2, UsersRound } from 'lucide-react';

import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';

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

const contentMetrics: Array<[keyof Overview, string, string]> = [
  ['publishedAssets', '设计资产', '被治理并进入正式目录'],
  ['publishedSkills', 'AI Skill', '可复用的工作方法'],
  ['publishedCases', 'AI 案例', '含人工判断与验证依据'],
];

export default async function OverviewPage() {
  const user = await loadCurrentUser();
  if (!user?.permissions.includes('analytics.read')) redirect('/unauthorized');
  const overview = await serverApiFetch<Overview>('/api/analytics/overview', {
    headers: await authenticatedApiHeaders(),
  });
  const evidenceMetrics = [
    [MousePointer2, '有效使用', overview.effectiveUsage30d, '近 30 天被确认的使用行为'],
    [Lightbulb, '项目引用', overview.projectReferences30d, '探索项目对内容的正式引用'],
    [UsersRound, '活跃成员', overview.activeUsers30d, '近 30 天产生行为的成员'],
    [Heart, '累计收藏', overview.favorites, '跨设备同步的个人保存'],
  ] as const;

  return (
    <main className="mx-auto min-h-full w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden rounded-[24px] border border-white/[.12] bg-[#111112] px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-11">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-45" />
        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1fr)_410px] xl:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.2em] text-white/48">Value overview · Formal evidence</p>
            <h1 className="mt-4 max-w-3xl text-[34px] font-semibold leading-[1.08] tracking-[-.055em] text-white sm:text-[46px]">把内容沉淀、真实复用与项目引用放在同一套价值口径里。</h1>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-white/55">以下数据来自正式内容目录、行为事件和项目引用记录；统计周期为最近 {overview.periodDays} 天，不混入静态演示数据。</p>
          </div>
          <div className="rounded-[18px] border border-white/[.12] bg-black/[.24] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-white/45">核心复用证据</p>
            <strong className="mt-3 block text-[52px] font-semibold leading-none tracking-[-.07em] text-white">{overview.effectiveUsage30d}</strong>
            <p className="mt-2 text-[13px] text-white/55">近 {overview.periodDays} 天有效使用</p>
            <div className="mt-5 h-px bg-white/[.12]" />
            <p className="mt-4 text-[12px] leading-5 text-white/45">使用确认不是浏览或收藏；仅在成员明确记录了实际复用后计入该指标。</p>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 md:grid-cols-3">
        {contentMetrics.map(([key, label, detail]) => (
          <article className="rounded-[18px] border border-white/[.1] bg-white/[.03] p-5" key={key}>
            <p className="text-[11px] font-semibold tracking-[.1em] text-white/45">{label}</p>
            <strong className="mt-5 block text-[42px] font-semibold leading-none tracking-[-.06em] text-white">{overview[key]}</strong>
            <p className="mt-3 text-[12px] text-white/48">{detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,.8fr)]">
        <div className="rounded-[20px] border border-white/[.1] bg-[#111112] p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/45">Reuse and engagement</p><h2 className="mt-2 text-[25px] font-semibold tracking-[-.04em] text-white">从目录到真实使用</h2></div><Button asChild className="border-white/[.14] bg-transparent text-white hover:bg-white/[.07] hover:text-white" size="sm" variant="outline"><Link href="/workspace/insights">查看数据洞察 <ArrowRight className="size-3.5" /></Link></Button></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {evidenceMetrics.map(([Icon, label, value, detail]) => <article className="rounded-[16px] border border-white/[.1] bg-white/[.025] p-4" key={label}><Icon className="size-4 text-white/70" /><strong className="mt-6 block text-[30px] font-semibold leading-none tracking-[-.05em] text-white">{value}</strong><p className="mt-2 text-[13px] font-medium text-white">{label}</p><p className="mt-1 text-[11px] leading-5 text-white/45">{detail}</p></article>)}
          </div>
        </div>
        <aside className="flex flex-col justify-between rounded-[20px] border border-white/[.1] bg-white p-6 text-black sm:p-7">
          <div><BookOpenCheck className="size-5" /><p className="mt-8 text-[11px] font-semibold uppercase tracking-[.15em] text-black/55">Content health</p><h2 className="mt-3 text-[30px] font-semibold leading-[1.08] tracking-[-.05em]">{overview.verifiedCases} 个案例已经有验证证据</h2><p className="mt-4 text-[13px] leading-6 text-black/60">有效的案例需要说明 AI 如何介入、设计师在哪里判断，以及结果如何被验证。</p></div>
          <div className="mt-8 border-t border-black/15 pt-5"><div className="flex items-center justify-between text-[12px]"><span className="text-black/55">内容贡献者</span><strong>{overview.contributors}</strong></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-black" style={{ width: `${Math.min(100, overview.contributors ? (overview.verifiedCases / overview.contributors) * 100 : 0)}%` }} /></div></div>
        </aside>
      </section>

      <section className="mt-5 flex flex-col justify-between gap-4 rounded-[18px] border border-white/[.1] bg-white/[.025] px-5 py-5 sm:flex-row sm:items-center sm:px-6"><div><p className="text-[13px] font-semibold text-white">下一步：把有效复用沉淀为可追溯的项目证据</p><p className="mt-1 text-[12px] text-white/45">成员可在内容详情中确认使用，或将内容关联到 AI 项目，再由管理者评估结果。</p></div><Button asChild className="shrink-0 bg-white text-black hover:bg-white/90"><Link href="/workspace/ai-projects">查看 AI 项目库 <ChartNoAxesCombined className="size-4" /></Link></Button></section>
    </main>
  );
}
