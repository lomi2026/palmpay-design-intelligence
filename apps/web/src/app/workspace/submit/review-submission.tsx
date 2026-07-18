'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { submitReviewAction, type ActionState } from './actions';

const initialState: ActionState = {};

export function ReviewSubmission({ contentId, status }: { contentId: string; status: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(submitReviewAction, initialState);
  useEffect(() => {
    if (state.submitted) router.refresh();
  }, [router, state.submitted]);
  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(status)) return null;

  return <form action={action} className="mt-5 rounded-[22px] border border-white/[.1] bg-[linear-gradient(135deg,rgba(255,255,255,.06),transparent),#111] p-5 md:p-6"><input name="id" type="hidden" value={contentId} /><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold tracking-[.14em] text-white/45">REVIEW GATE</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.04em] text-white">提交审核</h2></div><label className="grid min-w-[min(100%,430px)] flex-1 gap-2 text-sm text-white/70">提交说明<input className="h-11 rounded-xl border border-white/[.14] bg-black/25 px-3 text-sm text-white placeholder:text-white/35" name="message" placeholder="说明本次提交希望审核人重点关注什么" /></label><button className="h-11 shrink-0 rounded-xl border border-white/[.35] px-5 text-sm font-semibold text-white hover:bg-white hover:text-black disabled:opacity-50" disabled={pending} type="submit">{pending ? '提交中…' : '提交审核'}</button></div>{state.error ? <p className="mt-3 text-sm text-red-400">{state.error}</p> : null}</form>;
}
