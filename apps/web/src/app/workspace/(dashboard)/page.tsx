import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  Copy,
  Gauge,
  Heart,
  Lightbulb,
  MousePointer2,
  Clock3,
  Search,
  Send,
  Upload,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { optionalServerApiFetch } from '@/lib/api';
import type { ContentCard as ContentCardData, ContentListResponse } from '@/lib/content-types';
import {
  buildDashboardTodos,
  type DashboardReview,
  type DashboardSubmission,
} from './dashboard-todos';

const journeySteps = [
  [Search, '发现', '搜索与推荐'],
  [MousePointer2, '使用', '复制与引用'],
  [Upload, '贡献', '提交与审核'],
  [Gauge, '衡量', '行为与价值'],
] as const;

type PersonalItems = { items: unknown[] };

const contentTypeLabels: Record<string, string> = {
  DESIGN_ASSET: '设计资产',
  AI_SKILL: 'AI Skill',
  AI_CASE: 'AI 案例',
  AI_PROJECT: 'AI 项目',
};

const verificationLabels: Record<string, string> = {
  UNVERIFIED: '未验证',
  INTERNAL_TRIAL: '内部试用',
  PILOT: '试点中',
  VERIFIED: '已验证',
  INVALIDATED: '已失效',
};

function emptyContentList(pageSize: number): ContentListResponse {
  return { items: [], page: 1, pageSize, total: 0 };
}

function contentHref(content: ContentCardData) {
  const routeSegment = content.contentType === 'DESIGN_ASSET'
    ? 'design-assets'
    : content.contentType === 'AI_SKILL'
      ? 'ai-skills'
      : content.contentType === 'AI_CASE'
        ? 'ai-cases'
        : 'ai-projects';
  return `/workspace/${routeSegment}/${content.slug}`;
}

