import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell, ChevronDown, LogOut } from 'lucide-react';

import { logout } from '@/app/login/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { optionalServerApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { WorkspaceSearchShortcut } from '@/components/workspace/workspace-search-shortcut';
import { V9ThemeToggle } from '@/components/marketing/v9-theme-toggle';
import {
  WorkspaceBreadcrumb,
  WorkspaceMobileNavigation,
  WorkspaceSidebarNavigation,
} from '@/components/workspace/workspace-navigation';

const roleLabels: Record<string, string> = {
  admin: '平台管理员',
  reviewer: '内容审核人',
  manager: '设计管理者',
  member: '设计成员',
};

function primaryRoleLabel(roleCodes: string[]) {
  const primary = ['admin', 'reviewer', 'manager', 'member'].find((code) => roleCodes.includes(code));
  return primary ? roleLabels[primary] : '已认证成员';
}

export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await loadCurrentUser();
  if (!user) redirect('/login');
  const reviewer = user.permissions.includes('review.process');
  const canAnalyze = user.permissions.includes('analytics.read');
  const canCreate = user.permissions.includes('content.create');
  const canSubmit = user.permissions.includes('content.submit');
  const canManage = user.permissions.includes('user.manage') || user.permissions.includes('taxonomy.manage') || user.permissions.includes('content.edit_all') || user.permissions.includes('audit.read');
  const roleLabel = primaryRoleLabel(user.roles.map((role) => role.code));
  const headers = await authenticatedApiHeaders();
  const [notifications, projects] = await Promise.all([
    optionalServerApiFetch<{ unreadCount: number }>('/api/notifications', { headers }, { unreadCount: 0 }),
    optionalServerApiFetch<{ total: number }>('/api/contents?type=AI_PROJECT&pageSize=1', { headers }, { total: 0 }),
  ]);
  const navigationProps = {
    canAnalyze,
    canCreate,
    canManage,
    canReview: reviewer,
    canSubmit,
    projectCount: projects.total,
  };

  return (
    <div className="v9-source-home min-h-screen bg-[var(--v9-bg)] text-[var(--v9-text)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[224px] border-r border-[var(--v9-line)] bg-[var(--v9-sidebar)] md:flex md:flex-col">
        <Link href="/" className="flex h-16 items-center gap-3 border-b border-white/[.11] px-5"><Image src="/v9-1/assets/nav-logo-20260710.png" alt="PalmPay Design" width={31} height={31} className="size-[31px] object-contain" /><span className="text-[13px] font-bold leading-4">PalmPay Design<br /><span className="text-[10px] font-medium tracking-[.15em] text-white/55">INTELLIGENCE HUB</span></span></Link>
        <div className="flex-1 overflow-y-auto p-2.5">
          <Button asChild variant="outline" className="mb-7 h-10 w-full justify-start rounded-[10px] border-white/[.15] bg-transparent px-3 text-[13px] text-white hover:bg-white/[.06] hover:text-white"><Link href="/"><span className="mr-1">←</span> 返回平台首页</Link></Button>
          <WorkspaceSidebarNavigation {...navigationProps} />
        </div>
        <div className="m-3 rounded-xl bg-white/[.055] p-3"><div className="flex items-center justify-between"><strong className="text-[11px]">Beta 1.0</strong><Badge variant="outline" className="border-white/[.1] text-[9px] text-white/65">Internal</Badge></div><p className="mt-2 text-[11px] leading-4 text-white/45">内容与数据为内部试运行口径，更新于 2026.07。</p></div>
      </aside>
      <div className="md:pl-[224px]">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-[var(--v9-line)] bg-[color-mix(in_srgb,var(--v9-bg)_95%,transparent)] px-4 backdrop-blur-xl md:px-8"><WorkspaceMobileNavigation {...navigationProps} /><WorkspaceBreadcrumb /><WorkspaceSearchShortcut /><div className="ml-auto flex items-center gap-2"><V9ThemeToggle /><Link href="/workspace/notifications" aria-label="通知中心" className="relative grid size-9 place-items-center rounded-[10px] border border-[var(--v9-line)] text-[var(--v9-muted)] hover:bg-[var(--v9-soft-hover)] hover:text-[var(--v9-text)]"><Bell className="size-4" />{notifications.unreadCount ? <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-[var(--v9-strong)] px-1 py-0.5 text-[9px] font-bold leading-none text-[var(--v9-strong-foreground)]">{notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}</span> : null}</Link><details className="group relative"><summary className="flex list-none cursor-pointer items-center gap-2 rounded-[10px] p-1.5 hover:bg-[var(--v9-soft-hover)]"><span className="grid size-8 place-items-center rounded-full bg-[var(--v9-raised)] text-[11px] font-bold">{user.name.slice(0, 2).toUpperCase()}</span><span className="hidden text-left leading-4 lg:block"><strong className="block text-[12px]">{user.name}</strong><em className="block text-[11px] not-italic text-[var(--v9-muted)]">{roleLabel}</em></span><ChevronDown className="size-3 text-[var(--v9-muted)]" /></summary><form action={logout} className="absolute right-0 top-11 w-28 rounded-lg border border-[var(--v9-line)] bg-[var(--v9-panel-2)] p-1"><Button type="submit" variant="ghost" className="w-full justify-start text-[var(--v9-text)] hover:bg-[var(--v9-soft-hover)] hover:text-[var(--v9-text)]"><LogOut className="size-4" />退出</Button></form></details></div></header>
        {children}
      </div>
    </div>
  );
}
