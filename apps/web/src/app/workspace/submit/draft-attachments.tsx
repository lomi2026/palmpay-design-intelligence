'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { removeDraftAttachmentAction, uploadDraftAttachmentAction, type AttachmentActionState } from './attachment-actions';

type Attachment = {
  id: string;
  fileId: string;
  file: { originalName: string; mimeType: string; sizeBytes: string };
};

const initialState: AttachmentActionState = {};

function formatSize(value: string) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return value;
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DraftAttachments({ contentId, attachments }: { contentId: string; attachments: Attachment[] }) {
  const router = useRouter();
  const [uploadState, uploadAction, uploading] = useActionState(uploadDraftAttachmentAction, initialState);
  const [removeState, removeAction, removing] = useActionState(removeDraftAttachmentAction, initialState);
  useEffect(() => {
    if (uploadState.savedAt || removeState.savedAt) router.refresh();
  }, [removeState.savedAt, router, uploadState.savedAt]);

  return <section className="grid gap-3 border-t border-[var(--border)] pt-5">
    <div><h2 className="text-base font-medium">附件</h2><p className="mt-1 text-xs text-neutral-500">文件会先校验后再绑定草稿；单个文件最大 100 MB。</p></div>
    {attachments.length ? <ul className="grid gap-2">{attachments.map((attachment) => <li className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-black px-3 py-2 text-sm" key={attachment.id}><span className="min-w-0 truncate">{attachment.file.originalName} <span className="text-xs text-neutral-500">· {formatSize(attachment.file.sizeBytes)}</span></span><form action={removeAction}><input name="id" type="hidden" value={contentId} /><input name="fileId" type="hidden" value={attachment.fileId} /><button className="text-xs text-neutral-400 hover:text-white disabled:opacity-50" disabled={removing} type="submit">移除</button></form></li>)}</ul> : <p className="rounded-md border border-dashed border-[var(--border)] px-3 py-4 text-sm text-neutral-500">暂未添加附件。</p>}
    <form action={uploadAction} className="flex flex-wrap items-center gap-3"><input name="id" type="hidden" value={contentId} /><input className="max-w-full text-sm text-neutral-300 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black" name="file" required type="file" /><button className="h-9 rounded-md bg-white px-4 text-sm font-medium text-black disabled:opacity-50" disabled={uploading} type="submit">{uploading ? '上传并绑定中…' : '上传附件'}</button></form>
    {uploadState.error || removeState.error ? <p className="text-sm text-red-400">{uploadState.error ?? removeState.error}</p> : null}
  </section>;
}
