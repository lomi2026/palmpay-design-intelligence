import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Paperclip } from 'lucide-react';
import { ApiError, serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { PublishedEdit } from '../../published-edit';
import { ContentLifecycle } from '../../content-lifecycle';
import type { DesignAssetDetail } from '@/lib/content-types';
import {
  ContentEngagementLinks,
  FavoriteControl,
} from '@/components/workspace/engagement-controls';
import { UsageSummary } from '@/components/workspace/usage-summary';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function TextList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="text-sm text-neutral-500">{empty}</p>;
  return (
    <ul className="space-y-2 text-sm leading-6 text-neutral-300">
      {items.map((item) => (
        <li className="flex gap-2" key={item}>
          <span className="text-neutral-600">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StructuredValue({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <p className="text-sm text-neutral-500">暂无内容</p>;
  if (typeof value === 'string')
    return <p className="whitespace-pre-wrap text-sm leading-7 text-neutral-300">{value}</p>;
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-neutral-300">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default async function DesignAssetDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let content: DesignAssetDetail;
  try {
    content = await serverApiFetch<DesignAssetDetail>(`/api/contents/${encodeURIComponent(slug)}`, {
      headers: await authenticatedApiHeaders(),
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const currentUser = await loadCurrentUser();
  const canEdit =
    currentUser?.id === content.owner.id || currentUser?.permissions.includes('content.edit_all');
  const canUnpublish = currentUser?.permissions.includes('content.unpublish') ?? false;
  const canArchive = currentUser?.permissions.includes('content.archive') ?? false;
  const usage = await serverApiFetch<{
    usageCount: number;
    projectReferences: number;
    favoriteCount: number;
  }>(`/api/contents/${content.id}/usage-summary`, { headers: await authenticatedApiHeaders() });

  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_8%_0%,rgba(255,255,255,.065),transparent_30%),#090909] px-4 py-5 md:px-6"><div className="mx-auto max-w-[1232px]">
      <Link className="inline-flex items-center gap-2 text-[12px] text-white/55 transition hover:text-white" href="/workspace/design-assets"><ArrowLeft className="size-4" />返回设计资产</Link>
      <section className="mt-5 overflow-hidden rounded-[28px] border border-white/[.1] bg-[linear-gradient(145deg,#111,#171717)]"><div className="grid lg:grid-cols-[1.2fr_.8fr]"><div className="p-7 md:p-12"><div className="flex flex-wrap items-start justify-between gap-5"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">{content.category?.name ?? 'Design asset'} · {content.assetDetail?.assetType ?? '设计资产'}</p><h1 className="mt-3 max-w-[760px] break-words text-[42px] font-semibold leading-[1.02] tracking-[-.055em] text-white md:text-[60px]">{content.title}</h1></div><div className="flex min-w-0 flex-wrap justify-start gap-2 sm:justify-end"><FavoriteControl contentId={content.id} returnTo={`/workspace/design-assets/${content.slug}`} /><ContentEngagementLinks contentId={content.id} />{canEdit ? <PublishedEdit contentId={content.id} /> : null}<ContentLifecycle canArchive={canArchive} canUnpublish={canUnpublish} contentId={content.id} /></div></div><p className="mt-5 max-w-[760px] text-[16px] leading-8 text-white/55">{content.summary ?? '暂无摘要'}</p><div className="mt-8 grid gap-2.5 sm:grid-cols-3"><div className="rounded-[15px] border border-white/[.1] bg-[#090909] p-4"><small className="text-[11px] font-bold text-white/45">当前版本</small><strong className="mt-1.5 block text-[15px] text-white">{content.currentVersion?.versionLabel ?? `v${content.currentVersion?.versionNumber ?? 1}`}</strong></div><div className="rounded-[15px] border border-white/[.1] bg-[#090909] p-4"><small className="text-[11px] font-bold text-white/45">维护团队</small><strong className="mt-1.5 block text-[15px] text-white">{content.team.name}</strong></div><div className="rounded-[15px] border border-white/[.1] bg-[#090909] p-4"><small className="text-[11px] font-bold text-white/45">最后更新</small><strong className="mt-1.5 block text-[15px] text-white">{new Intl.DateTimeFormat('zh-CN').format(new Date(content.updatedAt))}</strong></div></div><UsageSummary summary={usage} /></div><aside className="border-t border-white/[.1] bg-[linear-gradient(180deg,rgba(255,255,255,.035),transparent_44%),repeating-linear-gradient(90deg,transparent_0_49px,rgba(255,255,255,.1)_50px),repeating-linear-gradient(0deg,transparent_0_49px,rgba(255,255,255,.1)_50px)] p-7 md:p-9 lg:border-l lg:border-t-0"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-white/45">Decision brief</p><h2 className="mt-3 text-[28px] font-semibold leading-[1.1] tracking-[-.04em] text-white">是否适用于当前任务？</h2><p className="mt-4 text-[13px] leading-6 text-white/55">{content.assetDetail?.problemStatement ?? '暂无问题说明'}</p><div className="mt-6"><p className="text-[10px] font-bold tracking-[.12em] text-white/45">支持平台</p><div className="mt-2 flex flex-wrap gap-2">{(content.assetDetail?.platforms ?? []).length ? content.assetDetail?.platforms.map((platform) => <Badge className="border-white/[.12] bg-white/[.06] text-white/70" variant="outline" key={platform}>{platform}</Badge>) : <span className="text-sm text-white/45">待补充</span>}</div></div><div className="mt-6 rounded-[14px] border border-dashed border-white/[.12] p-3.5 text-[12px] leading-5 text-white/50">负责人：{content.owner.name}<br />维护周期：{content.assetDetail?.maintenanceCycleDays ? `${content.assetDetail.maintenanceCycleDays} 天` : '待补充'}</div></aside></div></section>
      <section className="mt-[58px] grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]"><div className="space-y-4"><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-7 md:p-9"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Usage guide</p><h2 className="mt-2 text-[34px] font-semibold tracking-[-.045em] text-white">如何使用</h2><div className="mt-5"><StructuredValue value={content.assetDetail?.usageGuide} /></div></CardContent></Card><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-7 md:p-9"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Content version</p><h2 className="mt-2 text-[34px] font-semibold tracking-[-.045em] text-white">资产说明</h2><div className="mt-5"><StructuredValue value={content.currentVersion?.body} /></div></CardContent></Card></div><aside className="space-y-4"><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-6"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Applicable</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.035em] text-white">适用场景</h2><div className="mt-4"><TextList items={content.assetDetail?.scenarios ?? []} empty="暂未填写适用场景" /></div></CardContent></Card><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-6"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Constraints</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.035em] text-white">不适用场景</h2><div className="mt-4"><TextList items={content.assetDetail?.unsuitableScenarios ?? []} empty="暂未填写限制条件" /></div></CardContent></Card><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-6"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Relations</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.035em] text-white">关联内容与附件</h2><p className="mt-3 flex items-center gap-2 text-sm text-white/55"><Paperclip className="size-4" />{content.attachments.length ? `${content.attachments.length} 个附件` : '暂无附件'}</p>{content.sourceRelations.length ? <div className="mt-4 grid gap-2">{content.sourceRelations.map(({ targetContent }) => <Link className="flex items-center justify-between rounded-[10px] border border-white/[.1] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[.06]" href={`/workspace/${targetContent.contentType === 'AI_SKILL' ? 'ai-skills' : targetContent.contentType === 'AI_CASE' ? 'ai-cases' : targetContent.contentType === 'AI_PROJECT' ? 'ai-projects' : 'design-assets'}/${targetContent.slug}`} key={targetContent.id}><span className="truncate">{targetContent.title}</span><ArrowRight className="size-4 shrink-0" /></Link>)}</div> : <p className="mt-4 text-sm text-white/45">暂无关联内容</p>}</CardContent></Card></aside></section>
    </div></main>
  );
}
