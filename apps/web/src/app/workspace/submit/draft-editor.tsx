'use client';

import { useActionState } from 'react';
import { autosaveDraftAction, type ActionState } from './actions';
import { ReviewSubmission } from './review-submission';
import { ContentTypeFields } from './content-type-fields';

type Draft = { id: string; status: string; contentType: 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT'; title: string; summary: string | null; draftVersion: { body: unknown; changeSummary: string | null; versionNumber: number } | null };

const initialState: ActionState = {};

export function DraftEditor({ draft }: { draft: Draft }) {
  const [state, action, pending] = useActionState(autosaveDraftAction, initialState);
  return <>
    <form action={action} className="mt-6 grid gap-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6"><input name="id" type="hidden" value={draft.id} /><input name="contentType" type="hidden" value={draft.contentType} />
    <label className="grid gap-1.5 text-sm text-neutral-300">标题<input className="h-9 rounded-md border border-[var(--border)] bg-black px-3 text-sm" defaultValue={draft.title} name="title" required /></label>
    <label className="grid gap-1.5 text-sm text-neutral-300">摘要<textarea className="min-h-20 rounded-md border border-[var(--border)] bg-black px-3 py-2 text-sm" defaultValue={draft.summary ?? ''} name="summary" /></label>
    <label className="grid gap-1.5 text-sm text-neutral-300">本次修改说明<input className="h-9 rounded-md border border-[var(--border)] bg-black px-3 text-sm" defaultValue={draft.draftVersion?.changeSummary ?? ''} name="changeSummary" placeholder="例如：补充使用步骤" /></label>
    <ContentTypeFields body={draft.draftVersion?.body as Record<string, unknown> | undefined} contentType={draft.contentType} />
    {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
    <div className="flex items-center justify-between border-t border-[var(--border)] pt-4"><p className="text-xs text-neutral-500">草稿 v{draft.draftVersion?.versionNumber ?? 1}{state.savedAt ? ` · 已保存 ${state.savedAt}` : ''}</p><button className="h-9 rounded-md bg-white px-4 text-sm font-medium text-black disabled:opacity-50" disabled={pending} type="submit">{pending ? '保存中…' : '保存草稿'}</button></div>
  </form>
    <ReviewSubmission contentId={draft.id} status={draft.status} />
  </>;
}
