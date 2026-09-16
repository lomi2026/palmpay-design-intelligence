'use client';
import { useRef, useState } from 'react';
import { removeDraftAttachmentAction, type DraftAttachment } from './attachment-actions';
import { useDraftUpload } from './use-draft-upload';
import { useUnsavedChanges } from '@/components/workspace/use-unsaved-changes';
import { invalidateWorkspaceCache } from '@/components/workspace/cache-events';
export function DraftAttachments({ contentId, attachments }: { contentId: string; attachments: DraftAttachment[] }) {
  const [items, setItems] = useState(attachments);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(false);
  const lock = useRef(false);
  const task = useDraftUpload();
  useUnsavedChanges(task.pending || selected);
  return <section data-card-surface="" className="mt-6 grid gap-4 rounded-3xl bg-card p-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><h2 className="text-2xl font-semibold">附件与引用材料</h2><p className="text-xs text-muted-foreground">单个文件最大 100 MB</p></div>
    {items.length ? <ul className="grid gap-2">{items.map(item => <li className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm" key={item.id}><span className="min-w-0 truncate">{item.file.originalName} · {(Number(item.file.sizeBytes) / 1024 / 1024).toFixed(2)} MB</span><button className="text-xs text-muted-foreground disabled:opacity-50" disabled={Boolean(removing) || task.pending} type="button" onClick={async () => {
      if (lock.current) return; lock.current = true; setRemoving(item.fileId); setError('');
      try { const data = new FormData(); data.set('id', contentId); data.set('fileId', item.fileId); const result = await removeDraftAttachmentAction({}, data); if (result.error) setError(result.error); else { setItems(previous => previous.filter(value => value.fileId !== item.fileId)); invalidateWorkspaceCache(['/workspace/contributions']); } }
      catch { setError('移除结果暂未确认，请重试。'); } finally { lock.current = false; setRemoving(null); }
    }}>{removing === item.fileId ? '移除中…' : '移除'}</button></li>)}</ul> : <p className="rounded-xl border border-dashed px-4 py-5 text-sm text-muted-foreground">暂未添加附件。</p>}
    <form data-managed-cache="" className="flex flex-wrap items-center gap-3" onSubmit={async event => {
      event.preventDefault(); const form = event.currentTarget; const result = await task.upload(new FormData(form));
      if (result.attachments) { setItems(result.attachments); form.reset(); setSelected(false); }
    }}>
      <input name="id" type="hidden" value={contentId} /><input className="max-w-full text-sm" name="file" required type="file" disabled={task.pending || Boolean(removing)} onChange={event => { const file = event.target.files?.[0]; if (file && file.size > 100 * 1024 * 1024) { setError('单个附件不能超过 100 MB。'); event.target.value = ''; setSelected(false); } else { setError(''); setSelected(Boolean(file)); } }} />
      <button className="h-10 rounded-xl bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50" disabled={task.pending || Boolean(removing) || !selected}>{task.pending ? task.stage : task.error ? '重试上传' : '上传附件'}</button>
      {task.progress !== null && task.pending ? <progress className="w-full" aria-label="文件上传进度" max={100} value={task.progress} /> : null}
    </form>
    {error || task.error ? <p role="alert" className="text-sm text-destructive">{error || task.error}</p> : null}
  </section>;
}
