import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { ReviewQueue } from './review-queue';
import { WorkspaceHeroMetric, WorkspacePageHero } from '@/components/workspace/workspace-page-hero';

type Reviewer = { id: string; name: string; email: string };
type Review = { id: string; status: string; submitMessage: string | null; submittedAt: string; dueAt: string | null; isOverdue: boolean; content: { id: string; title: string; contentType: string; status: string }; version: { versionNumber: number; title: string; summary: string | null; changeSummary: string | null; body: unknown }; submittedBy: Reviewer; assignedReviewer: Reviewer | null; actions: Array<{ id: string; action: string; comment: string | null; createdAt: string; actor: Reviewer }> };

export default async function ReviewsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  if (!user.permissions.includes('review.process')) return <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"><h1 className="text-[34px] font-semibold tracking-[-.055em] text-white">审核中心</h1><p className="mt-3 text-sm leading-6 text-white/55">此页面仅对被授予审核权限的成员开放。</p></main>;
  const headers = await authenticatedApiHeaders();
  const canAssign = user.permissions.includes('review.assign');
  const [queue, reviewers] = await Promise.all([
    serverApiFetch<{ items: Review[] }>('/api/reviews/queue', { headers }),
    canAssign
      ? serverApiFetch<{ items: Reviewer[] }>('/api/reviews/reviewers', { headers })
      : Promise.resolve({ items: [] }),
  ]);
  const pending = queue.items.filter((review) => review.status === 'PENDING').length;
  const mine = queue.items.filter((review) => review.status === 'PENDING' && review.assignedReviewer?.id === user.id).length;
  const overdue = queue.items.filter((review) => review.status === 'PENDING' && review.isOverdue).length;
  const description = `${canAssign ? '分配审核人、对比版本、记录决定并保留完整的审核历史。' : '查看待审队列和版本差异；审核操作仅在“待我审核”中提供。'} 审核通过不等于直接发布，管理员仍需进行最终发布。`;
  return <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"><WorkspacePageHero description={description} eyebrow="REVIEW CENTER" title="让内容质量具备可追溯的判断过程。"><div className="grid grid-cols-3 gap-2 sm:min-w-[300px]">{[['待处理', pending], ['待我审核', mine], ['已超时', overdue]].map(([label, value]) => <WorkspaceHeroMetric key={label as string} label={label as string} value={value as number} />)}</div></WorkspacePageHero><ReviewQueue canAssign={canAssign} canPublish={user.permissions.includes('content.publish')} currentUserId={user.id} initialFilter={canAssign ? 'pending' : 'mine'} reviewers={reviewers.items} reviews={queue.items} /></main>;
}
