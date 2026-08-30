import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, FilePenLine, Plus, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WorkspaceEmptyState } from '@/components/workspace/workspace-empty-state';
import { WorkspaceHeroMetric, WorkspacePageHero } from '@/components/workspace/workspace-page-hero';
import { WorkspaceStatusBadge } from '@/components/workspace/workspace-status-badge';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { contentTypeLabel } from '@/lib/content-types';

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
    return <main className="px-5 py-8 md:px-8 md:py-10"><h1 className="text-3xl font-semibold tracking-[-0.045em] text-white">我的贡献</h1><p className="mt-3 text-sm text-white/55">此页面仅对拥有内容创建权限的成员开放。</p></main>;
  }

  const contributions = await serverApiFetch<{ items: Contribution[]; total: number }>('/api/content-drafts', {
    headers: await authenticatedApiHeaders(),
  });
  const drafts = contributions.items.filter((item) => ['DRAFT', 'CHANGES_REQUESTED'].includes(item.draftVersion?.versionStatus ?? item.status)).length;
  const inReview = contributions.items.filter((item) => ['IN_REVIEW', 'APPROVED'].includes(item.draftVersion?.versionStatus ?? item.status)).length;
  const published = contributions.items.filter((item) => item.status === 'PUBLISHED').length;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <WorkspacePageHero description="集中管理由你负责的草稿、审核版本与已发布内容。管理员权限不会扩大此处的个人范围。" eyebrow="MY CONTRIBUTIONS" title="让每一次个人沉淀，都进入团队可维护的能力库。">
        <div className="flex flex-wrap items-center gap-3"><div className="grid grid-cols-3 gap-2">{[[drafts, '待完善'], [inReview, '审核中'], [published, '已发布']].map(([value, label]) => <WorkspaceHeroMetric key={label as string} label={label as string} value={value as number} />)}</div><Button asChild><Link href="/workspace/submit"><Plus className="size-4" /> 新建内容</Link></Button></div>
      </WorkspacePageHero>

      <div className="mt-5 flex items-center justify-between text-sm text-white/45">
        <span>共 {contributions.total} 项个人内容</span>
        <Link href="/workspace/submissions" className="text-white/70 transition hover:text-white">查看我的提交 →</Link>
      </div>

      {contributions.items.length ? (
        <div className="mt-4 grid gap-4">
          {contributions.items.map((item) => {
            const action = contributionAction(item);
            const permittedAction =
              action?.href.startsWith('/workspace/submit/') &&
              !user.permissions.includes('content.edit_own') &&
              !user.permissions.includes('content.edit_all')
                ? null
                : action;
            const effectiveStatus = item.draftVersion?.versionStatus ?? item.status;
            const versionNumber = item.draftVersion?.versionNumber ?? item.currentVersion?.versionNumber;
            return (
              <Card key={item.id} className="border-white/[.1] bg-[#111112] py-0 shadow-none transition hover:border-white/[.2] hover:bg-white/[.035]">
                <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] tracking-[0.1em] text-white/40">
                      <span>{contentTypeLabel(item.contentType)}</span>
                      <span>·</span>
                      <span>{item.team.name}</span>
                      {versionNumber ? <span>· V{versionNumber}</span> : null}
                    </div>
                    <h2 className="mt-2 truncate text-lg font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{item.summary || '暂未填写摘要。'}</p>
                    <p className="mt-3 text-xs text-white/35">更新于 {new Date(item.updatedAt).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                    <WorkspaceStatusBadge label={effectiveStatus === 'APPROVED' ? '待发布' : undefined} status={effectiveStatus} />
                    {permittedAction ? (
                      <Button asChild variant="outline" size="sm" className="border-white/15 bg-transparent text-white hover:bg-white/[0.07] hover:text-white">
                        <Link href={permittedAction.href}><permittedAction.icon className="size-4" /> {permittedAction.label}</Link>
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <WorkspaceEmptyState className="mt-5" icon={<FilePenLine className="size-8" />} title="还没有个人贡献">
          <p>从设计资产、AI Skill、案例或项目开始沉淀团队能力。</p>
          <Button asChild className="mt-5"><Link href="/workspace/submit">创建第一项内容</Link></Button>
        </WorkspaceEmptyState>
      )}
    </main>
  );
}
