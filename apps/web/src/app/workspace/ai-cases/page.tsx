import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import type { ContentCard, ContentListResponse } from '@/lib/content-types';
import { CatalogPageHeader } from '@/components/workspace/catalog-page-header';
import { CatalogFilterControls } from '@/components/workspace/catalog-filter-controls';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspaceEmptyState } from '@/components/workspace/workspace-empty-state';
import { WorkspaceStatusBadge } from '@/components/workspace/workspace-status-badge';

type CaseCard = ContentCard & { caseDetail?: { metricName: string | null } | null };
type CaseListResponse = Omit<ContentListResponse, 'items'> & { items: CaseCard[] };

export default async function AICasesPage({ searchParams }: { searchParams: Promise<{ search?: string; categoryId?: string; tag?: string; verificationStatus?: string }> }) {
  const { search = '', categoryId, tag, verificationStatus } = await searchParams;
  const filters = { search: search.trim() || undefined, categoryId, tag, verificationStatus };
  const query = new URLSearchParams({ type: 'AI_CASE', pageSize: '100' });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  const baseQuery = new URLSearchParams({ type: 'AI_CASE', pageSize: '100' });
  const [cases, filterSource] = await Promise.all([
    serverApiFetch<CaseListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() }),
    serverApiFetch<CaseListResponse>(`/api/contents?${baseQuery}`, { headers: await authenticatedApiHeaders() }),
  ]);
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <CatalogPageHeader eyebrow="PRACTICE EVIDENCE" title="AI 案例" description="记录 AI 辅助设计实践中的输入、人工职责、验证方式与已观察到的结果。" search={search} searchId="case-search" searchPlaceholder="搜索案例名称或摘要" count={`${cases.total} 个已发布案例`} filterParams={{ categoryId, tag, verificationStatus }} />
      <CatalogFilterControls contents={filterSource.items} filters={filters} pathname="/workspace/ai-cases" searchPlaceholder="搜索案例名称或摘要" />
      {cases.items.length ? <section className="mt-5 grid gap-3 md:grid-cols-2">{cases.items.map((item) => <Card key={item.id} className="group min-h-56 border border-[var(--v9-line)] bg-[var(--v9-panel)] py-5 shadow-none transition hover:-translate-y-0.5 hover:border-[var(--v9-line-strong)] hover:bg-[var(--v9-panel-2)]"><CardHeader><div className="flex items-center justify-between gap-3 text-[11px] text-[var(--v9-subtle)]"><Badge variant="outline" className="border-[var(--v9-line)] bg-[var(--v9-soft)] text-[var(--v9-copy)]">{item.category?.name ?? '未分类'}</Badge><WorkspaceStatusBadge status={item.verificationStatus} /></div><CardTitle className="mt-4 text-[19px] leading-7 text-[var(--v9-text)]"><Link className="transition group-hover:text-[var(--v9-muted)]" href={`/workspace/ai-cases/${item.slug}`} prefetch={false}>{item.title}</Link></CardTitle><p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--v9-copy)]">{item.summary ?? '暂无说明'}</p></CardHeader><CardContent className="mt-auto"><div className="border-t border-[var(--v9-line)] pt-4 text-sm text-[var(--v9-muted)]"><span className="mr-2 text-[10px] tracking-[.12em] text-[var(--v9-subtle)]">观察指标</span>{item.caseDetail?.metricName ?? '指标待验证'}</div></CardContent><CardFooter className="justify-between border-0 bg-transparent px-5 pb-5"><span className="text-xs text-[var(--v9-subtle)]">负责人 · {item.owner.name}</span><Link className="inline-flex items-center gap-1 text-sm text-[var(--v9-copy)] transition hover:text-[var(--v9-text)]" href={`/workspace/ai-cases/${item.slug}`} prefetch={false}>查看案例 <ArrowRight className="size-4" /></Link></CardFooter></Card>)}</section> : <WorkspaceEmptyState className="mt-5 py-16 text-center">没有找到可访问的 AI 案例。</WorkspaceEmptyState>}
    </main>
  );
}
