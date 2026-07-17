import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { CreateDraftForm } from './create-draft-form';

type TeamResponse = { items: Array<{ id: string; name: string; code: string }> };

export default async function SubmitContentPage() {
  const teams = await serverApiFetch<TeamResponse>('/api/content-draft-teams', { headers: await authenticatedApiHeaders() });
  return <main className="px-5 py-8 md:px-8 md:py-10"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-7"><div><p className="text-xs tracking-[0.18em] text-violet-200/75">CONTRIBUTE</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">提交内容</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">先创建草稿，再逐步完善。草稿仅在组织内按权限保存，不会自动公开。</p></div><Link className="text-sm text-white/55 hover:text-white" href="/workspace">返回工作台</Link></header><CreateDraftForm teams={teams.items} /></main>;
}
