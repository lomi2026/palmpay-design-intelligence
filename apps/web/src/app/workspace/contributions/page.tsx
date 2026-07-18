import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, FilePenLine, Plus, Send } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

type VersionSummary = {
  id: string;
  versionNumber: number;
  versionStatus: string;
  versionLabel: string | null;
};

type Contribution = {
  id: string;
  contentType: string;
  title: string;
  slug: string;
  summary: string | null;
  status: string;
  verificationStatus: string;
  updatedAt: string;
  category: { id: string; name: string } | null;
  team: { id: string; name: string };
  currentVersion: VersionSummary | null;
  draftVersion: VersionSummary | null;
  reviewRequests: Array<{ id: string; status: string; submittedAt: string }>;
};

const contentTypeLabels: Record<string, string> = {
  DESIGN_ASSET: '设计资产',
  AI_SKILL: 'AI Skill',
  AI_CASE: 'AI 案例',
  AI_PROJECT: 'AI 项目',
};

const statusLabels: Record<string, string> = {
  DRAFT: '草稿',
  IN_REVIEW: '审核中',
  CHANGES_REQUESTED: '待修改',
  APPROVED: '待发布',
  PUBLISHED: '已发布',
  UNPUBLISHED: '已下架',
  ARCHIVED: '已归档',
};

const detailSegments: Record<string, string> = {
  DESIGN_ASSET: 'design-assets',
  AI_SKILL: 'ai-skills',
  AI_CASE: 'ai-cases',
  AI_PROJECT: 'ai-projects',
};

function contributionAction(item: Contribution) {
  const draftStatus = item.draftVersion?.versionStatus;
  if (draftStatus === 'DRAFT' || draftStatus === 'CHANGES_REQUESTED') {
    return { href: `/workspace/submit/${item.id}`, label: draftStatus === 'CHANGES_REQUESTED' ? '按意见修改' : '继续编辑', icon: FilePenLine };
  }
  if (draftStatus === 'IN_REVIEW' || draftStatus === 'APPROVED') {
    return { href: '/workspace/submissions', label: '查看审核进度', icon: Send };
  }
  if (item.currentVersion && detailSegments[item.contentType]) {
    return { href: `/workspace/${detailSegments[item.contentType]}/${item.slug}`, label: '查看已发布内容', icon: ArrowRight };
  }
  return null;
}

export default async function ContributionsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  if (!user.permissions.includes('content.create')) {
    return <main className="px-5 py-8 md:px-8 md:py-10"><p className="text-xs tracking-[0.18em] text-violet-200/75">MY CONTRIBUTIONS</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">我的贡献</h1><p className="mt-3 text-sm text-white/55">此页面仅对拥有内容创建权限的成员开放。</p></main>;
  }

  const contributions = await serverApiFetch<{ items: Contribution[]; total: number }>('/api/content-drafts', {
    headers: await authenticatedApiHeaders(),
  });
  const drafts = contributions.items.filter((item) => ['DRAFT', 'CHANGES_REQUESTED'].includes(item.draftVersion?.versionStatus ?? item.status)).length;
  const inReview = contributions.items.filter((item) => ['IN_REVIEW', 'APPROVED'].includes(item.draftVersion?.versionStatus ?? item.status)).length;
  const published = contributions.items.filter((item) => item.status === 'PUBLISHED').length;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <header className="relative overflow-hidden rounded-[22px] border border-white/[.11] bg-[#111112] px-6 py-7 sm:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><p className="text-[11px] font-semibold tracking-[.2em] text-white/45">MY CONTRIBUTIONS</p><h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white">让每一次个人沉淀，都进入团队可维护的能力库。</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">集中管理由你负责的草稿、审核版本与已发布内容。管理员权限不会扩大此处的个人范围。</p></div><div className="flex flex-wrap items-center gap-3"><div className="grid grid-cols-3 gap-2">{[[drafts, '待完善'], [inReview, '审核中'], [published, '已发布']].map(([value, label]) => <div className="min-w-[78px] rounded-[13px] border border-white/[.1] bg-black/[.22] p-3" key={label as string}><strong className="block text-[22px] leading-none tracking-[-.05em] text-white">{value as number}</strong><span className="mt-2 block text-[10px] text-white/45">{label as string}</span></div>)}</div><Button asChild className="bg-white font-semibold text-black hover:bg-white/90"><Link href="/workspace/submit"><Plus className="size-4" /> 新建内容</Link></Button></div></div>
      </header>

      <div className="mt-5 flex items-center justify-between text-sm text-white/45">
        <span>共 {contributions.total} 项个人内容</span>
        <Link href="/workspace/submissions" className="text-white/70 transition hover:text-white">查看我的提交 →</Link>
      </div>

      {contributions.items.length ? (
        <div className="mt-4 grid gap-4">
          {contributions.items.map((item) => {
            const action = contributionAction(item);
            const effectiveStatus = item.draftVersion?.versionStatus ?? item.status;
            const versionNumber = item.draftVersion?.versionNumber ?? item.currentVersion?.versionNumber;
            return (
              <Card key={item.id} className="border-white/[.1] bg-[#111112] py-0 shadow-none transition hover:border-white/[.2] hover:bg-white/[.035]">
                <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.1em] text-white/40">
                      <span>{contentTypeLabels[item.contentType] ?? item.contentType}</span>
                      <span>·</span>
                      <span>{item.team.name}</span>
                      {versionNumber ? <span>· V{versionNumber}</span> : null}
                    </div>
                    <h2 className="mt-2 truncate text-lg font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{item.summary || '暂未填写摘要。'}</p>
                    <p className="mt-3 text-xs text-white/35">更新于 {new Date(item.updatedAt).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <Badge variant="outline" className="border-white/15 text-white/70">{statusLabels[effectiveStatus] ?? effectiveStatus}</Badge>
                    {action ? (
                      <Button asChild variant="outline" size="sm" className="border-white/15 bg-transparent text-white hover:bg-white/[0.07] hover:text-white">
                        <Link href={action.href}><action.icon className="size-4" /> {action.label}</Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <FilePenLine className="mx-auto size-8 text-white/35" />
          <h2 className="mt-4 text-lg font-semibold text-white">还没有个人贡献</h2>
          <p className="mt-2 text-sm text-white/45">从设计资产、AI Skill、案例或项目开始沉淀团队能力。</p>
          <Button asChild className="mt-5 bg-white font-semibold text-black hover:bg-white/90"><Link href="/workspace/submit">创建第一项内容</Link></Button>
        </div>
      )}
    </main>
  );
}
