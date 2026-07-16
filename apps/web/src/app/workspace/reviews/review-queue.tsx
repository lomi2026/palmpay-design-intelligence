'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { approveReviewAction, assignReviewAction, requestChangesAction, type ReviewActionState } from './actions';

type Reviewer = { id: string; name: string; email: string };
type Review = {
  id: string; status: string; submitMessage: string | null; submittedAt: string;
  content: { title: string; contentType: string; status: string };
  version: { versionNumber: number; summary: string | null };
  submittedBy: Reviewer; assignedReviewer: Reviewer | null;
};
const initialState: ReviewActionState = {};

function ReviewCard({ review, reviewers, currentUserId }: { review: Review; reviewers: Reviewer[]; currentUserId: string }) {
  const router = useRouter();
  const [assignState, assignAction, assigning] = useActionState(assignReviewAction, initialState);
  const [approveState, approveAction, approving] = useActionState(approveReviewAction, initialState);
  const [changesState, changesAction, requesting] = useActionState(requestChangesAction, initialState);
  useEffect(() => { if (assignState.done || approveState.done || changesState.done) router.refresh(); }, [approveState.done, assignState.done, changesState.done, router]);
  const assignedToCurrentUser = review.assignedReviewer?.id === currentUserId;
  return <article className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs tracking-[0.14em] text-neutral-500">{review.content.contentType} · v{review.version.versionNumber}</p><h2 className="mt-1 text-lg font-medium">{review.content.title}</h2><p className="mt-2 text-sm text-neutral-400">投稿人：{review.submittedBy.name} · {new Date(review.submittedAt).toLocaleString('zh-CN')}</p></div><span className="rounded-full border border-[var(--border)] px-2 py-1 text-xs text-neutral-300">{review.status}</span></div>
    <p className="text-sm leading-6 text-neutral-300">{review.submitMessage || review.version.summary || '投稿人未填写补充说明。'}</p>
    <form action={assignAction} className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] pt-4"><input name="id" type="hidden" value={review.id} /><select className="h-9 rounded-md border border-[var(--border)] bg-black px-3 text-sm" defaultValue={review.assignedReviewer?.id ?? ''} name="reviewerId" required><option value="">选择审核人</option>{reviewers.filter((reviewer) => reviewer.id !== review.submittedBy.id).map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.name} · {reviewer.email}</option>)}</select><button className="h-9 rounded-md border border-[var(--border)] px-3 text-sm disabled:opacity-50" disabled={assigning} type="submit">分配</button>{review.assignedReviewer ? <span className="text-xs text-neutral-500">当前：{review.assignedReviewer.name}</span> : null}</form>
    {assignedToCurrentUser ? <div className="grid gap-2 border-t border-[var(--border)] pt-4"><p className="text-sm text-neutral-300">审核决定</p><form action={approveAction} className="flex flex-wrap gap-2"><input name="id" type="hidden" value={review.id} /><input className="h-9 min-w-56 flex-1 rounded-md border border-[var(--border)] bg-black px-3 text-sm" name="comment" placeholder="通过说明（必填）" required /><button className="h-9 rounded-md bg-white px-3 text-sm font-medium text-black disabled:opacity-50" disabled={approving} type="submit">通过</button></form><form action={changesAction} className="flex flex-wrap gap-2"><input name="id" type="hidden" value={review.id} /><input className="h-9 min-w-56 flex-1 rounded-md border border-[var(--border)] bg-black px-3 text-sm" name="comment" placeholder="退回修改说明（必填）" required /><button className="h-9 rounded-md border border-[var(--border)] px-3 text-sm disabled:opacity-50" disabled={requesting} type="submit">要求修改</button></form></div> : null}
    {assignState.error || approveState.error || changesState.error ? <p className="text-sm text-red-400">{assignState.error ?? approveState.error ?? changesState.error}</p> : null}
  </article>;
}

export function ReviewQueue({ reviews, reviewers, currentUserId }: { reviews: Review[]; reviewers: Reviewer[]; currentUserId: string }) {
  return reviews.length ? <div className="mt-6 grid gap-4">{reviews.map((review) => <ReviewCard currentUserId={currentUserId} key={review.id} review={review} reviewers={reviewers} />)}</div> : <div className="mt-6 rounded-lg border border-dashed border-[var(--border)] p-8 text-sm text-neutral-500">当前没有待处理的审核请求。</div>;
}
