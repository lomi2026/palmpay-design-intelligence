import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import type { ContentCard, ContentListResponse } from '@/lib/content-types';
import { CatalogPageHeader } from '@/components/workspace/catalog-page-header';
import { CatalogFilterControls } from '@/components/workspace/catalog-filter-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspaceEmptyState } from '@/components/workspace/workspace-empty-state';
import { WorkspaceStatusBadge } from '@/components/workspace/workspace-status-badge';

type SkillCard = ContentCard & { skillDetail?: { applicableRoles: string[] } | null };
type SkillListResponse = Omit<ContentListResponse, 'items'> & { items: SkillCard[] };

export default async function AISkillsPage({ searchParams }: { searchParams: Promise<{ search?: string; categoryId?: string; tag?: string; verificationStatus?: string }> }) {
  const { search = '', categoryId, tag, verificationStatus } = await searchParams;
  const filters = { search: search.trim() || undefined, categoryId, tag, verificationStatus };
  const query = new URLSearchParams({ type: 'AI_SKILL', pageSize: '100' });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  const baseQuery = new URLSearchParams({ type: 'AI_SKILL', pageSize: '100' });
  const [skills, filterSource, currentUser] = await Promise.all([
    serverApiFetch<SkillListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() }),
    serverApiFetch<SkillListResponse>(`/api/contents?${baseQuery}`, { headers: await authenticatedApiHeaders() }),
    loadCurrentUser(),
  ]);
  const canCreate = currentUser?.permissions.includes('content.create');

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
      <CatalogPageHeader eyebrow="AI CAPABILITIES" title="AI Skill" description="面向体验设计工作流的可复用 AI 方法。使用前需遵循输入边界并进行人工复核。" search={search} searchId="skill-search" searchPlaceholder="搜索名称或用途" count={`${skills.total} 个已发布 Skill`} filterParams={{ categoryId, tag, verificationStatus }} />
      <CatalogFilterControls contents={filterSource.items} filters={filters} pathname="/workspace/ai-skills" searchPlaceholder="搜索名称或用途" />
      {canCreate ? <div className="mt-3 flex justify-end"><Button asChild className="h-9 rounded-lg bg-white px-3.5 text-sm text-black hover:bg-white/90"><Link href="/workspace/submit?type=AI_SKILL"><Plus className="size-4" />新增 Skill</Link></Button></div> : null}
      {skills.items.length ? (
        <section className="mt-5 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {skills.items.map((skill) => (
            <Link
              aria-label={`打开 ${skill.title}`}
              className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-[var(--v9-soft-hover)]"
              href={`/workspace/ai-skills/${skill.slug}`}
              key={skill.id}
            >
              <Card className="group h-full min-h-60 border border-[var(--v9-line)] bg-[var(--v9-panel)] py-5 shadow-none transition hover:-translate-y-0.5 hover:border-[var(--v9-line-strong)] hover:bg-[var(--v9-panel-2)]">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--v9-subtle)]"><Badge variant="outline" className="border-[var(--v9-line)] bg-[var(--v9-soft)] text-[var(--v9-copy)]">{skill.category?.name ?? '未分类'}</Badge><WorkspaceStatusBadge status={skill.verificationStatus} /></div>
                  <CardTitle className="mt-4 text-[19px] leading-7 text-[var(--v9-text)] transition group-hover:text-[var(--v9-muted)]">{skill.title}</CardTitle>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--v9-copy)]">{skill.summary ?? '暂无说明'}</p>
                </CardHeader>
                <CardContent><div className="flex min-h-5 flex-wrap gap-1.5">{(skill.skillDetail?.applicableRoles ?? []).map((role) => <Badge variant="outline" className="border-[var(--v9-line)] bg-[var(--v9-soft)] text-[var(--v9-subtle)]" key={role}>{role}</Badge>)}</div></CardContent>
                <CardFooter className="mt-auto justify-between border-[var(--v9-line)] bg-transparent px-5 pt-5 text-xs text-[var(--v9-subtle)]"><span>负责人 · {skill.owner.name}</span><span className="inline-flex items-center gap-1 text-[var(--v9-copy)] transition group-hover:text-[var(--v9-text)]">打开方法 <ArrowRight className="size-3" /></span></CardFooter>
              </Card>
            </Link>
          ))}
        </section>
      ) : <WorkspaceEmptyState className="mt-5 py-16 text-center">没有找到可访问的 AI Skill。</WorkspaceEmptyState>}
    </main>
  );
}
