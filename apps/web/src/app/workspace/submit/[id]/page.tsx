import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { DraftEditor } from '../draft-editor';

type Draft = { id: string; title: string; summary: string | null; contentType: 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT'; status: string; draftVersion: { body: unknown; changeSummary: string | null; versionNumber: number } | null };

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await serverApiFetch<Draft>(`/api/content-drafts/${id}`, { headers: await authenticatedApiHeaders() });
  return <main className="px-6 py-7 md:px-8 lg:px-10"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-6"><div><p className="text-xs tracking-[0.18em] text-neutral-500">DRAFT · {draft.contentType}</p><h1 className="mt-2 text-2xl font-semibold">编辑草稿</h1><p className="mt-2 text-sm text-neutral-400">状态：{draft.status} · 保存后可在其他设备继续编辑。</p></div><Link className="text-sm text-neutral-400 hover:text-white" href="/workspace/submit">新建其他内容</Link></header><DraftEditor draft={draft} /></main>;
}
