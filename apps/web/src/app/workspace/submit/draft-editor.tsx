'use client';

import { useActionState, useEffect, useRef } from 'react';
import { autosaveDraftAction, saveAndPreviewDraftAction, type ActionState } from './actions';
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
    <form action={action} className="mt-6 grid gap-6 rounded-[24px] border border-white/[.1] bg-[#111] p-5 md:p-8" onInput={scheduleAutosave} ref={formRef}><input name="id" type="hidden" value={draft.id} /><input name="contentType" type="hidden" value={draft.contentType} />
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[.1] pb-5"><div><h2 className="text-[28px] font-semibold tracking-[-.045em] text-white">完善内容说明</h2></div><p className="max-w-md text-sm leading-6 text-white/50">字段随内容类型变化；系统会在停止输入后自动保存，提交审核前仍可继续编辑。</p></div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]"><label className="grid gap-2 text-sm font-medium text-white/75">标题<Input className="h-12 border-white/[.14] bg-black/25 text-base text-white" defaultValue={draft.title} name="title" required /></label>
    <label className="grid gap-2 text-sm font-medium text-white/75">本次修改说明<Input className="h-12 border-white/[.14] bg-black/25 text-white placeholder:text-white/35" defaultValue={draft.draftVersion?.changeSummary ?? ''} name="changeSummary" placeholder="例如：补充使用步骤" /></label></div>
    <label className="grid gap-2 text-sm font-medium text-white/75">摘要<Textarea className="min-h-28 border-white/[.14] bg-black/25 text-white" defaultValue={draft.summary ?? ''} name="summary" /></label>
    <ContentTypeFields body={draft.draftVersion?.body as Record<string, unknown> | undefined} contentType={draft.contentType} />
    {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[.1] pt-5"><p aria-live="polite" className="text-xs text-white/40">草稿 v{draft.draftVersion?.versionNumber ?? 1} · {pending ? '自动保存中…' : state.savedAt ? `已保存 ${state.savedAt}` : '输入后将自动保存'}</p><div className="flex flex-wrap gap-2"><Button className="h-11 border-white/[.16] bg-transparent px-4 text-white hover:bg-white/[.08] hover:text-white" formAction={saveAndPreviewDraftAction} type="submit" variant="outline">预览草稿</Button><Button className="h-11 bg-white px-5 font-semibold text-black hover:bg-white/85" disabled={pending} type="submit">{pending ? '保存中…' : '立即保存'}</Button></div></div>
  </form>
    <DraftAttachments attachments={draft.attachments} contentId={draft.id} />
    <ReviewSubmission contentId={draft.id} status={draftStatus} />
  </>;
}
