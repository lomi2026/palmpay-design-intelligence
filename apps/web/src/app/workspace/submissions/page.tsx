import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FilePenLine } from 'lucide-react';

import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspaceEmptyState } from '@/components/workspace/workspace-empty-state';
import { WorkspaceHeroMetric, WorkspacePageHero } from '@/components/workspace/workspace-page-hero';
import { WorkspaceStatusBadge } from '@/components/workspace/workspace-status-badge';
import { contentTypeLabel } from '@/lib/content-types';
import { submissionRevisionHref } from './submission-actions';

type Submission = {
  id: string;
  status: string;
  submitMessage: string | null;
  submittedAt: string;
  content: { id: string; title: string; contentType: string; status: string };
  version: {
    versionNumber: number;
    title: string;
    versionStatus: string;
    changeSummary: string | null;
  };
  assignedReviewer: { name: string; email: string } | null;
  actions: Array<{
    id: string;
    action: string;
    comment: string | null;
    createdAt: string;
    actor: { name: string };
  }>;
};

const actionLabels: Record<string, string> = {
  ASSIGN: '分配审核人',
  APPROVE: '通过',
  REQUEST_CHANGES: '要求修改',
  COMMENT: '内部备注',
  CANCEL: '取消',
};

export default async function SubmissionsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  if (!user.permissions.includes('content.submit')) {
    return (
      <main className="px-5 py-8 md:px-8 md:py-10">
        <h1 className="text-3xl font-semibold tracking-[-0.045em] text-white">我的投稿</h1>
        <p className="mt-3 text-sm text-white/55">此页面仅对拥有投稿权限的成员开放。</p>
      </main>
    );
  }

  const submissions = await serverApiFetch<{ items: Submission[] }>('/api/reviews/mine', {
    headers: await authenticatedApiHeaders(),
  });
  const pending = submissions.items.filter((item) => item.status === 'PENDING').length;
  const approved = submissions.items.filter((item) => item.status === 'APPROVED').length;
  const changesRequested = submissions.items.filter((item) => item.status === 'CHANGES_REQUESTED').length;
  const canEdit = user.permissions.includes('content.edit_own') || user.permissions.includes('content.edit_all');

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <WorkspacePageHero description="追踪已提交版本、审核人及历史意见。审核通过后仍需由具备发布权限的成员完成正式发布。" eyebrow="MY SUBMISSIONS" title="让每一个提交都有清晰的下一步。">
        <div className="grid grid-cols-3 gap-2">
          {[[pending, '审核中'], [changesRequested, '待修改'], [approved, '已通过']].map(([value, label]) => <WorkspaceHeroMetric key={label as string} label={label as string} value={value as number} />)}
        </div>
      </WorkspacePageHero>

      {submissions.items.length ? (
        <div className="mt-5 grid gap-3">
          {submissions.items.map((submission) => {
            const revisionHref = submissionRevisionHref(submission, canEdit);
            return (
              <Card className="border border-white/[.1] bg-[#111112] py-5 shadow-none transition hover:border-white/[.2] hover:bg-white/[.035]" key={submission.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] tracking-[0.14em] text-white/40">{contentTypeLabel(submission.content.contentType)} · v{submission.version.versionNumber}</p>
                      <CardTitle className="mt-2 text-[18px] text-white">{submission.version.title}</CardTitle>
                      <p className="mt-2 text-sm text-white/50">提交于 {new Date(submission.submittedAt).toLocaleString('zh-CN')} · 审核人：{submission.assignedReviewer?.name ?? '待分配'}</p>
                    </div>
                    <WorkspaceStatusBadge label={submission.status === 'PENDING' ? '审核中' : undefined} status={submission.status} />
                  </div>
                </CardHeader>
                {submission.submitMessage || submission.version.changeSummary ? (
                  <CardContent className="text-sm leading-6 text-white/65">{submission.submitMessage ?? submission.version.changeSummary}</CardContent>
                ) : null}
                <CardFooter className="mt-4 block border-white/10 bg-transparent px-5 pt-4">
                  <ol className="space-y-2">
                    {submission.actions.map((action) => (
                      <li className="text-sm" key={action.id}>
                        <span className="text-white/75">{action.actor.name} · {actionLabels[action.action] ?? action.action}</span>
                        {action.comment ? <span className="text-white/50">：{action.comment}</span> : null}
                      </li>
                    ))}
                  </ol>
                  {revisionHref ? (
                    <Button asChild variant="outline" size="sm" className="mt-4 border-white/15 bg-transparent text-white hover:bg-white/[0.07] hover:text-white">
                      <Link href={revisionHref}><FilePenLine className="size-4" /> 按意见修改</Link>
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <WorkspaceEmptyState className="mt-5">你还没有提交审核的内容。</WorkspaceEmptyState>
      )}
    </main>
  );
}
