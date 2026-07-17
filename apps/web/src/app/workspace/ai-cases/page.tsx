import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { verificationLabels } from '@/lib/ai-catalog';
import type { ContentCard, ContentListResponse } from '@/lib/content-types';
import { CatalogPageHeader } from '@/components/workspace/catalog-page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type CaseCard = ContentCard & { caseDetail?: { metricName: string | null } | null };
type CaseListResponse = Omit<ContentListResponse, 'items'> & { items: CaseCard[] };

export default async function AICasesPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search = '' } = await searchParams;
  const query = new URLSearchParams({ type: 'AI_CASE', pageSize: '100' });
  if (search.trim()) query.set('search', search.trim());
  const cases = await serverApiFetch<CaseListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() });
  return (
    <main className="px-5 py-8 md:px-8 md:py-10">
      <CatalogPageHeader eyebrow="PRACTICE EVIDENCE" title="AI 案例" description="记录 AI 辅助设计实践中的输入、人工职责、验证方式与已观察到的结果。" search={search} searchId="case-search" searchPlaceholder="搜索案例名称或摘要" count={`${cases.total} 个已发布案例`} />
      {cases.items.length ? <section className="mt-5 grid gap-4 md:grid-cols-2">{cases.items.map((item) => <Card key={item.id} className="min-h-56 border border-white/10 bg-white/[0.035] py-5 shadow-none transition hover:border-white/25 hover:bg-white/[0.055]"><CardHeader><div className="flex items-center justify-between gap-3 text-xs text-white/45"><Badge variant="outline" className="border-white/10 text-white/55">{item.category?.name ?? '未分类'}</Badge><span>{verificationLabels[item.verificationStatus] ?? item.verificationStatus}</span></div><CardTitle className="mt-3 text-lg leading-7 text-white"><Link className="hover:text-violet-200 hover:underline hover:underline-offset-4" href={`/workspace/ai-cases/${item.slug}`}>{item.title}</Link></CardTitle><p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">{item.summary ?? '暂无说明'}</p></CardHeader><CardContent className="mt-auto"><div className="border-t border-white/10 pt-4 text-sm text-white/65">{item.caseDetail?.metricName ?? '指标待验证'}</div></CardContent><CardFooter className="justify-end border-0 bg-transparent px-5 pb-0"><Link className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white" href={`/workspace/ai-cases/${item.slug}`}>查看案例 <ArrowRight className="size-4" /></Link></CardFooter></Card>)}</section> : <section className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center text-sm text-white/45">没有找到可访问的 AI 案例。</section>}
    </main>
  );
}
