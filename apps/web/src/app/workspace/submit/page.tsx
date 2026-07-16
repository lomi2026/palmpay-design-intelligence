import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { CreateDraftForm } from './create-draft-form';

type TeamResponse = { items: Array<{ id: string; name: string; code: string }> };

export default async function SubmitContentPage() {
  const teams = await serverApiFetch<TeamResponse>('/api/content-draft-teams', { headers: await authenticatedApiHeaders() });
  return <main className="px-6 py-7 md:px-8 lg:px-10"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border)] pb-6"><div><p className="text-xs tracking-[0.18em] text-neutral-500">CONTRIBUTE</p><h1 className="mt-2 text-2xl font-semibold">提交内容</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">先创建草稿，再逐步完善。草稿仅在组织内按权限保存，不会自动公开。</p></div><Link className="text-sm text-neutral-400 hover:text-white" href="/workspace">返回工作台</Link></header><CreateDraftForm teams={teams.items} /></main>;
}
