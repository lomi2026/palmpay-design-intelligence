import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ApiError, serverApiFetch } from '@/lib/api';
import { getImportedCatalogBody, verificationLabels, type AICaseDetail } from '@/lib/ai-catalog';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { PublishedEdit } from '../../published-edit';
import { ContentLifecycle } from '../../content-lifecycle';
import {
  ContentEngagementLinks,
  FavoriteControl,
} from '@/components/workspace/engagement-controls';
import { UsageSummary } from '@/components/workspace/usage-summary';
import { PublishedAttachments } from '@/components/workspace/published-attachments';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function Block({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <section>
      <p className="text-xs tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-3 text-sm leading-7 text-neutral-300">{value ?? '暂无内容'}</p>
    </section>
  );
}

export default async function AICaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let item: AICaseDetail;
  try {
    item = await serverApiFetch<AICaseDetail>(`/api/contents/${encodeURIComponent(slug)}`, {
      headers: await authenticatedApiHeaders(),
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const currentUser = await loadCurrentUser();
  const canEdit =
    (currentUser?.id === item.owner.id &&
      currentUser.permissions.includes('content.edit_own')) ||
    currentUser?.permissions.includes('content.edit_all');
  const canUnpublish = currentUser?.permissions.includes('content.unpublish') ?? false;
  const canArchive = currentUser?.permissions.includes('content.archive') ?? false;
  const usage = await serverApiFetch<{
    usageCount: number;
    projectReferences: number;
    favoriteCount: number;
  }>(`/api/contents/${item.id}/usage-summary`, { headers: await authenticatedApiHeaders() });
  const detail = item.caseDetail;
  const body = getImportedCatalogBody(item.currentVersion?.body);
  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_8%_0%,rgba(255,255,255,.065),transparent_30%),#090909] px-4 py-5 md:px-6"><div className="mx-auto max-w-[1232px]">
      <Link className="inline-flex items-center gap-2 text-[12px] text-white/55 transition hover:text-white" href="/workspace/ai-cases"><ArrowLeft className="size-4" />返回 AI 案例</Link>
      <section className="mt-5"><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div className="min-w-0"><p className="text-[12px] font-bold uppercase tracking-[.16em] text-white/45">Verified AI practice</p><h1 className="mt-2 break-words text-[42px] font-semibold tracking-[-.055em] text-white md:text-[58px]">{item.title}</h1><p className="mt-3 max-w-[760px] text-[15px] leading-7 text-white/55">{item.summary ?? detail?.background ?? '暂无案例说明。'}</p></div><div className="flex min-w-0 flex-wrap justify-start gap-2 sm:justify-end"><FavoriteControl contentId={item.id} returnTo={`/workspace/ai-cases/${item.slug}`} /><ContentEngagementLinks contentId={item.id} />{canEdit ? <PublishedEdit contentId={item.id} /> : null}<ContentLifecycle canArchive={canArchive} canUnpublish={canUnpublish} contentId={item.id} /></div></div>
        <article className="grid overflow-hidden rounded-[24px] border border-white/[.1] bg-[#111] lg:grid-cols-[1.08fr_.92fr]"><div className="border-b border-white/[.1] bg-black/20 p-6 lg:border-b-0 lg:border-r lg:p-9"><div className="mb-7 flex items-center justify-between"><p className="text-[9px] uppercase tracking-[.13em] text-white/45">Before / After</p><Badge variant="outline" className="border-white/[.14] bg-white/[.04] text-[9px] text-white/60">{verificationLabels[item.verificationStatus] ?? item.verificationStatus}</Badge></div><div className="grid items-center gap-4 md:grid-cols-[1fr_36px_1fr]"><div className="rounded-2xl border border-white/[.1] bg-[#111] p-4"><div className="flex justify-between text-[8px] text-white/45"><span>原流程</span><span>{body.before ?? '待补充'}</span></div><div className="mt-3 h-[205px] rounded-[10px] border border-white/[.1] bg-black/20 p-3"><i className="mb-3 block h-[18px] border-b border-white/[.1]" /><div className="grid grid-cols-2 gap-2"><i className="h-[67px] rounded-[7px] border border-white/[.1] bg-white/[.035]" /><i className="h-[67px] rounded-[7px] border border-white/[.1] bg-white/[.035]" /><i className="col-span-2 h-12 rounded-[7px] border border-white/[.1] bg-white/[.035]" /></div></div></div><ArrowRight className="mx-auto size-5 text-white/45" /><div className="rounded-2xl border border-white/[.1] bg-[#111] p-4"><div className="flex justify-between text-[8px] text-white/45"><span>AI 协同流程</span><span>{body.after ?? '待补充'}</span></div><div className="mt-3 grid h-[205px] grid-cols-[40px_1fr] overflow-hidden rounded-[10px] border border-white/[.1] bg-black/20"><div className="border-r border-white/[.1] p-2">{[1, 2, 3, 4].map((part) => <i className="my-2 block h-1.5 rounded bg-white/[.13]" key={part} />)}</div><div className="p-3"><i className="mb-3 block h-2 w-[45%] rounded bg-white/[.18]" /><div className="grid grid-cols-2 gap-2">{[1, 2, 3, 4].map((part) => <i className="h-14 rounded-[7px] border border-white/[.1] bg-white/[.035]" key={part} />)}</div></div></div></div></div></div><div className="p-7 md:p-[42px]"><Badge variant="outline" className="border-white/[.14] bg-white/[.04] text-[10px] text-white/65">{detail?.metricName ?? body.metric ?? '实践案例'}</Badge><h2 className="mt-[18px] text-[34px] font-semibold leading-[1.12] tracking-[-.045em] text-white">从 AI 协同到可复用方法</h2><p className="mt-3 text-[13px] leading-[1.75] text-white/50">{detail?.background ?? item.summary ?? '暂无背景说明。'}</p><div className="my-7 grid gap-3">{[['01','AI 介入',detail?.aiResponsibilities ?? '暂无记录。'],['02','设计师判断',detail?.humanResponsibilities ?? '暂无记录。'],['03','验证方式',detail?.validationMethod ?? body.validation ?? '暂无记录。']].map(([number,title,copy]) => <div className="grid grid-cols-[28px_1fr] gap-3" key={number}><span className="grid size-7 place-items-center rounded-lg border border-white/[.1] bg-white/[.04] text-[9px] text-white/45">{number}</span><div><b className="block text-[11px] text-white">{title}</b><p className="mt-0.5 text-[10px] leading-5 text-white/50">{copy}</p></div></div>)}</div><UsageSummary summary={usage} /></div></article>
      </section>
      <section className="mt-[58px] grid gap-4 lg:grid-cols-[1.08fr_.92fr]"><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-7 md:p-[36px]"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Practice evidence</p><h2 className="mt-2 text-[34px] font-semibold tracking-[-.045em] text-white">结果、验证与边界</h2><div className="mt-6 grid gap-5 md:grid-cols-2"><Block label="RESULT" value={detail?.resultSummary} /><Block label="METRIC" value={detail?.metricName ?? body.metric} /><Block label="VALIDATION" value={detail?.validationMethod ?? body.validation} /><Block label="LIMITS" value="正式案例尚未补充可复用边界与限制；使用前需由责任设计师复核输入、结论与适用场景。" /></div></CardContent></Card><div className="space-y-4"><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-6"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Evidence record</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.035em] text-white">验证信息</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-white/45">验证样本</dt><dd className="text-right text-white">{body.sample ?? '待补充'}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/45">原流程</dt><dd className="text-right text-white">{body.before ?? detail?.originalProcess ?? '待补充'}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/45">当前方式</dt><dd className="text-right text-white">{body.after ?? '待补充'}</dd></div><div className="flex justify-between gap-3"><dt className="text-white/45">内容版本</dt><dd className="text-right text-white">{item.currentVersion?.versionLabel ?? 'v1'}</dd></div></dl></CardContent></Card><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-6"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Source traceability</p><p className="mt-3 text-sm leading-6 text-white/55">该案例来自批准的 v9-1 实践库。指标与结论保留原始验证状态，不代表新的生产验证。</p></CardContent></Card></div></section>
      <div className="mt-4 max-w-[420px]"><PublishedAttachments attachments={item.attachments} /></div>
    </div></main>
  );
}
