import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import {
  assignRoleAction,
  createCategoryAction,
  createTagAction,
  removeUserRoleAction,
  updateCategoryStatusAction,
  updateTagStatusAction,
  updateUserStatusAction,
} from './actions';

type AdminContent = {
  items: Array<{
    id: string;
    title: string;
    slug: string;
    contentType: string;
    status: string;
    updatedAt: string;
    owner: { name: string };
  }>;
  total: number;
};
type Category = { id: string; name: string; code: string; status: string; contentTypes: string[] };
type Tag = { id: string; name: string; status: string; usageCount: number };
type User = {
  id: string;
  name: string;
  email: string;
  status: string;
  userRoles: Array<{ id: string; role: { name: string; code: string } }>;
};
type Role = { id: string; name: string; code: string };
type Audit = {
  items: Array<{
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
    actor: { name: string; email: string } | null;
  }>;
};
const modules: Record<string, string> = {
  DESIGN_ASSET: 'design-assets',
  AI_SKILL: 'ai-skills',
  AI_CASE: 'ai-cases',
  AI_PROJECT: 'ai-projects',
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'content' } = await searchParams;
  const user = await loadCurrentUser();
  if (
    !user ||
    !(
      user.permissions.includes('user.manage') ||
      user.permissions.includes('taxonomy.manage') ||
      user.permissions.includes('content.edit_all') ||
      user.permissions.includes('audit.read')
    )
  )
    redirect('/unauthorized');
  const headers = await authenticatedApiHeaders();
  const organizationPath = `/api/organizations/${user.organizationId}`;
  const [contents, categories, tags, users, roles, audit] = await Promise.all([
    user.permissions.includes('content.edit_all')
      ? serverApiFetch<AdminContent>('/api/admin/contents?pageSize=100', { headers })
      : Promise.resolve({ items: [], total: 0 }),
    user.permissions.includes('taxonomy.manage')
      ? serverApiFetch<Category[]>('/api/admin/categories', { headers })
      : Promise.resolve([]),
    user.permissions.includes('taxonomy.manage')
      ? serverApiFetch<Tag[]>('/api/admin/tags', { headers })
      : Promise.resolve([]),
    user.permissions.includes('user.manage')
      ? serverApiFetch<{ items: User[] }>(`${organizationPath}/users?pageSize=100`, { headers })
      : Promise.resolve({ items: [] }),
    user.permissions.includes('user.manage')
      ? serverApiFetch<Role[]>(`${organizationPath}/roles`, { headers })
      : Promise.resolve([]),
    user.permissions.includes('audit.read')
      ? serverApiFetch<Audit>('/api/admin/audit-logs?pageSize=100', { headers })
      : Promise.resolve({ items: [] }),
  ]);
  const nav = [
    ['content', '内容管理'],
    ['taxonomy', '分类与标签'],
    ['users', '用户与角色'],
    ['audit', '审计日志'],
  ];
  return (
    <main className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <p className="text-xs tracking-[.18em] text-white/45">PLATFORM ADMINISTRATION</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em]">管理中心</h1>
      <nav className="mt-6 flex flex-wrap gap-2">
        {nav.map(([key, label]) => (
          <Link key={key} href={`/workspace/admin?tab=${key}`}>
            <Button
              variant={tab === key ? 'default' : 'outline'}
              size="sm"
              className={
                tab === key
                  ? ''
                  : 'border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white'
              }
            >
              {label}
            </Button>
          </Link>
        ))}
      </nav>
      {tab === 'content' ? (
        <section className="mt-7 rounded-xl border border-white/10 bg-white/[.035] p-5">
          <div className="flex justify-between">
            <h2 className="text-base font-medium">正式内容</h2>
            <span className="text-sm text-white/45">{contents.total} 项</span>
          </div>
          <div className="mt-4 divide-y divide-white/10">
            {contents.items.map((item) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                key={item.id}
              >
                <div>
                  <Link
                    className="hover:underline"
                    href={`/workspace/${modules[item.contentType]}/${item.slug}`}
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-xs text-white/45">
                    {item.contentType} · {item.owner.name}
                  </p>
                </div>
                <span className="rounded border border-white/12 px-2 py-1 text-xs text-white/60">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {tab === 'taxonomy' ? (
        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[.035] p-5">
            <h2 className="text-base font-medium">分类</h2>
            <form action={createCategoryAction} className="mt-4 grid gap-2">
              <Input
                name="name"
                placeholder="分类名称"
                required
                className="border-white/15 bg-white/[.04] text-white"
              />
              <Input
                name="code"
                placeholder="唯一代码，例如 research-method"
                required
                className="border-white/15 bg-white/[.04] text-white"
              />
              <select
                name="contentType"
                defaultValue="DESIGN_ASSET"
                className="h-9 rounded-lg border border-white/15 bg-white/[.04] px-3 text-sm text-white"
              >
                <option value="DESIGN_ASSET">设计资产</option>
                <option value="AI_SKILL">AI Skill</option>
                <option value="AI_CASE">AI 案例</option>
                <option value="AI_PROJECT">AI 项目</option>
              </select>
              <Button type="submit">新增分类</Button>
            </form>
            <ul className="mt-5 divide-y divide-white/10">
              {categories.map((item) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  key={item.id}
                >
                  <span>
                    {item.name}
                    <em className="ml-2 not-italic text-xs text-white/40">{item.code}</em>
                  </span>
                  <form action={updateCategoryStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="categoryId" value={item.id} />
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="h-7 rounded border border-white/15 bg-white/[.04] px-2 text-xs text-white"
                    >
                      <option value="ACTIVE">启用</option>
                      <option value="DISABLED">停用</option>
                    </select>
                    <Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      保存
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[.035] p-5">
            <h2 className="text-base font-medium">标签</h2>
            <form action={createTagAction} className="mt-4 flex gap-2">
              <Input
                name="name"
                placeholder="新增标签"
                required
                className="border-white/15 bg-white/[.04] text-white"
              />
              <Button type="submit">新增</Button>
            </form>
            <ul className="mt-5 divide-y divide-white/10">
              {tags.map((item) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
                  key={item.id}
                >
                  <span>{item.name}</span>
                  <form action={updateTagStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="tagId" value={item.id} />
                    <span className="text-xs text-white/50">使用 {item.usageCount}</span>
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="h-7 rounded border border-white/15 bg-white/[.04] px-2 text-xs text-white"
                    >
                      <option value="ACTIVE">启用</option>
                      <option value="DISABLED">停用</option>
                      <option value="MERGED">已合并</option>
                    </select>
                    <Button type="submit" size="sm" variant="ghost" className="h-7 px-2 text-xs">
                      保存
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
      {tab === 'users' ? (
        <section className="mt-7 rounded-xl border border-white/10 bg-white/[.035] p-5">
          <h2 className="text-base font-medium">用户与角色</h2>
          <div className="mt-4 divide-y divide-white/10">
            {users.items.map((member) => (
              <div
                className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_180px_220px]"
                key={member.id}
              >
                <div>
                  <p className="text-sm">{member.name}</p>
                  <p className="text-xs text-white/45">{member.email}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {member.userRoles.length ? (
                      member.userRoles.map((entry) => (
                        <form action={removeUserRoleAction} key={entry.id}>
                          <input type="hidden" name="organizationId" value={user.organizationId} />
                          <input type="hidden" name="userId" value={member.id} />
                          <input type="hidden" name="userRoleId" value={entry.id} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="h-6 border-white/15 bg-transparent px-2 text-xs text-white/70 hover:bg-white/10 hover:text-white"
                          >
                            {entry.role.name} ×
                          </Button>
                        </form>
                      ))
                    ) : (
                      <span className="text-xs text-white/45">无角色</span>
                    )}
                  </div>
                </div>
                <form action={updateUserStatusAction} className="flex gap-2">
                  <input type="hidden" name="organizationId" value={user.organizationId} />
                  <input type="hidden" name="userId" value={member.id} />
                  <select
                    name="status"
                    defaultValue={member.status}
                    className="h-8 rounded-lg border border-white/15 bg-white/[.04] px-2 text-sm text-white"
                  >
                    <option value="ACTIVE">启用</option>
                    <option value="INVITED">邀请中</option>
                    <option value="DISABLED">停用</option>
                  </select>
                  <Button type="submit" size="sm">
                    更新
                  </Button>
                </form>
                <form action={assignRoleAction} className="flex gap-2">
                  <input type="hidden" name="organizationId" value={user.organizationId} />
                  <input type="hidden" name="userId" value={member.id} />
                  <select
                    name="roleId"
                    defaultValue=""
                    className="h-8 min-w-0 rounded-lg border border-white/15 bg-white/[.04] px-2 text-sm text-white"
                  >
                    {' '}
                    <option value="" disabled>
                      添加角色
                    </option>
                    {roles.map((role) => (
                      <option value={role.id} key={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    className="border-white/15 bg-transparent text-white"
                  >
                    授予
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {tab === 'audit' ? (
        <section className="mt-7 rounded-xl border border-white/10 bg-white/[.035] p-5">
          <h2 className="text-base font-medium">审计日志</h2>
          <div className="mt-4 divide-y divide-white/10">
            {audit.items.map((item) => (
              <div className="flex flex-wrap justify-between gap-3 py-3 text-sm" key={item.id}>
                <span>
                  {item.action}
                  <em className="ml-2 not-italic text-xs text-white/40">{item.entityType}</em>
                </span>
                <span className="text-white/45">
                  {item.actor?.name ?? '系统'} ·{' '}
                  {new Intl.DateTimeFormat('zh-CN').format(new Date(item.createdAt))}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
