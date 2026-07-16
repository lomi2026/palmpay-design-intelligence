import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, serverApiFetch } from '@/lib/api';
import { getImportedCatalogBody, type AISkillDetail } from '@/lib/ai-catalog';
import { authenticatedApiHeaders } from '@/lib/auth';

function Field({ label, value }: { label: string; value: string | undefined }) {
  return <div className="grid grid-cols-[90px_minmax(0,1fr)] gap-3 py-3 text-sm"><dt className="text-neutral-500">{label}</dt><dd className="text-neutral-200">{value ?? '暂无'}</dd></div>;
}

export default async function AISkillDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let skill: AISkillDetail;
  try { skill = await serverApiFetch<AISkillDetail>(`/api/contents/${encodeURIComponent(slug)}`, { headers: await authenticatedApiHeaders() }); }
  catch (error: unknown) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const detail = skill.skillDetail;
  const body = getImportedCatalogBody(skill.currentVersion?.body);
  return (
    <main className="mx-auto max-w-6xl px-6 py-7 md:px-10">
      <Link className="text-sm text-neutral-500 hover:text-neutral-300" href="/workspace/ai-skills">← 返回 AI Skill</Link>
      <header className="mt-6 border-b border-[var(--border)] pb-7">
        <p className="text-xs tracking-[0.18em] text-neutral-500">{skill.category?.name ?? 'AI CAPABILITY'}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{skill.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">{skill.summary ?? '暂无说明'}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500"><span>适用角色：{detail?.applicableRoles.join(' / ') || '待补充'}</span><span>版本：{skill.currentVersion?.versionLabel ?? 'v1'}</span><span>仅供人工复核后使用</span></div>
      </header>
      <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          <section><p className="text-xs tracking-[0.16em] text-neutral-500">INPUT</p><h2 className="mt-2 text-lg font-medium">所需输入</h2><p className="mt-3 text-sm leading-7 text-neutral-300">{detail?.inputRequirements?.description ?? '暂无输入要求'}</p></section>
          <section className="border-t border-[var(--border)] pt-7"><p className="text-xs tracking-[0.16em] text-neutral-500">OUTPUT</p><h2 className="mt-2 text-lg font-medium">预期输出</h2><p className="mt-3 text-sm leading-7 text-neutral-300">{detail?.outputSchema?.description ?? '暂无输出说明'}</p></section>
          <section className="border-t border-[var(--border)] pt-7"><p className="text-xs tracking-[0.16em] text-neutral-500">PROMPT TEMPLATE</p><h2 className="mt-2 text-lg font-medium">提示词模板</h2><pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-7 text-neutral-300">{detail?.promptTemplate ?? '暂无模板'}</pre></section>
        </div>
        <aside className="space-y-5">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-xs tracking-[0.14em] text-neutral-500">EXECUTION</p><h2 className="mt-2 text-base font-medium">执行边界</h2><dl className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]"><Field label="预计时长" value={body.duration ?? detail?.executionSteps?.duration} /><Field label="复杂度" value={body.complexity ?? detail?.executionSteps?.complexity} /><Field label="推荐模型" value={detail?.recommendedModels.join(' / ')} /><Field label="数据等级" value={detail?.dataSecurityLevel} /></dl></section>
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"><p className="text-xs tracking-[0.14em] text-neutral-500">HUMAN REVIEW</p><h2 className="mt-2 text-base font-medium">人工复核</h2><p className="mt-3 text-sm leading-6 text-neutral-400">{detail?.humanReviewRules?.note ?? '使用前需由责任设计师确认输入、事实与最终输出。'}</p></section>
        </aside>
      </div>
    </main>
  );
}
