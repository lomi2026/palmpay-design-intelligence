import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { verificationLabels } from '@/lib/ai-catalog';
import type { ContentCard, ContentListResponse } from '@/lib/content-types';
import { CatalogPageHeader } from '@/components/workspace/catalog-page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type SkillCard = ContentCard & { skillDetail?: { applicableRoles: string[] } | null };
type SkillListResponse = Omit<ContentListResponse, 'items'> & { items: SkillCard[] };

export default async function AISkillsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search = '' } = await searchParams;
  const query = new URLSearchParams({ type: 'AI_SKILL', pageSize: '100' });
  if (search.trim()) query.set('search', search.trim());
  const skills = await serverApiFetch<SkillListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() });

  return (
    <main className="px-5 py-8 md:px-8 md:py-10">
      <CatalogPageHeader eyebrow="AI CAPABILITIES" title="AI Skill" description="面向体验设计工作流的可复用 AI 方法。使用前需遵循输入边界并进行人工复核。" search={search} searchId="skill-search" searchPlaceholder="搜索名称或用途" count={`${skills.total} 个已发布 Skill`} />
      {skills.items.length ? (
        <section className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {skills.items.map((skill) => (
            <Card key={skill.id} className="min-h-60 border border-white/10 bg-white/[0.035] py-5 shadow-none transition hover:border-white/25 hover:bg-white/[0.055]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3 text-xs text-white/45"><Badge variant="outline" className="border-white/10 text-white/55">{skill.category?.name ?? '未分类'}</Badge><span>{verificationLabels[skill.verificationStatus] ?? skill.verificationStatus}</span></div>
                <CardTitle className="mt-3 text-lg leading-7 text-white"><Link className="hover:text-violet-200 hover:underline hover:underline-offset-4" href={`/workspace/ai-skills/${skill.slug}`}>{skill.title}</Link></CardTitle>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">{skill.summary ?? '暂无说明'}</p>
              </CardHeader>
              <CardContent><div className="flex flex-wrap gap-1.5">{(skill.skillDetail?.applicableRoles ?? []).map((role) => <Badge variant="outline" className="border-white/10 text-white/45" key={role}>{role}</Badge>)}</div></CardContent>
              <CardFooter className="mt-auto justify-between border-white/10 bg-transparent px-5 pt-5 text-xs text-white/40"><span>{skill.owner.name}</span><Link className="inline-flex items-center gap-1 hover:text-white" href={`/workspace/ai-skills/${skill.slug}`}>查看 <ArrowRight className="size-3" /></Link></CardFooter>
            </Card>
          ))}
        </section>
      ) : <section className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center text-sm text-white/45">没有找到可访问的 AI Skill。</section>}
    </main>
  );
}
