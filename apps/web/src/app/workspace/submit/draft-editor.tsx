'use client';

import { useActionState, useEffect, useRef } from 'react';
import { autosaveDraftAction, type ActionState } from './actions';
import { ReviewSubmission } from './review-submission';
import { ContentTypeFields } from './content-type-fields';
import { DraftAttachments } from './draft-attachments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Draft = { id: string; status: string; contentType: 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT'; title: string; summary: string | null; draftVersion: { body: unknown; changeSummary: string | null; versionNumber: number; versionStatus: string } | null; attachments: Array<{ id: string; fileId: string; file: { originalName: string; mimeType: string; sizeBytes: string } }> };

const initialState: ActionState = {};

export function DraftEditor({ draft }: { draft: Draft }) {
  const [state, action, pending] = useActionState(autosaveDraftAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const draftStatus = draft.draftVersion?.versionStatus ?? draft.status;
  const scheduleAutosave = () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => formRef.current?.requestSubmit(), 900);
  };
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);
  return <>
    <form action={action} className="mt-6 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6" onInput={scheduleAutosave} ref={formRef}><input name="id" type="hidden" value={draft.id} /><input name="contentType" type="hidden" value={draft.contentType} />
    <label className="grid gap-1.5 text-sm text-white/75">标题<Input className="border-white/15 bg-black/25 text-white" defaultValue={draft.title} name="title" required /></label>
    <label className="grid gap-1.5 text-sm text-white/75">摘要<Textarea className="min-h-20 border-white/15 bg-black/25 text-white" defaultValue={draft.summary ?? ''} name="summary" /></label>
    <label className="grid gap-1.5 text-sm text-white/75">本次修改说明<Input className="border-white/15 bg-black/25 text-white placeholder:text-white/35" defaultValue={draft.draftVersion?.changeSummary ?? ''} name="changeSummary" placeholder="例如：补充使用步骤" /></label>
    <ContentTypeFields body={draft.draftVersion?.body as Record<string, unknown> | undefined} contentType={draft.contentType} />
    {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
    <div className="flex items-center justify-between border-t border-white/10 pt-4"><p aria-live="polite" className="text-xs text-white/40">草稿 v{draft.draftVersion?.versionNumber ?? 1} · {pending ? '自动保存中…' : state.savedAt ? `已保存 ${state.savedAt}` : '输入后将自动保存'}</p><Button className="bg-white text-black hover:bg-white/85" disabled={pending} type="submit">{pending ? '保存中…' : '立即保存'}</Button></div>
  </form>
    <DraftAttachments attachments={draft.attachments} contentId={draft.id} />
    <ReviewSubmission contentId={draft.id} status={draftStatus} />
  </>;
}
