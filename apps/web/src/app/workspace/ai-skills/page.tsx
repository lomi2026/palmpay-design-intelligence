import Link from 'next/link';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import { verificationLabels } from '@/lib/ai-catalog';
import type { ContentCard, ContentListResponse } from '@/lib/content-types';

type SkillCard = ContentCard & { skillDetail?: { applicableRoles: string[] } | null };
type SkillListResponse = Omit<ContentListResponse, 'items'> & { items: SkillCard[] };

export default async function AISkillsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search = '' } = await searchParams;
  const query = new URLSearchParams({ type: 'AI_SKILL', pageSize: '100' });
  if (search.trim()) query.set('search', search.trim());
  const skills = await serverApiFetch<SkillListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() });

  return (
    <main className="px-6 py-7 md:px-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 border-b border-[var(--border)] pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs tracking-[0.18em] text-neutral-500">AI CAPABILITIES</p>
          <h1 className="mt-2 text-2xl font-semibold">AI Skill</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400">面向体验设计工作流的可复用 AI 方法。使用前需遵循输入边界并进行人工复核。</p>
        </div>
        <form className="flex w-full max-w-md gap-2" method="get">
          <label className="sr-only" htmlFor="skill-search">搜索 AI Skill</label>
          <input className="h-9 min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-neutral-500" defaultValue={search} id="skill-search" name="search" placeholder="搜索名称或用途" type="search" />
          <button className="h-9 rounded-md border border-neutral-600 px-3 text-sm hover:bg-neutral-900" type="submit">搜索</button>
        </form>
      </header>

      <div className="mt-5 text-sm text-neutral-500">{skills.total} 个已发布 Skill{search ? ` · 搜索：${search}` : ''}</div>
      {skills.items.length ? (
        <section className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {skills.items.map((skill) => (
            <article className="flex min-h-60 flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-neutral-600" key={skill.id}>
              <div className="flex items-center justify-between gap-3 text-xs text-neutral-500"><span>{skill.category?.name ?? '未分类'}</span><span>{verificationLabels[skill.verificationStatus] ?? skill.verificationStatus}</span></div>
              <h2 className="mt-4 text-lg font-medium leading-7"><Link className="hover:underline hover:underline-offset-4" href={`/workspace/ai-skills/${skill.slug}`}>{skill.title}</Link></h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">{skill.summary ?? '暂无说明'}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{(skill.skillDetail?.applicableRoles ?? []).map((role) => <span className="rounded border border-[var(--border)] px-2 py-0.5 text-xs text-neutral-400" key={role}>{role}</span>)}</div>
              <div className="mt-auto flex items-center justify-between pt-5 text-xs text-neutral-500"><span>{skill.owner.name}</span><span>人工复核</span></div>
            </article>
          ))}
        </section>
      ) : <section className="mt-5 rounded-lg border border-dashed border-[var(--border)] px-6 py-16 text-center text-sm text-neutral-500">没有找到可访问的 AI Skill。</section>}
    </main>
  );
}
