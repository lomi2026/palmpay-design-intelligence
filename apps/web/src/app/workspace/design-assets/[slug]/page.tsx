import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { PublishedEdit } from '../../published-edit';
import { ContentLifecycle } from '../../content-lifecycle';
import type { DesignAssetDetail } from '@/lib/content-types';

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
  const canEdit = currentUser?.id === content.owner.id || currentUser?.permissions.includes('content.edit_all');
  const canUnpublish = currentUser?.permissions.includes('content.unpublish') ?? false;
  const canArchive = currentUser?.permissions.includes('content.archive') ?? false;

  return (
    <main className="mx-auto max-w-6xl px-6 py-7 md:px-10">
      <Link
        className="text-sm text-neutral-500 hover:text-neutral-300"
        href="/workspace/design-assets"
      >
        ← 返回设计资产
      </Link>

      <header className="mt-6 border-b border-[var(--border)] pb-7">
        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
          <span>{content.category?.name ?? '未分类'}</span>
          <span>·</span>
          <span>{content.assetDetail?.assetType ?? '设计资产'}</span>
          <span>·</span>
          <span>
            {content.currentVersion?.versionLabel ??
              `版本 ${content.currentVersion?.versionNumber ?? '-'}`}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4"><h1 className="max-w-4xl text-3xl font-semibold leading-tight">{content.title}</h1><div className="flex flex-wrap items-start justify-end gap-3">{canEdit ? <PublishedEdit contentId={content.id} /> : null}<ContentLifecycle canArchive={canArchive} canUnpublish={canUnpublish} contentId={content.id} /></div></div>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
          {content.summary ?? '暂无摘要'}
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
          <span>负责人：{content.owner.name}</span>
          <span>团队：{content.team.name}</span>
          <span>
            更新时间：{new Intl.DateTimeFormat('zh-CN').format(new Date(content.updatedAt))}
          </span>
        </div>
      </header>

      <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-base font-medium">解决什么问题</h2>
            <p className="text-sm leading-7 text-neutral-300">
              {content.assetDetail?.problemStatement ?? '暂无问题说明'}
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-base font-medium">如何使用</h2>
            <StructuredValue value={content.assetDetail?.usageGuide} />
          </section>
          <section>
            <h2 className="mb-3 text-base font-medium">正文</h2>
            <StructuredValue value={content.currentVersion?.body} />
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="text-sm font-medium">适用场景</h2>
            <div className="mt-3">
              <TextList items={content.assetDetail?.scenarios ?? []} empty="暂未填写适用场景" />
            </div>
          </section>
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="text-sm font-medium">不适用场景</h2>
            <div className="mt-3">
              <TextList
                items={content.assetDetail?.unsuitableScenarios ?? []}
                empty="暂未填写限制条件"
              />
            </div>
          </section>
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <h2 className="text-sm font-medium">附件</h2>
            <p className="mt-3 text-sm text-neutral-500">
              {content.attachments.length ? `${content.attachments.length} 个附件` : '暂无附件'}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
