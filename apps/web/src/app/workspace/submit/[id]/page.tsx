import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { DraftEditor } from '../draft-editor';

type Draft = { id: string; title: string; summary: string | null; contentType: 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT'; status: string; draftVersion: { body: unknown; changeSummary: string | null; versionNumber: number; versionStatus: string } | null; attachments: Array<{ id: string; fileId: string; file: { originalName: string; mimeType: string; sizeBytes: string } }> };

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await serverApiFetch<Draft>(`/api/content-drafts/${id}`, { headers: await authenticatedApiHeaders() });
  return <main className="px-5 py-8 md:px-8 md:py-10"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-7"><div><p className="text-xs tracking-[0.18em] text-violet-200/75">DRAFT · {draft.contentType}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">编辑草稿</h1><p className="mt-2 text-sm text-white/55">状态：{draft.draftVersion?.versionStatus ?? draft.status} · 保存后可在其他设备继续编辑。</p></div><Link className="text-sm text-white/55 hover:text-white" href="/workspace/submit">新建其他内容</Link></header><DraftEditor draft={draft} /></main>;
}
