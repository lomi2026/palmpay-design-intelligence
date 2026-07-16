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

  return <form action={action} className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"><input name="id" type="hidden" value={contentId} /><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><label className="grid flex-1 gap-1.5 text-sm text-neutral-300">提交说明<input className="h-9 rounded-md border border-[var(--border)] bg-black px-3 text-sm" name="message" placeholder="说明本次提交希望审核人重点关注什么" /></label><button className="h-9 shrink-0 rounded-md border border-neutral-500 px-4 text-sm text-white hover:bg-neutral-800 disabled:opacity-50" disabled={pending} type="submit">{pending ? '提交中…' : '提交审核'}</button></div>{state.error ? <p className="mt-3 text-sm text-red-400">{state.error}</p> : null}</form>;
}
