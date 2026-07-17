import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { ReviewQueue } from './review-queue';

type Reviewer = { id: string; name: string; email: string };
type Review = { id: string; status: string; submitMessage: string | null; submittedAt: string; dueAt: string | null; isOverdue: boolean; content: { id: string; title: string; contentType: string; status: string }; version: { versionNumber: number; title: string; summary: string | null; changeSummary: string | null; body: unknown }; submittedBy: Reviewer; assignedReviewer: Reviewer | null; actions: Array<{ id: string; action: string; comment: string | null; createdAt: string; actor: Reviewer }> };

export default async function ReviewsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  if (!user.permissions.includes('review.process')) return <main className="px-5 py-8 md:px-8 md:py-10"><p className="text-xs tracking-[0.18em] text-violet-200/75">REVIEW CENTER</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">审核中心</h1><p className="mt-3 text-sm text-white/55">此页面仅对被授予审核权限的成员开放。</p></main>;
  const headers = await authenticatedApiHeaders();
  const [queue, reviewers] = await Promise.all([serverApiFetch<{ items: Review[] }>('/api/reviews/queue', { headers }), serverApiFetch<{ items: Reviewer[] }>('/api/reviews/reviewers', { headers })]);
  return <main className="px-5 py-8 md:px-8 md:py-10"><header className="border-b border-white/10 pb-7"><p className="text-xs tracking-[0.18em] text-violet-200/75">REVIEW CENTER</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">审核中心</h1><p className="mt-2 text-sm text-white/55">分配审核人、记录决定，并保留可追溯的审核历史。</p></header><ReviewQueue canPublish={user.permissions.includes('content.publish')} currentUserId={user.id} reviewers={reviewers.items} reviews={queue.items} /></main>;
}
