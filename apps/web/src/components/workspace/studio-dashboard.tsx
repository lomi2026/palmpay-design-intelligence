import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Layers3,
  Wrench,
  Sparkles,
  Lightbulb,
  BriefcaseBusiness,
  Plus,
  Clock3,
} from 'lucide-react';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { contentTypeLabel, type ContentListResponse } from '@/lib/content-types';
const routes: Record<string, string> = {
  DESIGN_ASSET: 'design-assets',
  AI_TOOL: 'ai-tools',
  AI_SKILL: 'ai-skills',
  AI_PROJECT: 'ai-projects',
  AI_CASE: 'ai-cases',
};
const entrances = [
  [Layers3, '设计资产', 'design-assets', '规范、模板与方法'],
  [Wrench, 'AI 工具', 'ai-tools', '找到顺手的工具'],
  [Sparkles, 'AI Skill', 'ai-skills', '复用成熟的工作流'],
  [Lightbulb, 'AI 项目库', 'ai-projects', '发现下一次探索'],
  [BriefcaseBusiness, 'AI 案例', 'ai-cases', '借鉴真实实践'],
] as const;
export async function StudioDashboard() {
  const headers = await authenticatedApiHeaders();
  const user = await loadCurrentUser();
  const canCreate = user?.permissions.includes('content.create');
  const [catalog, drafts] = await Promise.all([
    serverApiFetch<ContentListResponse>('/api/contents?pageSize=6', { headers }),
    canCreate
      ? serverApiFetch<{
          items: Array<{ id: string; title: string; status: string; draftVersion?: unknown }>;
        }>('/api/content-drafts', { headers })
      : Promise.resolve({ items: [] }),
  ]);
  const pending = drafts.items.filter((item) => item.status === 'DRAFT' || item.draftVersion);
  return (
    <main className="studio-dashboard">
      <div className="studio-greeting">
        <div>
          <p className="eyebrow">PALMPAY · DESIGN WORKSPACE</p>
          <h1>好设计，从这里继续。</h1>
          <p>找到团队的方法，也留下你的下一次灵感。</p>
        </div>
        {canCreate ? (
          <Link className="studio-primary" href="/workspace/submit">
            <Plus size={17} />
            发布内容
          </Link>
        ) : null}
      </div>
      <section className="studio-feature">
        <div>
          <span className="studio-dot-label">你的设计工作空间</span>
          <h2>
            把一次经验，
            <br />
            变成团队的共同能力。
          </h2>
          <Link href="/workspace/design-assets">
            探索设计资产 <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="studio-feature-stats">
          <div>
            <span>可用内容</span>
            <strong>{catalog.total}</strong>
            <p>按你的权限可见</p>
          </div>
          <div>
            <span>继续完善</span>
            <strong>{pending.length}</strong>
            <p>你的未完成草稿</p>
          </div>
        </div>
      </section>
      <section className="studio-entry-grid">
        {entrances.map(([Icon, title, path, description]) => (
          <Link href={`/workspace/${path}`} key={path}>
            <div>
              <Icon size={20} />
              <ArrowUpRight size={14} />
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
          </Link>
        ))}
      </section>
      <div className="studio-work-grid">
        <section className="studio-panel">
          <header>
            <div>
              <p className="eyebrow">发现与复用</p>
              <h2>团队最近更新</h2>
            </div>
            <Link href="/workspace/search" aria-label="浏览全部内容">
              <ArrowUpRight size={20} />
            </Link>
          </header>
          <div className="studio-update-list">
            {catalog.items.map((item) => (
              <Link href={`/workspace/${routes[item.contentType]}/${item.slug}`} key={item.id}>
                <span className="studio-type-icon">
                  {item.contentType === 'AI_SKILL' ? (
                    <Sparkles size={18} />
                  ) : item.contentType === 'AI_TOOL' ? (
                    <Wrench size={18} />
                  ) : (
                    <Layers3 size={18} />
                  )}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {contentTypeLabel(item.contentType)} · {item.owner.name}
                  </p>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </section>
        <section className="studio-panel studio-drafts">
          <header>
            <div>
              <p className="eyebrow">继续创作</p>
              <h2>把想法补完整</h2>
            </div>
            <Clock3 size={20} />
          </header>
          {pending.length ? (
            pending.slice(0, 4).map((item) => (
              <Link
                className="studio-draft-item"
                href={`/workspace/submit/${item.id}`}
                key={item.id}
              >
                <div>
                  <h3>{item.title}</h3>
                  <p>继续编辑草稿</p>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))
          ) : (
            <div className="studio-empty">
              <Sparkles size={28} />
              <h3>留下一份值得复用的经验</h3>
              <p>从一个工具、一套方法或一次实践开始。</p>
              {canCreate ? (
                <Link href="/workspace/submit">
                  创建第一份内容 <ArrowRight size={15} />
                </Link>
              ) : null}
            </div>
          )}
          <Link className="studio-all" href="/workspace/contributions">
            查看我的贡献 <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>
    </main>
  );
}
