'use client';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoverPicker } from '@/components/workspace/cover-picker';
import { uploadDraftAttachmentAction, removeDraftCoverAction, type AttachmentActionState } from './attachment-actions';
export function DraftCover({ id, fileId }: { id: string; fileId: string | null }) {
  const router = useRouter();
  const [selected, setSelected] = useState(false);
  const [state, upload, pending] = useActionState<AttachmentActionState, FormData>(async (previous, data) => { const result = await uploadDraftAttachmentAction(previous, data); if (result.savedAt) setSelected(false); return result; }, {});
  const [removed, remove, removing] = useActionState<AttachmentActionState, FormData>(async (previous, data) => { const result = await removeDraftCoverAction(previous, data); if (result.savedAt) setSelected(false); return result; }, {});
  useEffect(() => { if (state.savedAt || removed.savedAt) router.refresh(); }, [state.savedAt, removed.savedAt, router]);
  return <section className="mt-6 space-y-5 rounded-[22px] border border-border bg-card p-6 sm:p-6"><h2 className="text-lg font-semibold">封面图片 <span className="ml-1 text-sm font-normal text-muted-foreground">选填</span></h2><form action={upload} className="space-y-4" onResetCapture={(event) => event.preventDefault()}><input type="hidden" name="id" value={id} /><input type="hidden" name="cover" value="true" /><CoverPicker key={`${fileId}-${state.savedAt}-${removed.savedAt}`} name="file" fileId={fileId} disabled={pending || removing} onSelected={setSelected} /><div className="flex items-center justify-end gap-3"><span aria-live="polite" className="mr-auto text-xs text-muted-foreground">{pending ? '正在上传封面…' : state.savedAt ? '封面已保存，发布后生效' : ''}</span><Button disabled={pending || removing || !selected}>{pending ? <Loader2 className="size-4 animate-spin" /> : null}{pending ? '上传中…' : '保存封面'}</Button></div></form>{fileId ? <form action={remove}><input type="hidden" name="id" value={id} /><Button size="sm" variant="ghost" className="text-destructive" disabled={pending || removing}><Trash2 className="size-4" />{removing ? '移除中…' : '移除当前封面'}</Button></form> : null}{state.error || removed.error ? <p role="alert" className="text-sm text-destructive">{state.error || removed.error}</p> : null}</section>;
}
