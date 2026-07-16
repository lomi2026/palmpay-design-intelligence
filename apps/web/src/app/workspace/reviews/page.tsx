import { redirect } from 'next/navigation';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { ReviewQueue } from './review-queue';

type Reviewer = { id: string; name: string; email: string };
type Review = { id: string; status: string; submitMessage: string | null; submittedAt: string; content: { title: string; contentType: string; status: string }; version: { versionNumber: number; summary: string | null }; submittedBy: Reviewer; assignedReviewer: Reviewer | null };

export default async function ReviewsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  if (!user.permissions.includes('review.process')) return <main className="px-6 py-7 md:px-8 lg:px-10"><p className="text-xs tracking-[0.18em] text-neutral-500">REVIEW CENTER</p><h1 className="mt-2 text-2xl font-semibold">审核中心</h1><p className="mt-3 text-sm text-neutral-400">此页面仅对被授予审核权限的成员开放。</p></main>;
  const headers = await authenticatedApiHeaders();
  const [queue, reviewers] = await Promise.all([serverApiFetch<{ items: Review[] }>('/api/reviews/queue', { headers }), serverApiFetch<{ items: Reviewer[] }>('/api/reviews/reviewers', { headers })]);
  return <main className="px-6 py-7 md:px-8 lg:px-10"><header className="border-b border-[var(--border)] pb-6"><p className="text-xs tracking-[0.18em] text-neutral-500">REVIEW CENTER</p><h1 className="mt-2 text-2xl font-semibold">审核中心</h1><p className="mt-2 text-sm text-neutral-400">分配审核人、记录决定，并保留可追溯的审核历史。</p></header><ReviewQueue currentUserId={user.id} reviewers={reviewers.items} reviews={queue.items} /></main>;
}
