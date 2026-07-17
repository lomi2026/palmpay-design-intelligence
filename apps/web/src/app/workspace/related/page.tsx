import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import type { ContentListResponse } from '@/lib/content-types';
import { createRelationAction, removeRelationAction } from '../engagement-actions';

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
  const [relations, catalog] = contentId
    ? await Promise.all([
        serverApiFetch<Relations>(`/api/contents/${contentId}/relations`, { headers }),
        serverApiFetch<ContentListResponse>('/api/contents?pageSize=100', { headers }),
      ])
    : [null, { items: [], page: 1, pageSize: 100, total: 0 } satisfies ContentListResponse];
  return (
    <main className="mx-auto max-w-3xl px-6 py-8 md:px-10">
      <Link href="/workspace" className="text-sm text-white/50 hover:text-white">
        ← 返回工作台
      </Link>
      <p className="mt-8 text-xs tracking-[.18em] text-white/45">CONTENT GRAPH</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">关联内容</h1>
      <p className="mt-3 text-sm text-white/55">建立资产、Skill、案例与项目之间的可追溯关联。</p>
      {success ? <p className="mt-5 text-sm text-emerald-200">内容关联已保存。</p> : null}
      {error ? <p className="mt-5 text-sm text-red-200">请选择关联目标。</p> : null}
      {contentId ? (
        <>
          <form
            action={createRelationAction}
            className="mt-6 grid gap-3 rounded-xl border border-white/12 bg-white/[.035] p-5 md:grid-cols-[1fr_180px_auto]"
          >
            <input type="hidden" name="contentId" value={contentId} />
            <select
              name="targetContentId"
              required
              defaultValue=""
              className="h-9 min-w-0 rounded-lg border border-white/15 bg-white/[.04] px-3 text-sm text-white"
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
            </select>
            <select
              name="relationType"
              defaultValue="RELATED"
              className="h-9 rounded-lg border border-white/15 bg-white/[.04] px-3 text-sm text-white"
            >
              <option value="RELATED">相关内容</option>
              <option value="USES">使用</option>
              <option value="EVIDENCE_FOR">证据支持</option>
              <option value="DERIVED_FROM">衍生自</option>
            </select>
            <Button type="submit">添加关联</Button>
          </form>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <section>
              <h2 className="text-sm font-medium">此内容关联到</h2>
              <ul className="mt-3 space-y-2">
                {relations?.outgoing.map((relation) => (
                  <li
                    className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3 text-sm"
                    key={relation.id}
                  >
                    <Link
                      className="hover:underline"
                      href={`/workspace/${moduleFor(relation.targetContent.contentType)}/${relation.targetContent.slug}`}
                    >
                      {relation.targetContent.title}
                      <span className="ml-2 text-xs text-white/40">{relation.relationType}</span>
                    </Link>
                    <form action={removeRelationAction}>
                      <input type="hidden" name="contentId" value={contentId} />
                      <input type="hidden" name="relationId" value={relation.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        移除
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-sm font-medium">被以下内容关联</h2>
              <ul className="mt-3 space-y-2">
                {relations?.incoming.map((relation) => (
                  <li className="rounded-lg border border-white/10 p-3 text-sm" key={relation.id}>
                    <Link
                      className="hover:underline"
                      href={`/workspace/${moduleFor(relation.sourceContent.contentType)}/${relation.sourceContent.slug}`}
                    >
                      {relation.sourceContent.title}
                    </Link>
                    <span className="ml-2 text-xs text-white/40">{relation.relationType}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      ) : (
        <p className="mt-8 rounded-lg border border-dashed border-white/15 p-5 text-sm text-white/50">
          请从内容详情页进入关联管理。
        </p>
      )}
    </main>
  );
}
