import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ApiError, serverApiFetch } from '@/lib/api';
import { getImportedCatalogBody, type AISkillDetail } from '@/lib/ai-catalog';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { PublishedEdit } from '../../published-edit';
import { ContentLifecycle } from '../../content-lifecycle';
import {
  ContentEngagementLinks,
  FavoriteControl,
} from '@/components/workspace/engagement-controls';
import { UsageSummary } from '@/components/workspace/usage-summary';
import { PublishedAttachments } from '@/components/workspace/published-attachments';
import { CopyTextButton } from '@/components/workspace/copy-text-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

function Field({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-3 py-3 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-neutral-200">{value ?? '暂无'}</dd>
    </div>
  );
}

function StructuredValue({ value, empty }: { value: unknown; empty: string }) {
  if (value === null || value === undefined) return <p className="text-sm text-white/45">{empty}</p>;
  if (typeof value === 'string') return <p className="whitespace-pre-wrap text-sm leading-7 text-white/60">{value}</p>;
  return <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-white/60">{JSON.stringify(value, null, 2)}</pre>;
}

export default async function AISkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let skill: AISkillDetail;
  try {
    skill = await serverApiFetch<AISkillDetail>(`/api/contents/${encodeURIComponent(slug)}`, {
      headers: await authenticatedApiHeaders(),
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const currentUser = await loadCurrentUser();
  const canEdit =
    currentUser?.id === skill.owner.id || currentUser?.permissions.includes('content.edit_all');
  const canUnpublish = currentUser?.permissions.includes('content.unpublish') ?? false;
  const canArchive = currentUser?.permissions.includes('content.archive') ?? false;
  const usage = await serverApiFetch<{
    usageCount: number;
    projectReferences: number;
    favoriteCount: number;
  }>(`/api/contents/${skill.id}/usage-summary`, { headers: await authenticatedApiHeaders() });
  const detail = skill.skillDetail;
  const body = getImportedCatalogBody(skill.currentVersion?.body);
  const version = skill.currentVersion?.versionLabel ?? detail?.promptVersion ?? 'v1';
  const scope = detail?.applicableRoles?.length ? detail.applicableRoles : ['待补充'];
  return (
    <main className="min-h-full bg-[radial-gradient(circle_at_8%_0%,rgba(255,255,255,.065),transparent_30%),#090909] px-4 py-5 md:px-6">
      <div className="mx-auto max-w-[1232px]">
        <Link className="inline-flex items-center gap-2 text-[12px] text-white/55 transition hover:text-white" href="/workspace/ai-skills"><ArrowLeft className="size-4" />返回 AI Skill</Link>
        <section className="mt-5 overflow-hidden rounded-[28px] border border-white/[.1] bg-[linear-gradient(145deg,#111,#171717)]">
          <div className="grid lg:grid-cols-[1.18fr_.82fr]">
            <div className="p-7 md:p-12">
              <div className="flex flex-wrap items-start justify-between gap-5"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-[.16em] text-white/45">{skill.category?.name ?? 'AI capability'} · Reusable method</p><h1 className="mt-3 max-w-[760px] break-words text-[42px] font-semibold leading-[1.02] tracking-[-.055em] text-white md:text-[60px]">{skill.title}</h1></div><div className="flex min-w-0 flex-wrap justify-start gap-2 sm:justify-end"><FavoriteControl contentId={skill.id} returnTo={`/workspace/ai-skills/${skill.slug}`} /><ContentEngagementLinks contentId={skill.id} />{canEdit ? <PublishedEdit contentId={skill.id} /> : null}<ContentLifecycle canArchive={canArchive} canUnpublish={canUnpublish} contentId={skill.id} /></div></div>
              <p className="mt-5 max-w-[760px] text-[16px] leading-8 text-white/55">{skill.summary ?? '暂无说明'}</p>
              <div className="mt-7 flex flex-wrap gap-2">{scope.map((role) => <Badge className="border-white/[.12] bg-white/[.06] text-white/70" variant="outline" key={role}>{role}</Badge>)}</div>
              <UsageSummary summary={usage} />
            </div>
            <aside className="border-t border-white/[.1] bg-[linear-gradient(180deg,rgba(255,255,255,.035),transparent_44%),repeating-linear-gradient(90deg,transparent_0_49px,rgba(255,255,255,.1)_50px),repeating-linear-gradient(0deg,transparent_0_49px,rgba(255,255,255,.1)_50px)] p-7 md:p-9 lg:border-l lg:border-t-0"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-white/45">Method brief</p><h2 className="mt-3 text-[28px] font-semibold leading-[1.1] tracking-[-.04em] text-white">开始前先确认输入与人工判断</h2><p className="mt-4 text-[13px] leading-6 text-white/55">{detail?.inputRequirements?.description ?? '当前 Skill 尚未补充输入要求。'}</p><div className="mt-6 space-y-2.5">{[['版本', version], ['推荐模型', detail?.recommendedModels.join(' / ') || '待补充'], ['数据等级', detail?.dataSecurityLevel ?? '待补充']].map(([label, value]) => <div className="flex items-center justify-between rounded-[12px] border border-white/[.1] bg-[#090909]/70 px-3.5 py-3 text-[12px]" key={label}><span className="text-white/45">{label}</span><strong className="text-right font-medium text-white/80">{value}</strong></div>)}</div></aside>
          </div>
        </section>
        <section className="mt-[58px] grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4"><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-7 md:p-9"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Workflow</p><h2 className="mt-2 text-[34px] font-semibold tracking-[-.045em] text-white">输入、输出与执行</h2><div className="mt-6 grid gap-6 border-t border-white/[.1] pt-6 md:grid-cols-2"><div><p className="text-[11px] font-bold tracking-[.13em] text-white/45">INPUT REQUIREMENTS</p><p className="mt-3 text-sm leading-7 text-white/60">{detail?.inputRequirements?.description ?? '暂无输入要求'}</p></div><div><p className="text-[11px] font-bold tracking-[.13em] text-white/45">OUTPUT STRUCTURE</p><p className="mt-3 text-sm leading-7 text-white/60">{detail?.outputSchema?.description ?? '暂无输出说明'}</p></div></div><div className="mt-6 border-t border-white/[.1] pt-6"><p className="text-[11px] font-bold tracking-[.13em] text-white/45">EXECUTION STEPS</p><p className="mt-3 text-sm leading-7 text-white/60">{detail?.executionSteps?.description ?? '执行步骤待补充；请在使用前与负责人确认。'}</p></div></CardContent></Card><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-7 md:p-9"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Prompt template</p><h2 className="mt-2 text-[34px] font-semibold tracking-[-.045em] text-white">可复用提示词</h2></div>{detail?.promptTemplate ? <CopyTextButton label="复制提示词" text={detail.promptTemplate} /> : null}</div><pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-[14px] border border-white/[.1] bg-black/25 p-5 text-[13px] leading-7 text-white/65">{detail?.promptTemplate ?? '暂无模板'}</pre></CardContent></Card><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-7 md:p-9"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Examples</p><h2 className="mt-2 text-[34px] font-semibold tracking-[-.045em] text-white">测试样例</h2><div className="mt-6 grid gap-5 md:grid-cols-2"><div><p className="mb-3 text-[11px] font-bold tracking-[.13em] text-white/45">EXAMPLE INPUT</p><StructuredValue value={detail?.exampleInput} empty="暂无示例输入" /></div><div><p className="mb-3 text-[11px] font-bold tracking-[.13em] text-white/45">EXAMPLE OUTPUT</p><StructuredValue value={detail?.exampleOutput} empty="暂无示例输出" /></div></div></CardContent></Card></div>
          <aside className="space-y-4"><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-6"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Execution boundary</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.035em] text-white">执行条件</h2><dl className="mt-4 divide-y divide-white/[.1] border-y border-white/[.1]"><Field label="预计时长" value={body.duration ?? detail?.executionSteps?.duration} /><Field label="复杂度" value={body.complexity ?? detail?.executionSteps?.complexity} /><Field label="内容版本" value={version} /><Field label="负责人" value={skill.owner.name} /></dl></CardContent></Card><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-6"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Human review</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.035em] text-white">人工复核</h2><p className="mt-3 text-sm leading-6 text-white/55">{detail?.humanReviewRules?.note ?? '使用前需由责任设计师确认输入、事实与最终输出。'}</p><div className="mt-4 flex items-start gap-2 text-[12px] leading-5 text-white/45"><Check className="mt-0.5 size-3.5 shrink-0 text-white/70" />最终结果不得跳过责任设计师判断。</div></CardContent></Card><Card className="border-white/[.1] bg-[#111] py-0 shadow-none"><CardContent className="p-6"><p className="text-[12px] font-bold uppercase tracking-[.14em] text-white/45">Limitations</p><h2 className="mt-1 text-[24px] font-semibold tracking-[-.035em] text-white">限制与风险</h2><p className="mt-3 text-sm leading-6 text-white/55">{detail?.limitations ?? '尚未补充已知限制；请勿将输出直接用于决策或对外发布。'}</p></CardContent></Card><Link className="flex items-center justify-between rounded-[14px] border border-white/[.1] bg-white/[.035] px-5 py-4 text-sm text-white/70 transition hover:bg-white/[.07]" href="/workspace/ai-projects"><span>在 AI 项目中引用此方法</span><ArrowRight className="size-4" /></Link></aside>
        </section>
        <div className="mt-4 max-w-[340px]"><PublishedAttachments attachments={skill.attachments} /></div>
      </div>
    </main>
  );
}
