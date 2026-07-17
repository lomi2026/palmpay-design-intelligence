import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, serverApiFetch } from '@/lib/api';
import {
  getImportedProjectBody,
  stageLabels,
  verificationLabels,
  type AIProjectDetail,
} from '@/lib/ai-projects';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { PublishedEdit } from '../../published-edit';
import { ContentLifecycle } from '../../content-lifecycle';

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 py-3 text-sm">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-neutral-200">{value ?? '暂无'}</dd>
    </div>
  );
}

export default async function AIProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let project: AIProjectDetail;
  try {
    project = await serverApiFetch<AIProjectDetail>(`/api/contents/${encodeURIComponent(slug)}`, {
      headers: await authenticatedApiHeaders(),
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const currentUser = await loadCurrentUser();
  const canEdit = currentUser?.id === project.owner.id || currentUser?.permissions.includes('content.edit_all');
  const canUnpublish = currentUser?.permissions.includes('content.unpublish') ?? false;
  const canArchive = currentUser?.permissions.includes('content.archive') ?? false;

  const detail = project.projectDetail;
  const body = getImportedProjectBody(project.currentVersion?.body);
  const priority = body.prioritization;
  const stage = detail ? stageLabels[detail.projectStage] : '待补充';

  return (
    <main className="mx-auto max-w-6xl px-6 py-7 md:px-10">
      <Link className="text-sm text-neutral-500 hover:text-neutral-300" href="/workspace/ai-projects">
        ← 返回 AI 项目库
      </Link>

      <header className="mt-6 border-b border-[var(--border)] pb-7">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          <span className="font-mono text-neutral-300">{detail?.projectCode ?? 'AI PROJECT'}</span>
          <span>·</span>
          <span>{detail?.domain ?? project.category?.name ?? '未分类'}</span>
          <span>·</span>
          <span>{detail?.targetValue ?? '目标待补充'}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4"><h1 className="max-w-4xl text-3xl font-semibold leading-tight">{project.title}</h1><div className="flex flex-wrap items-start justify-end gap-3">{canEdit ? <PublishedEdit contentId={project.id} /> : null}<ContentLifecycle canArchive={canArchive} canUnpublish={canUnpublish} contentId={project.id} /></div></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">{project.summary ?? '暂无项目摘要'}</p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
          <span>阶段：{stage}</span>
          <span>验证：{verificationLabels[project.verificationStatus] ?? project.verificationStatus}</span>
          <span>团队：{project.team.name}</span>
          <span>负责人：{project.owner.name}</span>
        </div>
      </header>

      <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          <section>
            <p className="text-xs tracking-[0.16em] text-neutral-500">PROJECT FOCUS</p>
            <h2 className="mt-2 text-lg font-medium">要解决的问题</h2>
            <p className="mt-3 text-sm leading-7 text-neutral-300">{detail?.problemStatement ?? project.summary ?? '暂无问题说明'}</p>
          </section>
          <section className="border-t border-[var(--border)] pt-7">
            <p className="text-xs tracking-[0.16em] text-neutral-500">NEXT VALIDATION</p>
            <h2 className="mt-2 text-lg font-medium">下一步验证</h2>
            <p className="mt-3 text-sm leading-7 text-neutral-300">{body.nextStep ?? '尚未补充下一步验证计划。'}</p>
          </section>
          <section className="border-t border-[var(--border)] pt-7">
            <p className="text-xs tracking-[0.16em] text-neutral-500">PROJECT CONTEXT</p>
            <h2 className="mt-2 text-lg font-medium">项目管理信息</h2>
            <dl className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              <DetailRow label="项目阶段" value={stage} />
              <DetailRow label="目标价值" value={detail?.targetValue} />
              <DetailRow label="建议团队" value={detail?.suggestedOwnerTeam?.name ?? project.team.name} />
              <DetailRow label="内容版本" value={project.currentVersion?.versionLabel ?? `v${project.currentVersion?.versionNumber ?? 1}`} />
            </dl>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs tracking-[0.14em] text-neutral-500">PRIORITIZATION</p>
            <h2 className="mt-2 text-base font-medium">优先级依据</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-3"><span className="text-neutral-500">排序</span><span>{priority?.rank ? `#${priority.rank}` : '待评估'}</span></div>
              <div className="flex items-baseline justify-between gap-3"><span className="text-neutral-500">影响</span><span>{priority?.impact ?? '待评估'}</span></div>
              <div className="flex items-baseline justify-between gap-3"><span className="text-neutral-500">投入</span><span>{priority?.effort ?? '待评估'}</span></div>
              <div className="flex items-baseline justify-between gap-3"><span className="text-neutral-500">就绪度</span><span>{priority?.readiness ?? '待评估'}</span></div>
            </div>
            <p className="mt-4 border-t border-[var(--border)] pt-4 text-sm leading-6 text-neutral-400">{priority?.reason ?? '该项目尚未进入排序评估。'}</p>
          </section>
          <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-xs tracking-[0.14em] text-neutral-500">SOURCE TRACEABILITY</p>
            <h2 className="mt-2 text-base font-medium">来源与追溯</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-400">该项目已从批准的 v9-1 项目库迁入正式内容目录，当前仍标记为待验证。</p>
            {body.source?.legacyProjectUrl ? (
              <a className="mt-4 inline-flex text-sm text-neutral-300 underline underline-offset-4 hover:text-white" href={body.source.legacyProjectUrl} rel="noreferrer" target="_blank">
                查看 v9-1 原项目页 ↗
              </a>
            ) : null}
          </section>
        </aside>
      </div>
    </main>
  );
}
