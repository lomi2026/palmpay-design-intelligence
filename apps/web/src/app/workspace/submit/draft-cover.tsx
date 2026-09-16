'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoverPicker } from '@/components/workspace/cover-picker';
import { removeDraftCoverAction } from './attachment-actions';
import { useDraftUpload } from './use-draft-upload';
import { useUnsavedChanges } from '@/components/workspace/use-unsaved-changes';
import { invalidateWorkspaceCache } from '@/components/workspace/cache-events';
export function DraftCover({ id, fileId }: { id: string; fileId: string | null }) {
  const [currentFile, setFile] = useState(fileId);
  const [selected, setSelected] = useState(false);
  const [revision, setRevision] = useState(0);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const task = useDraftUpload();
  useUnsavedChanges(selected || task.pending);
  return <section data-card-surface="" className="mt-6 space-y-5 rounded-3xl bg-card p-6"><h2 className="text-lg font-semibold">封面图片 <span className="text-sm font-normal text-muted-foreground">选填</span></h2>
    <form data-managed-cache="" className="space-y-4" onSubmit={async event => {
      event.preventDefault(); setError(''); const result = await task.upload(new FormData(event.currentTarget));
      if (result.savedAt) { setFile(result.coverFile ?? null); setSelected(false); setRevision(value => value + 1); }
    }}>
      <input type="hidden" name="id" value={id} /><input type="hidden" name="cover" value="true" />
      <CoverPicker key={revision} name="file" fileId={currentFile} disabled={task.pending || removing} onSelected={setSelected} />
      <div className="flex items-center justify-end gap-3"><span aria-live="polite" className="mr-auto text-xs text-muted-foreground">{task.stage}</span><Button disabled={task.pending || removing || !selected}>{task.pending ? '上传中…' : task.error ? '重试上传' : '保存封面'}</Button></div>
      {task.progress !== null && task.pending ? <progress className="w-full" aria-label="封面上传进度" max={100} value={task.progress} /> : null}
    </form>
    {currentFile ? <Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={task.pending || removing} onClick={async () => {
      setRemoving(true); setError(''); const data = new FormData(); data.set('id', id);
      try { const result = await removeDraftCoverAction({}, data); if (result.error) setError(result.error); else { setFile(null); setSelected(false); setRevision(value => value + 1); invalidateWorkspaceCache(['/workspace/contributions']); } } catch { setError('移除失败，请重试。'); } finally { setRemoving(false); }
    }}><Trash2 className="size-4" />{removing ? '移除中…' : '移除当前封面'}</Button> : null}
    {error || task.error ? <p role="alert" className="text-sm text-destructive">{error || task.error}</p> : null}
  </section>;
}
