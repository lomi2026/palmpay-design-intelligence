import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import type { ContentListResponse } from '@/lib/content-types';
import { createRelationAction, removeRelationAction } from '../engagement-actions';
import { WorkspacePageHero } from '@/components/workspace/workspace-page-hero';

type Relations = {
  outgoing: Array<{
    id: string;
    relationType: string;
    targetContent: { id: string; title: string; slug: string; contentType: string };
  }>;
  incoming: Array<{
    id: string;
    relationType: string;
    sourceContent: { id: string; title: string; slug: string; contentType: string };
  }>;
};
const moduleFor = (type: string) =>
  type === 'DESIGN_ASSET'
    ? 'design-assets'
    : type === 'AI_SKILL'
      ? 'ai-skills'
      : type === 'AI_CASE'
        ? 'ai-cases'
        : 'ai-projects';

export default async function RelatedContentPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; success?: string; error?: string }>;
}) {
  const { contentId = '', success, error } = await searchParams;
  const headers = await authenticatedApiHeaders();
  const user = await loadCurrentUser();
  const [relations, catalog] = contentId
    ? await Promise.all([
        serverApiFetch<Relations>(`/api/contents/${contentId}/relations`, { headers }),
        serverApiFetch<ContentListResponse>('/api/contents?pageSize=100', { headers }),
      ])
    : [null, { items: [], page: 1, pageSize: 100, total: 0 } satisfies ContentListResponse];
  const source = catalog.items.find((item) => item.id === contentId);
  const canEdit = Boolean(
    user &&
      (user.permissions.includes('content.edit_all') ||
        (user.permissions.includes('content.edit_own') && source?.owner.id === user.id)),
  );
  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 md:px-8 md:py-10">
      <Link href="/workspace" className="text-sm text-[var(--v9-muted)] transition hover:text-[var(--v9-text)]">
        ← 返回工作台
      </Link>
      <div className="mt-5"><WorkspacePageHero description="建立资产、Skill、案例与项目之间可追溯的关联；关联只会作用于当前正式内容。" eyebrow="CONTENT GRAPH" metric={contentId ? { value: (relations?.outgoing.length ?? 0) + (relations?.incoming.length ?? 0), label: '已有连接' } : undefined} title="让经验之间形成可以解释的网络。" /></div>
      {success ? <p className="mt-4 rounded-xl border border-[var(--v9-status-success-line)] bg-[var(--v9-status-success-bg)] p-3 text-sm text-[var(--v9-status-success-text)]">内容关联已保存。</p> : null}
      {error ? <p className="mt-4 rounded-xl border border-[var(--v9-status-danger-line)] bg-[var(--v9-status-danger-bg)] p-3 text-sm text-[var(--v9-status-danger-text)]">请选择关联目标。</p> : null}
      {contentId ? (
        <>
          {canEdit ? <form
            action={createRelationAction}
            className="mt-5 grid gap-3 rounded-2xl border border-[var(--v9-line)] bg-[var(--v9-panel)] p-5 md:grid-cols-[1fr_180px_auto]"
          >
            <input type="hidden" name="contentId" value={contentId} />
            <NativeSelect
              name="targetContentId"
              required
              defaultValue=""
              className="h-9 min-w-0 rounded-lg border border-[var(--v9-line-strong)] bg-[var(--v9-field)] px-3 text-sm text-[var(--v9-text)]"
            >
              <option value="" disabled>
                选择可访问内容
              </option>
              {catalog.items
                .filter((item) => item.id !== contentId)
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.title}
                  </option>
                ))}
            </NativeSelect>
            <NativeSelect
              name="relationType"
              defaultValue="RELATED"
              className="h-9 rounded-lg border border-[var(--v9-line-strong)] bg-[var(--v9-field)] px-3 text-sm text-[var(--v9-text)]"
            >
              <option value="RELATED">相关内容</option>
              <option value="USES">使用</option>
              <option value="EVIDENCE_FOR">证据支持</option>
              <option value="DERIVED_FROM">衍生自</option>
            </NativeSelect>
            <Button type="submit">添加关联</Button>
          </form> : null}
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <section className="rounded-2xl border border-[var(--v9-line)] bg-[var(--v9-panel)] p-5">
              <h2 className="text-sm font-medium text-[var(--v9-text)]">此内容关联到</h2>
              <ul className="mt-3 space-y-2">
                {relations?.outgoing.map((relation) => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-xl border border-[var(--v9-line)] bg-[var(--v9-panel-2)] p-3 text-sm"
                    key={relation.id}
                  >
                    <Link
                      className="hover:underline"
                      href={`/workspace/${moduleFor(relation.targetContent.contentType)}/${relation.targetContent.slug}`}
                    >
                      {relation.targetContent.title}
                      <span className="ml-2 text-xs text-[var(--v9-subtle)]">{relation.relationType}</span>
                    </Link>
                    {canEdit ? <form action={removeRelationAction}>
                      <input type="hidden" name="contentId" value={contentId} />
                      <input type="hidden" name="relationId" value={relation.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        移除
                      </Button>
                    </form> : null}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-[var(--v9-line)] bg-[var(--v9-panel)] p-5">
              <h2 className="text-sm font-medium text-[var(--v9-text)]">被以下内容关联</h2>
              <ul className="mt-3 space-y-2">
                {relations?.incoming.map((relation) => (
                  <li className="rounded-xl border border-[var(--v9-line)] bg-[var(--v9-panel-2)] p-3 text-sm" key={relation.id}>
                    <Link
                      className="hover:underline"
                      href={`/workspace/${moduleFor(relation.sourceContent.contentType)}/${relation.sourceContent.slug}`}
                    >
                      {relation.sourceContent.title}
                    </Link>
                    <span className="ml-2 text-xs text-[var(--v9-subtle)]">{relation.relationType}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed border-[var(--v9-line-strong)] bg-[var(--v9-panel)] p-8 text-sm text-[var(--v9-muted)]">
          请从内容详情页进入关联管理。
        </p>
      )}
    </main>
  );
}
