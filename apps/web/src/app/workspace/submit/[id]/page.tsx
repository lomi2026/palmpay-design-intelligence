import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { DraftEditor } from '../draft-editor';

type Draft = { id: string; title: string; summary: string | null; contentType: 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT'; status: string; draftVersion: { body: unknown; changeSummary: string | null; versionNumber: number; versionStatus: string } | null; attachments: Array<{ id: string; fileId: string; file: { originalName: string; mimeType: string; sizeBytes: string } }> };

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await serverApiFetch<Draft>(`/api/content-drafts/${id}`, { headers: await authenticatedApiHeaders() });
  return <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"><header className="overflow-hidden rounded-[26px] border border-white/[.1] bg-[linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.015)_54%),repeating-linear-gradient(90deg,transparent_0_71px,rgba(255,255,255,.055)_72px),#101010] px-6 py-7 md:px-9 md:py-9"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-bold tracking-[.18em] text-violet-100/70">DRAFT STUDIO · {draft.contentType.replaceAll('_', ' ')}</p><h1 className="mt-3 text-[42px] font-semibold leading-none tracking-[-.06em] text-white md:text-[60px]">编辑可审核的草稿。</h1><p className="mt-4 max-w-[720px] text-sm leading-7 text-white/55">当前状态：{draft.draftVersion?.versionStatus ?? draft.status}。每次保存都会写入正式草稿版本；发布内容不会被直接改写。</p></div><Link className="rounded-full border border-white/[.14] bg-black/20 px-4 py-2 text-sm text-white/70 transition hover:border-white/35 hover:text-white" href="/workspace/submit">新建其他内容</Link></div><div className="mt-7 grid gap-2 border-t border-white/[.1] pt-4 text-[11px] font-semibold tracking-[.1em] text-white/45 sm:grid-cols-3"><span>CONTENT TYPE · {draft.contentType}</span><span>DRAFT VERSION · v{draft.draftVersion?.versionNumber ?? 1}</span><span className="sm:text-right">ATTACHMENTS · {draft.attachments.length}</span></div></header><DraftEditor draft={draft} /></main>;
}
