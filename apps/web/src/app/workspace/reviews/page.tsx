import { redirect } from 'next/navigation';
import { CheckCircle2, Clock3, FileClock } from 'lucide-react';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { ReviewQueue } from './review-queue';

type Reviewer = { id: string; name: string; email: string };
type Review = { id: string; status: string; submitMessage: string | null; submittedAt: string; dueAt: string | null; isOverdue: boolean; content: { id: string; title: string; contentType: string; status: string }; version: { versionNumber: number; title: string; summary: string | null; changeSummary: string | null; body: unknown }; submittedBy: Reviewer; assignedReviewer: Reviewer | null; actions: Array<{ id: string; action: string; comment: string | null; createdAt: string; actor: Reviewer }> };

export default async function ReviewsPage() {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  if (!user.permissions.includes('review.process')) return <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"><p className="text-[11px] font-semibold tracking-[.2em] text-white/45">REVIEW CENTER</p><h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white">审核中心</h1><p className="mt-3 text-sm leading-6 text-white/55">此页面仅对被授予审核权限的成员开放。</p></main>;
  const headers = await authenticatedApiHeaders();
  const [queue, reviewers] = await Promise.all([serverApiFetch<{ items: Review[] }>('/api/reviews/queue', { headers }), serverApiFetch<{ items: Reviewer[] }>('/api/reviews/reviewers', { headers })]);
  const pending = queue.items.filter((review) => review.status === 'PENDING').length;
  const mine = queue.items.filter((review) => review.status === 'PENDING' && review.assignedReviewer?.id === user.id).length;
  const overdue = queue.items.filter((review) => review.status === 'PENDING' && review.isOverdue).length;
  return <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"><header className="relative overflow-hidden rounded-[22px] border border-white/[.11] bg-[#111112] px-6 py-7 sm:px-8"><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" /><div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><div><p className="text-[11px] font-semibold tracking-[.2em] text-white/45">REVIEW CENTER</p><h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white">让内容质量具备可追溯的判断过程。</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">分配审核人、对比版本、记录决定并保留完整的审核历史。审核通过不等于直接发布，管理员仍需进行最终发布。</p></div><div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">{[[FileClock, '待处理', pending], [Clock3, '待我审核', mine], [CheckCircle2, '已超时', overdue]].map(([Icon, label, value]) => { const MetricIcon = Icon as typeof FileClock; return <div className="rounded-[14px] border border-white/[.1] bg-black/[.22] p-3.5" key={label as string}><MetricIcon className="size-3.5 text-white/65" /><strong className="mt-5 block text-[26px] font-semibold leading-none tracking-[-.05em] text-white">{value as number}</strong><span className="mt-1 block text-[10px] text-white/45">{label as string}</span></div>; })}</div></div></header><ReviewQueue canPublish={user.permissions.includes('content.publish')} currentUserId={user.id} reviewers={reviewers.items} reviews={queue.items} /></main>;
}
