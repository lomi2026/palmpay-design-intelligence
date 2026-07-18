import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ApiError, serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { DraftPreviewContent } from '@/components/workspace/draft-preview-content';

type Draft = { id: string; title: string; summary: string | null; contentType: 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT'; draftVersion: { body: unknown; versionNumber: number; versionStatus: string } | null; attachments: Array<{ id: string; file: { originalName: string; mimeType: string; sizeBytes: string } }> };

async function getDraft(id: string) {
  try {
    return await serverApiFetch<Draft>(`/api/content-drafts/${encodeURIComponent(id)}`, { headers: await authenticatedApiHeaders() });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export default async function DraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await getDraft(id);
  return <><div className="mx-auto max-w-[1232px] px-5 pt-6 md:px-8"><Link className="inline-flex items-center gap-2 text-[12px] text-white/55 transition hover:text-white" href={`/workspace/submit/${id}`}><ArrowLeft className="size-4" />返回编辑草稿</Link></div><DraftPreviewContent draft={draft} /></>;
}