function MetricCardsFallback() {
  return (
    <section className="mt-1.5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="正在加载工作台指标">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="min-h-48 rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none">
          <CardContent className="p-5">
            <div className="size-9 animate-pulse rounded-xl bg-white/[.06]" />
            <div className="mt-7 h-10 w-20 animate-pulse rounded bg-white/[.07]" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/[.06]" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded bg-white/[.045]" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function RecentUpdatesFallback() {
  return (
    <Card className="rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none" aria-label="正在加载最近更新">
      <CardContent className="p-5">
        <div className="h-5 w-24 animate-pulse rounded bg-white/[.08]" />
        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-white/[.05]" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div className="flex items-center gap-4 py-1" key={index}>
              <div className="size-9 shrink-0 animate-pulse rounded-lg bg-white/[.06]" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-3/5 animate-pulse rounded bg-white/[.07]" />
                <div className="mt-2 h-3 w-2/5 animate-pulse rounded bg-white/[.045]" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TodoFallback() {
  return (
    <Card className="rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none" aria-label="正在加载待办">
      <CardContent className="p-5">
        <div className="h-5 w-20 animate-pulse rounded bg-white/[.08]" />
        <div className="mt-2 h-3 w-36 animate-pulse rounded bg-white/[.05]" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="rounded-xl border border-white/[.1] bg-white/[.025] p-3.5" key={index}>
              <div className="h-4 w-4/5 animate-pulse rounded bg-white/[.07]" />
              <div className="mt-3 h-3 w-3/5 animate-pulse rounded bg-white/[.045]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

async function MetricCards() {
  const headers = await authenticatedApiHeaders();
  const [contents, projects, favorites, recent] = await Promise.all([
    optionalServerApiFetch<ContentListResponse>('/api/contents?pageSize=5', { headers }, emptyContentList(5)),
    optionalServerApiFetch<ContentListResponse>('/api/contents?type=AI_PROJECT&pageSize=1', { headers }, emptyContentList(1)),
    optionalServerApiFetch<PersonalItems>('/api/me/favorites', { headers }, { items: [] }),
    optionalServerApiFetch<PersonalItems>('/api/me/recent-views', { headers }, { items: [] }),
  ]);
  const metrics = [
    [BookOpenCheck, '正式目录', contents.total, '已发布内容', '按当前账号权限可见'],
    [Lightbulb, '机会组合', projects.total, 'AI 探索项目', '正式项目库'],
    [Heart, '个人空间', favorites.items.length, '我的收藏', '跨设备同步'],
    [Clock3, '个人空间', recent.items.length, '最近浏览', '仍有权限访问'],
  ] as const;

  return (
    <section className="mt-1.5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([Icon, scope, value, label, detail]) => (
        <Card key={label} className="min-h-48 rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none">
          <CardContent className="relative p-5"><span className="grid size-9 place-items-center rounded-xl bg-white/[.06] text-white/80"><Icon className="size-4" /></span><span className="absolute right-5 top-6 text-[11px] font-medium text-white/45">{scope}</span><strong className="mt-7 block text-[36px] tracking-[-.06em]">{value}</strong><p className="mt-1 text-[14px] font-semibold">{label}</p><p className="mt-1 text-[12px] text-white/45">{detail}</p></CardContent>
        </Card>
      ))}
    </section>
  );
}

async function RecentUpdates() {
  const headers = await authenticatedApiHeaders();
  const contents = await optionalServerApiFetch<ContentListResponse>('/api/contents?pageSize=5', { headers }, emptyContentList(5));

  return (
    <Card className="rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><div><h3 className="text-[18px] font-bold">最近更新</h3><p className="mt-1 text-[12px] text-white/45">经过审核并正式发布的内容</p></div><Button asChild variant="outline" size="sm" className="border-white/[.12] bg-transparent text-white hover:bg-white/[.07] hover:text-white"><Link href="/workspace/search">查看全部</Link></Button></div><div className="mt-5 divide-y divide-white/[.08]">{contents.items.map((item) => <Link href={contentHref(item)} className="flex items-center gap-4 py-4 transition hover:bg-white/[.025]" key={item.id}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[.06]"><Copy className="size-4 text-white/65" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-[13px]">{item.title}</strong><span className="mt-1 block truncate text-[11px] text-white/45">{contentTypeLabels[item.contentType]} · {item.team.name}</span></span><Badge variant="outline" className="hidden border-white/[.12] bg-white/[.03] text-[10px] text-white/70 sm:inline-flex">{verificationLabels[item.verificationStatus] ?? item.verificationStatus}</Badge><time className="text-[11px] text-white/40">{new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date(item.updatedAt))}</time></Link>)}</div></CardContent></Card>
  );
}

async function TodoCard({
  userId,
  canSubmit,
  canReview,
  canAssign,
}: {
  userId: string;
  canSubmit: boolean;
  canReview: boolean;
  canAssign: boolean;
}) {
  const headers = await authenticatedApiHeaders();
  const [submissions, reviewQueue] = await Promise.all([
    canSubmit
      ? optionalServerApiFetch<{ items: DashboardSubmission[] }>('/api/reviews/mine', { headers }, { items: [] })
      : Promise.resolve({ items: [] }),
    canReview || canAssign
      ? optionalServerApiFetch<{ items: DashboardReview[] }>('/api/reviews/queue', { headers }, { items: [] })
      : Promise.resolve({ items: [] }),
  ]);
  const todos = buildDashboardTodos({
    userId,
    submissions: submissions.items,
    reviewQueue: reviewQueue.items,
    canSubmit,
    canReview,
    canAssign,
  });

  return (
    <Card className="rounded-2xl border-white/[.12] bg-[#111112] py-0 shadow-none"><CardContent className="p-5"><h3 className="text-[18px] font-bold">我的待办</h3><p className="mt-1 text-[12px] text-white/45">只显示需要当前角色采取行动的事项</p><div className="mt-5 space-y-3">{todos.length ? todos.map((item) => <Link href={item.href} className="block rounded-xl border border-white/[.1] bg-white/[.025] p-3.5 transition hover:bg-white/[.05]" key={item.id}><strong className="block text-[13px]">{item.title}</strong><span className="mt-2 block text-[11px] text-white/45">{contentTypeLabels[item.contentType] ?? item.contentType} · {new Intl.DateTimeFormat('zh-CN').format(new Date(item.submittedAt))}</span><Badge variant="outline" className="mt-3 border-white/[.12] text-[10px] text-white/75">{item.label}</Badge></Link>) : <p className="rounded-xl border border-dashed border-white/[.12] p-4 text-[12px] leading-5 text-white/45">当前没有需要你处理的事项。</p>}</div><div className="mt-4 grid gap-2">{canSubmit ? <Button asChild variant="outline" className="w-full border-white/[.12] bg-transparent text-white hover:bg-white/[.07] hover:text-white"><Link href="/workspace/submissions"><ClipboardCheck className="size-4" /> 查看我的提交</Link></Button> : null}{canReview || canAssign ? <Button asChild variant="outline" className="w-full border-white/[.12] bg-transparent text-white hover:bg-white/[.07] hover:text-white"><Link href="/workspace/reviews"><ClipboardCheck className="size-4" /> 进入审核中心</Link></Button> : null}</div></CardContent></Card>
  );
}

export default async function WorkspacePage() {
  const user = await loadCurrentUser();
  const canCreate = user?.permissions.includes('content.create') ?? false;
  const canSubmit = user?.permissions.includes('content.submit') ?? false;
  const canReview = user?.permissions.includes('review.process') ?? false;
  const canAssign = user?.permissions.includes('review.assign') ?? false;
  return (
    <main id="root" className="v9-source-home mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1440px] bg-[#090909] px-4 pb-16 pt-6 text-[#f4f4f5] sm:px-6 lg:px-8">
      <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-.025em] sm:text-[30px]">工作台</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-white/50">查看最近使用、团队更新、贡献与待办。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user?.permissions.includes('analytics.read') ? <Button asChild variant="outline" className="h-9 border-white/[.14] bg-transparent px-4 text-white hover:bg-white/[.07] hover:text-white"><Link href="/workspace/overview"><Gauge className="size-4" /> 价值总览</Link></Button> : null}
          {canCreate ? <Button asChild className="h-9 bg-[var(--v9-strong)] px-4 font-bold text-[var(--v9-strong-foreground)] hover:bg-[var(--v9-strong)]">
            <Link href="/workspace/submit"><Send className="size-4" /> 提交内容</Link>
          </Button> : null}
        </div>
      </section>

      <section className="hero-panel mb-5 overflow-hidden rounded-2xl border border-white/[.14] bg-[radial-gradient(circle_at_82%_45%,rgba(255,255,255,.035),transparent_22%),#0d0d0e]">
        <div className="relative grid min-h-[300px] gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_.95fr] lg:p-10">
          <div className="relative z-10 flex flex-col justify-center">
            <div className="mb-5 flex items-center gap-3">
              <Image src="/v9-1/assets/nav-logo-20260710.png" alt="PalmPay Design" width={36} height={36} className="size-9 object-contain" />
              <p className="text-[13px] font-semibold leading-4">PalmPay Design<br /><span className="text-[10px] font-medium uppercase tracking-[.18em] text-white/55">Intelligence Hub</span></p>
              <Badge variant="outline" className="border-white/[.12] bg-white/[.04] text-white/75">Beta 1.0</Badge>
            </div>
            <h2 className="max-w-3xl text-3xl font-semibold leading-[1.12] tracking-[-.045em] sm:text-5xl">把团队经验，转化为可复用、可验证的设计能力。</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">设计资产、AI Skill 与实践案例不再分散在个人文件中，而是通过发现、使用、贡献与衡量形成持续增长的团队能力。</p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Button asChild size="lg" className="h-10 bg-[var(--v9-strong)] px-5 font-bold text-[var(--v9-strong-foreground)] hover:bg-[var(--v9-strong)]"><Link href="/workspace/design-assets">进入资产库 <ArrowRight className="size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="h-10 border-white/[.14] bg-transparent px-4 text-white hover:bg-white/[.07] hover:text-white"><Link href={user?.permissions.includes('analytics.read') ? '/workspace/overview' : '/workspace/ai-cases'}>查看价值证据</Link></Button>
            </div>
          </div>
          <div className="relative hidden min-h-[260px] items-center justify-center lg:flex lg:-translate-x-6">
            <div className="relative grid size-[250px] grid-cols-2 gap-3 rounded-[34px] border border-white/[.18] bg-white/[.025] p-4 shadow-2xl">
              {journeySteps.map(([Icon, title, body], index) => <div key={title} className={`flex flex-col justify-between rounded-2xl border border-white/[.12] bg-white/[.025] p-4 ${index === 0 ? 'translate-x-2 -translate-y-2' : ''} ${index === 3 ? '-translate-x-2 translate-y-2' : ''}`}><Icon className="size-5 text-white/85" /><div><strong className="block text-sm font-semibold">{title}</strong><p className="mt-1 text-[11px] text-white/45">{body}</p></div></div>)}
              <div className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-white/[.18] bg-[#090909] shadow-2xl"><Image src="/v9-1/assets/nav-logo-20260710.png" alt="" width={44} height={44} className="size-11 object-contain" /></div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-2 flex items-center justify-between"><span className="text-xs text-white/45">正式数据库实时数据 · 按账号权限过滤</span>{user?.permissions.includes('analytics.read') ? <Button asChild variant="ghost" size="sm" className="text-white/75 hover:bg-white/[.07] hover:text-white"><Link href="/workspace/insights">查看数据口径 <ArrowRight className="size-3" /></Link></Button> : null}</div>
      <Suspense fallback={<MetricCardsFallback />}>
        <MetricCards />
      </Suspense>

      <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,.8fr)]">
        <Suspense fallback={<RecentUpdatesFallback />}>
          <RecentUpdates />
        </Suspense>
        <Suspense fallback={<TodoFallback />}>
          {user ? <TodoCard userId={user.id} canSubmit={canSubmit} canReview={canReview} canAssign={canAssign} /> : <TodoFallback />}
        </Suspense>
      </section>
    </main>
  );
}
