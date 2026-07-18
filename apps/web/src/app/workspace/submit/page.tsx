import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { CreateDraftForm } from './create-draft-form';

type TeamResponse = { items: Array<{ id: string; name: string; code: string }> };
type ContentType = 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT';

const contentTypes = new Set<ContentType>(['DESIGN_ASSET', 'AI_SKILL', 'AI_CASE', 'AI_PROJECT']);

export default async function SubmitContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const teams = await serverApiFetch<TeamResponse>('/api/content-draft-teams', { headers: await authenticatedApiHeaders() });
  const initialContentType = type && contentTypes.has(type as ContentType) ? type as ContentType : undefined;
  return <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[.1] pb-7"><div><p className="text-[11px] font-semibold tracking-[.2em] text-white/45">CONTRIBUTE</p><h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white">把一次经验，沉淀为团队下一次可调用的能力。</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">先创建草稿，再逐步完善。草稿仅在组织内按权限保存，不会自动公开；审核通过后仍由具备发布权限的成员完成最终发布。</p></div><Link className="text-sm text-white/55 transition hover:text-white" href="/workspace">返回工作台 →</Link></header><CreateDraftForm initialContentType={initialContentType} teams={teams.items} /></main>;
}
