'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addReviewCommentAction, approveReviewAction, assignReviewAction, loadVersionDiffAction, publishApprovedVersionAction, requestChangesAction, type ReviewActionState } from './actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Reviewer = { id: string; name: string; email: string };
type Review = {
  id: string; status: string; submitMessage: string | null; submittedAt: string; dueAt: string | null; isOverdue: boolean;
  content: { id: string; title: string; contentType: string; status: string };
  version: { versionNumber: number; title: string; summary: string | null; changeSummary: string | null; body: unknown };
  submittedBy: Reviewer; assignedReviewer: Reviewer | null;
  actions: Array<{ id: string; action: string; comment: string | null; createdAt: string; actor: Reviewer }>;
};
const initialState: ReviewActionState = {};
const fieldNames: Record<string, string> = {
  title: '标题', summary: '摘要', versionLabel: '版本标签', changeSummary: '修改说明', body: '内容', attachments: '附件',
};
const reviewActionNames: Record<string, string> = { ASSIGN: '分配审核人', COMMENT: '内部备注', APPROVE: '通过', REQUEST_CHANGES: '要求修改', CANCEL: '取消' };

function fieldName(path: string) {
  return path.split('.').map((part) => fieldNames[part] ?? part).join(' / ');
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '未填写';
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

function ReviewCard({ review, reviewers, currentUserId, canPublish }: { review: Review; reviewers: Reviewer[]; currentUserId: string; canPublish: boolean }) {
  const router = useRouter();
  const [assignState, assignAction, assigning] = useActionState(assignReviewAction, initialState);
  const [approveState, approveAction, approving] = useActionState(approveReviewAction, initialState);
  const [changesState, changesAction, requesting] = useActionState(requestChangesAction, initialState);
  const [publishState, publishAction, publishing] = useActionState(publishApprovedVersionAction, initialState);
  const [diffState, diffAction, loadingDiff] = useActionState(loadVersionDiffAction, initialState);
  const [commentState, commentAction, commenting] = useActionState(addReviewCommentAction, initialState);
  useEffect(() => { if (assignState.done || approveState.done || changesState.done || publishState.done || commentState.done) router.refresh(); }, [approveState.done, assignState.done, changesState.done, publishState.done, commentState.done, router]);
  const assignedToCurrentUser = review.assignedReviewer?.id === currentUserId;
  return <Card className="border border-white/[.1] bg-[#111112] py-5 shadow-none transition hover:border-white/[.18]"><CardHeader>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] tracking-[0.14em] text-white/40">{review.content.contentType} · v{review.version.versionNumber}</p><CardTitle className="mt-2 text-[19px] text-white">{review.version.title}</CardTitle><p className="mt-2 text-sm text-white/50">投稿人：{review.submittedBy.name} · {new Date(review.submittedAt).toLocaleString('zh-CN')}</p></div><Badge variant="outline" className="border-white/[.14] bg-white/[.035] text-white/70">{review.status}</Badge></div>
    <p className="text-sm leading-6 text-white/70">{review.submitMessage || review.version.summary || '投稿人未填写补充说明。'}</p>
    {review.version.changeSummary ? <p className="text-sm leading-6 text-white/55">本次修改：{review.version.changeSummary}</p> : null}
    <details className="border-t border-white/10 pt-4"><summary className="cursor-pointer text-sm text-white/75">查看提交内容预览</summary><pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-black/25 p-4 text-xs leading-5 text-white/65">{displayValue(review.version.body)}</pre></details>
    <div className="border-t border-white/10 pt-4"><form action={diffAction}><input name="id" type="hidden" value={review.id} /><Button variant="outline" className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white" disabled={loadingDiff} type="submit">{loadingDiff ? '加载差异…' : '查看版本差异'}</Button></form>{diffState.diff ? <div className="mt-4 grid gap-3 rounded-xl border border-white/10 bg-black/25 p-4"><p className="text-xs tracking-[0.14em] text-white/40">版本对比 · {diffState.diff.baseVersion ? `v${diffState.diff.baseVersion.versionNumber} → v${diffState.diff.version.versionNumber}` : `v${diffState.diff.version.versionNumber} 为首个版本`}</p>{diffState.diff.changes.length ? diffState.diff.changes.map((change) => <div className="grid gap-2 border-t border-white/10 pt-3 first:border-t-0 first:pt-0" key={change.path}><p className="text-sm font-medium text-white/85">{fieldName(change.path)}</p><div className="grid gap-2 md:grid-cols-2"><pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-xs leading-5 text-white/55">{displayValue(change.before)}</pre><pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-white/8 p-3 text-xs leading-5 text-white/80">{displayValue(change.after)}</pre></div></div>) : <p className="text-sm text-white/55">与基准版本没有字段差异。</p>}</div> : null}</div>
    {review.status === 'PENDING' ? <form action={assignAction} className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4"><input name="id" type="hidden" value={review.id} /><select className="h-9 rounded-[10px] border border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white" defaultValue={review.assignedReviewer?.id ?? ''} name="reviewerId" required><option value="">选择审核人</option>{reviewers.filter((reviewer) => reviewer.id !== review.submittedBy.id).map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.name} · {reviewer.email}</option>)}</select><Button variant="outline" className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white" disabled={assigning} type="submit">分配</Button>{review.assignedReviewer ? <span className="text-xs text-white/40">当前：{review.assignedReviewer.name}</span> : null}</form> : null}
    {review.status === 'PENDING' && assignedToCurrentUser ? <div className="grid gap-2 border-t border-white/10 pt-4"><p className="text-[11px] font-semibold tracking-[.12em] text-white/55">REVIEW DECISION</p><form action={approveAction} className="flex flex-wrap gap-2"><input name="id" type="hidden" value={review.id} /><Input className="h-9 min-w-56 flex-1 border-white/[.14] bg-black/[.16] text-white placeholder:text-white/35" name="comment" placeholder="通过说明（必填）" required /><Button className="h-9 rounded-[10px] bg-white px-3 text-[12px] text-black hover:bg-white/85" disabled={approving} type="submit">通过</Button></form><form action={changesAction} className="flex flex-wrap gap-2"><input name="id" type="hidden" value={review.id} /><Input className="h-9 min-w-56 flex-1 border-white/[.14] bg-black/[.16] text-white placeholder:text-white/35" name="comment" placeholder="退回修改说明（必填）" required /><Button variant="outline" className="h-9 rounded-[10px] border-amber-400/40 bg-black/[.16] px-3 text-[12px] text-amber-200 hover:bg-amber-400/10 hover:text-amber-100" disabled={requesting} type="submit">要求修改</Button></form><form action={commentAction} className="flex flex-wrap gap-2"><input name="id" type="hidden" value={review.id} /><Input className="h-9 min-w-56 flex-1 border-white/[.14] bg-black/[.16] text-white placeholder:text-white/35" name="comment" placeholder="添加内部备注" required /><Button variant="outline" className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white" disabled={commenting} type="submit">记录备注</Button></form></div> : null}
    {canPublish && review.status === 'APPROVED' ? <form action={publishAction} className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4"><input name="contentId" type="hidden" value={review.content.id} /><p className="text-sm text-white/75">审核已通过，可发布为当前公开版本。</p><Button className="h-9 rounded-[10px] bg-white px-3 text-[12px] text-black hover:bg-white/85" disabled={publishing} type="submit">发布版本</Button></form> : null}
    <section className="border-t border-white/10 pt-4"><p className="text-sm text-white/75">审核历史</p><ol className="mt-3 space-y-3">{review.actions.length ? review.actions.map((item) => <li className="border-l border-white/15 pl-3 text-sm" key={item.id}><p className="text-white/75">{reviewActionNames[item.action] ?? item.action} · {item.actor.name}</p>{item.comment ? <p className="mt-1 whitespace-pre-wrap text-white/50">{item.comment}</p> : null}<p className="mt-1 text-xs text-white/35">{new Date(item.createdAt).toLocaleString('zh-CN')}</p></li>) : <li className="text-sm text-white/40">尚无操作记录。</li>}</ol></section>
    {assignState.error || approveState.error || changesState.error || publishState.error || diffState.error || commentState.error ? <p className="text-sm text-red-400">{assignState.error ?? approveState.error ?? changesState.error ?? publishState.error ?? diffState.error ?? commentState.error}</p> : null}
  </CardHeader></Card>;
}

export function ReviewQueue({ reviews, reviewers, currentUserId, canPublish }: { reviews: Review[]; reviewers: Reviewer[]; currentUserId: string; canPublish: boolean }) {
  const [filter, setFilter] = useState<'mine' | 'pending' | 'handled' | 'overdue'>('mine');
  const filtered = reviews.filter((review) => filter === 'mine' ? review.status === 'PENDING' && review.assignedReviewer?.id === currentUserId : filter === 'pending' ? review.status === 'PENDING' : filter === 'handled' ? review.actions.some((action) => action.actor.id === currentUserId && ['APPROVE', 'REQUEST_CHANGES'].includes(action.action)) : review.status === 'PENDING' && review.isOverdue);
  return <><div className="mt-5 flex flex-wrap gap-2">{([{ id: 'mine', label: '待我审核' }, { id: 'pending', label: '全部待审核' }, { id: 'handled', label: '我已处理' }, { id: 'overdue', label: '已超时' }] as const).map((item) => <Button aria-pressed={filter === item.id} className={filter === item.id ? 'bg-white text-black hover:bg-white/85' : 'border-white/[.14] bg-white/[.035] text-white/65 hover:bg-white/[.1] hover:text-white'} key={item.id} onClick={() => setFilter(item.id)} type="button" variant={filter === item.id ? 'default' : 'outline'}>{item.label}</Button>)}</div>{filtered.length ? <div className="mt-3 grid gap-3">{filtered.map((review) => <ReviewCard canPublish={canPublish} currentUserId={currentUserId} key={review.id} review={review} reviewers={reviewers} />)}</div> : <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-sm text-white/45">当前筛选条件下没有审核记录。</div>}</>;
}
