'use client';

import { Download, Paperclip } from 'lucide-react';
import { useActionState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { downloadPublishedAttachmentAction, type DownloadAttachmentState } from '@/app/workspace/published-attachment-actions';
import type { PublishedAttachment } from '@/lib/content-types';

const initialState: DownloadAttachmentState = {};

function formatSize(value: string) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return '';
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function AttachmentDownload({ attachment }: { attachment: PublishedAttachment }) {
  const [state, action, pending] = useActionState(downloadPublishedAttachmentAction, initialState);
  useEffect(() => {
    if (!state.url) return;
    const anchor = document.createElement('a');
    anchor.href = state.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.click();
  }, [state.url]);
  return <li className="flex items-center justify-between gap-3 rounded-xl border border-white/[.1] bg-black/20 px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm text-white/80">{attachment.file.originalName}</p><p className="mt-0.5 text-[11px] text-white/40">{attachment.file.mimeType} · {formatSize(attachment.file.sizeBytes)}</p></div><form action={action}><input name="fileId" type="hidden" value={attachment.file.id} /><Button className="h-8 rounded-lg border-white/[.14] bg-white/[.04] px-2.5 text-xs text-white hover:bg-white/[.1]" disabled={pending} size="sm" type="submit" variant="outline"><Download />{pending ? '准备中…' : '下载'}</Button></form>{state.error ? <p className="basis-full text-[11px] text-red-400">{state.error}</p> : null}</li>;
}

export function PublishedAttachments({ attachments }: { attachments: PublishedAttachment[] }) {
  if (!attachments.length) return null;
  return <section className="rounded-[18px] border border-white/[.1] bg-[#111] p-5"><div className="flex items-center gap-2"><Paperclip className="size-4 text-white/55" /><div><p className="text-[11px] font-bold uppercase tracking-[.13em] text-white/45">Attachments</p><h2 className="mt-0.5 text-[20px] font-semibold tracking-[-.035em] text-white">下载附件</h2></div></div><p className="mt-2 text-xs leading-5 text-white/45">下载链接仅在本次授权后短暂有效，不会公开文件存储地址。</p><ul className="mt-4 grid gap-2">{attachments.map((attachment) => <AttachmentDownload attachment={attachment} key={attachment.id} />)}</ul></section>;
}
