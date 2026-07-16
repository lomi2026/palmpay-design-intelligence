import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { verificationLabels } from '@/lib/ai-catalog';
import type { ContentCard, ContentListResponse } from '@/lib/content-types';

type CaseCard = ContentCard & { caseDetail?: { metricName: string | null } | null };
type CaseListResponse = Omit<ContentListResponse, 'items'> & { items: CaseCard[] };

export default async function AICasesPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search = '' } = await searchParams;
  const query = new URLSearchParams({ type: 'AI_CASE', pageSize: '100' });
  if (search.trim()) query.set('search', search.trim());
  const cases = await serverApiFetch<CaseListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() });
  return (
    <main className="px-6 py-7 md:px-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-6 xl:flex-row xl:items-end">
        <div><p className="text-xs tracking-[0.18em] text-neutral-500">PRACTICE EVIDENCE</p><h1 className="mt-2 text-2xl font-semibold">AI 案例</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">记录 AI 辅助设计实践中的输入、人工职责、验证方式与已观察到的结果。</p></div>
        <form className="flex w-full max-w-md gap-2" method="get"><label className="sr-only" htmlFor="case-search">搜索 AI 案例</label><input className="h-9 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-neutral-500" defaultValue={search} id="case-search" name="search" placeholder="搜索案例名称或摘要" type="search" /><button className="h-9 rounded-md border border-neutral-600 px-3 text-sm hover:bg-neutral-900" type="submit">搜索</button></form>
      </header>
      <div className="mt-5 text-sm text-neutral-500">{cases.total} 个已发布案例{search ? ` · 搜索：${search}` : ''}</div>
      {cases.items.length ? <section className="mt-5 grid gap-4 md:grid-cols-2"><div className="contents">{cases.items.map((item) => <article className="flex min-h-56 flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-neutral-600" key={item.id}><div className="flex items-center justify-between gap-3 text-xs text-neutral-500"><span>{item.category?.name ?? '未分类'}</span><span>{verificationLabels[item.verificationStatus] ?? item.verificationStatus}</span></div><h2 className="mt-4 text-lg font-medium leading-7"><Link className="hover:underline hover:underline-offset-4" href={`/workspace/ai-cases/${item.slug}`}>{item.title}</Link></h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">{item.summary ?? '暂无说明'}</p><div className="mt-auto border-t border-[var(--border)] pt-4 text-sm text-neutral-300">{item.caseDetail?.metricName ?? '指标待验证'}</div></article>)}</div></section> : <section className="mt-5 rounded-lg border border-dashed border-[var(--border)] px-6 py-16 text-center text-sm text-neutral-500">没有找到可访问的 AI 案例。</section>}
    </main>
  );
}
