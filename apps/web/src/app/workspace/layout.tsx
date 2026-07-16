import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { loadCurrentUser } from '@/lib/auth';

export default async function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');

  const navigation = [
    { href: '/workspace', label: '工作台' },
    { href: '/workspace/design-assets', label: '设计资产' },
    { href: '/workspace/ai-projects', label: 'AI 项目库' },
    { href: '/workspace/ai-skills', label: 'AI Skill' },
    { href: '/workspace/ai-cases', label: 'AI 案例' },
    { href: '/workspace/submit', label: '提交内容' },
  ];

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6 md:px-10">
        <Link className="font-medium" href="/workspace">
          PalmPay体验设计Hub
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-right">
            <p className="text-neutral-200">{user.name}</p>
            <p className="text-xs text-neutral-500">
              {user.roles.map((role) => role.code).join(' · ') || 'member'}
            </p>
          </div>
          <form action={logout}>
            <button
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-neutral-300"
              type="submit"
            >
              退出
            </button>
          </form>
        </div>
      </header>
      <div className="border-b border-[var(--border)] px-6 md:hidden">
        <nav className="flex h-11 items-center gap-5 overflow-x-auto text-sm text-neutral-400">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="md:grid md:grid-cols-[176px_minmax(0,1fr)]">
        <aside className="hidden min-h-[calc(100vh-4rem)] border-r border-[var(--border)] px-4 py-6 md:block">
          <nav className="space-y-1 text-sm">
            {navigation.map((item) => (
              <Link
                className="block rounded-md px-3 py-2 text-neutral-400 hover:bg-[var(--surface)] hover:text-white"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
