import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, serverApiFetch } from '@/lib/api';
import { getImportedCatalogBody, verificationLabels, type AICaseDetail } from '@/lib/ai-catalog';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { PublishedEdit } from '../../published-edit';
import { ContentLifecycle } from '../../content-lifecycle';

function Block({ label, value }: { label: string; value: string | null | undefined }) { return <section><p className="text-xs tracking-[0.16em] text-neutral-500">{label}</p><p className="mt-3 text-sm leading-7 text-neutral-300">{value ?? '暂无内容'}</p></section>; }

export default async function AICaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let item: AICaseDetail;
  try { item = await serverApiFetch<AICaseDetail>(`/api/contents/${encodeURIComponent(slug)}`, { headers: await authenticatedApiHeaders() }); }
  catch (error: unknown) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const currentUser = await loadCurrentUser();
  const canEdit = currentUser?.id === item.owner.id || currentUser?.permissions.includes('content.edit_all');
  const canUnpublish = currentUser?.permissions.includes('content.unpublish') ?? false;
  const canArchive = currentUser?.permissions.includes('content.archive') ?? false;
  const detail = item.caseDetail;
  const body = getImportedCatalogBody(item.currentVersion?.body);
  return (
    <main className="mx-auto max-w-6xl px-6 py-7 md:px-10">
      <Link className="text-sm text-neutral-500 hover:text-neutral-300" href="/workspace/ai-cases">← 返回 AI 案例</Link>
      <header className="mt-6 border-b border-[var(--border)] pb-7"><p className="text-xs tracking-[0.18em] text-neutral-500">{item.category?.name ?? 'PRACTICE EVIDENCE'}</p><div className="mt-3 flex flex-wrap items-start justify-between gap-4"><h1 className="text-3xl font-semibold leading-tight">{item.title}</h1><div className="flex flex-wrap items-start justify-end gap-3">{canEdit ? <PublishedEdit contentId={item.id} /> : null}<ContentLifecycle canArchive={canArchive} canUnpublish={canUnpublish} contentId={item.id} /></div></div><p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">{item.summary ?? '暂无说明'}</p><div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500"><span>状态：{verificationLabels[item.verificationStatus] ?? item.verificationStatus}</span><span>验证：{detail?.validationMethod ?? body.validation ?? '待补充'}</span><span>版本：{item.currentVersion?.versionLabel ?? 'v1'}</span></div></header>
      <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-8"><Block label="BACKGROUND" value={detail?.background} /><section className="border-t border-[var(--border)] pt-7"><h2 className="text-lg font-medium">AI 与人工职责</h2><div className="mt-5 grid gap-6 md:grid-cols-2"><Block label="AI RESPONSIBILITY" value={detail?.aiResponsibilities} /><Block label="HUMAN RESPONSIBILITY" value={detail?.humanResponsibilities} /></div></section><section className="border-t border-[var(--border)] pt-7"><Block label="RESULT" value={detail?.resultSummary} /></section></div><aside className="space-y-5"><section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-xs tracking-[0.14em] text-neutral-500">EVIDENCE</p><h2 className="mt-2 text-base font-medium">验证信息</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-neutral-500">观察指标</dt><dd>{detail?.metricName ?? body.metric ?? '待验证'}</dd></div><div className="flex justify-between gap-3"><dt className="text-neutral-500">验证样本</dt><dd>{body.sample ?? '待补充'}</dd></div><div className="flex justify-between gap-3"><dt className="text-neutral-500">原流程</dt><dd>{body.before ?? detail?.originalProcess ?? '待补充'}</dd></div><div className="flex justify-between gap-3"><dt className="text-neutral-500">当前方式</dt><dd>{body.after ?? '待补充'}</dd></div></dl></section><section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-xs tracking-[0.14em] text-neutral-500">SOURCE TRACEABILITY</p><p className="mt-3 text-sm leading-6 text-neutral-400">该案例来自批准的 v9-1 实践库。指标与结论保留原始验证状态，不代表新的生产验证。</p></section></aside></div>
    </main>
  );
}
