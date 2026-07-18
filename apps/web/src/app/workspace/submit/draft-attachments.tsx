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

  return <section className="mt-5 grid gap-4 rounded-[22px] border border-white/[.1] bg-[#111] p-5 md:p-6">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-bold tracking-[.14em] text-white/45">EVIDENCE FILES</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.04em] text-white">附件与引用材料</h2></div><p className="text-xs text-white/45">单个文件最大 100 MB</p></div>
    {attachments.length ? <ul className="grid gap-2">{attachments.map((attachment) => <li className="flex items-center justify-between gap-3 rounded-xl border border-white/[.1] bg-black/25 px-4 py-3 text-sm" key={attachment.id}><span className="min-w-0 truncate text-white/75">{attachment.file.originalName} <span className="text-xs text-white/40">· {formatSize(attachment.file.sizeBytes)}</span></span><form action={removeAction}><input name="id" type="hidden" value={contentId} /><input name="fileId" type="hidden" value={attachment.fileId} /><button className="text-xs text-white/45 hover:text-white disabled:opacity-50" disabled={removing} type="submit">移除</button></form></li>)}</ul> : <p className="rounded-xl border border-dashed border-white/[.14] bg-black/15 px-4 py-5 text-sm text-white/45">暂未添加附件。上传后会先经过文件校验，再与此草稿绑定。</p>}
    <form action={uploadAction} className="flex flex-wrap items-center gap-3"><input name="id" type="hidden" value={contentId} /><input className="max-w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-black" name="file" required type="file" /><button className="h-10 rounded-lg bg-white px-4 text-sm font-semibold text-black disabled:opacity-50" disabled={uploading} type="submit">{uploading ? '上传并绑定中…' : '上传附件'}</button></form>
    {uploadState.error || removeState.error ? <p className="text-sm text-red-400">{uploadState.error ?? removeState.error}</p> : null}
  </section>;
}
