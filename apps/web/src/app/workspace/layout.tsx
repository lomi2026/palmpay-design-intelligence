import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell, BriefcaseBusiness, ChartNoAxesCombined, ChevronDown, ClipboardCheck, Heart, Layers3, LayoutDashboard, Lightbulb, LogOut, Send, Sparkles, Sun, UsersRound, Clock3, Settings } from 'lucide-react';

import { logout } from '@/app/login/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { WorkspaceSearchShortcut } from '@/components/workspace/workspace-search-shortcut';

const knowledgeNavigation = [
  { href: '/workspace/design-assets', label: '设计资产', icon: Layers3, showProjectCount: false },
  { href: '/workspace/ai-skills', label: 'AI Skill', icon: Sparkles, showProjectCount: false },
  { href: '/workspace/ai-projects', label: 'AI 项目库', icon: Lightbulb, showProjectCount: true },
  { href: '/workspace/ai-cases', label: 'AI 案例', icon: BriefcaseBusiness, showProjectCount: false },
];

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
  const canManage = user.permissions.includes('user.manage') || user.permissions.includes('taxonomy.manage') || user.permissions.includes('content.edit_all');
  const roleLabel = primaryRoleLabel(user.roles.map((role) => role.code));
  const headers = await authenticatedApiHeaders();
  const [notifications, projects] = await Promise.all([
    serverApiFetch<{ unreadCount: number }>('/api/notifications', { headers }),
    serverApiFetch<{ total: number }>('/api/contents?type=AI_PROJECT&pageSize=1', { headers }),
  ]);

  return (
    <div className="v9-source-home min-h-screen bg-[#090909] text-[#f4f4f5]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[224px] border-r border-white/[.11] bg-[#0a0a0a] md:flex md:flex-col">
        <Link href="/" className="flex h-16 items-center gap-3 border-b border-white/[.11] px-5"><Image src="/v9-1/assets/nav-logo-20260710.png" alt="PalmPay Design" width={31} height={31} className="size-[31px] object-contain" /><span className="text-[13px] font-bold leading-4">PalmPay Design<br /><span className="text-[10px] font-medium tracking-[.15em] text-white/55">INTELLIGENCE HUB</span></span></Link>
        <div className="flex-1 overflow-y-auto p-2.5">
          <Button asChild variant="outline" className="mb-7 h-10 w-full justify-start rounded-[10px] border-white/[.15] bg-transparent px-3 text-[13px] text-white hover:bg-white/[.06] hover:text-white"><Link href="/"><span className="mr-1">←</span> 返回平台首页</Link></Button>
          <p className="mb-2 px-2 text-[11px] text-white/45">个人空间</p>
          <nav className="space-y-1"><Link href="/workspace" className="flex h-10 items-center gap-3 rounded-[10px] bg-white/[.1] px-3 text-[13px] font-semibold"><LayoutDashboard className="size-4" />工作台</Link><Link href="/workspace/favorites" className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] text-white/75 hover:bg-white/[.06] hover:text-white"><Heart className="size-4" />我的收藏</Link><Link href="/workspace/recent" className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] text-white/75 hover:bg-white/[.06] hover:text-white"><Clock3 className="size-4" />最近浏览</Link>{canAnalyze ? <Link href="/workspace/overview" className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] text-white/75 hover:bg-white/[.06] hover:text-white"><ChartNoAxesCombined className="size-4" />价值总览</Link> : null}</nav>
          <p className="mb-2 mt-6 px-2 text-[11px] text-white/45">知识与能力</p>
          <nav className="space-y-1">{knowledgeNavigation.map((item) => <Link href={item.href} className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] text-white/75 hover:bg-white/[.06] hover:text-white" key={item.href}><item.icon className="size-4" />{item.label}{item.showProjectCount ? <Badge variant="outline" className="ml-auto border-white/[.12] px-1.5 text-[10px] text-white/60">{projects.total}</Badge> : null}</Link>)}</nav>
          <p className="mb-2 mt-6 px-2 text-[11px] text-white/45">共建与运营</p>
          <nav className="space-y-1"><Link href="/workspace/submit" className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] text-white/75 hover:bg-white/[.06] hover:text-white"><Send className="size-4" />提交内容</Link>{canAnalyze ? <Link href="/workspace/insights" className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] text-white/75 hover:bg-white/[.06] hover:text-white"><ChartNoAxesCombined className="size-4" />数据洞察</Link> : null}{reviewer ? <Link href="/workspace/reviews" className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] text-white/75 hover:bg-white/[.06] hover:text-white"><ClipboardCheck className="size-4" />审核中心</Link> : null}{canManage ? <Link href="/workspace/admin" className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] text-white/75 hover:bg-white/[.06] hover:text-white"><Settings className="size-4" />管理中心</Link> : null}</nav>
        </div>
        <div className="m-3 rounded-xl bg-white/[.055] p-3"><div className="flex items-center justify-between"><strong className="text-[11px]">Beta 1.0</strong><Badge variant="outline" className="border-white/[.1] text-[9px] text-white/65">Internal</Badge></div><p className="mt-2 text-[11px] leading-4 text-white/45">内容与数据为内部试运行口径，更新于 2026.07。</p></div>
      </aside>
      <div className="md:pl-[224px]">
        <header className="sticky top-0 z-20 flex h-16 items-center border-b border-white/[.11] bg-[#090909]/95 px-5 backdrop-blur-xl md:px-8"><div className="hidden items-center gap-3 text-[13px] text-white/55 md:flex"><UsersRound className="size-4" /> PalmPay UX <span>›</span> <strong className="font-semibold text-white">工作台</strong></div><WorkspaceSearchShortcut /><div className="ml-auto flex items-center gap-2"><Button variant="outline" size="icon-sm" aria-label="切换主题" className="size-9 rounded-[10px] border-white/[.12] bg-transparent text-white hover:bg-white/[.06] hover:text-white"><Sun className="size-4" /></Button><Link href="/workspace/notifications" className="relative grid size-9 place-items-center rounded-[10px] border border-white/[.12] text-white/75 hover:bg-white/[.06]"><Bell className="size-4" />{notifications.unreadCount ? <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-white px-1 py-0.5 text-[9px] font-bold leading-none text-black">{notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}</span> : null}</Link><details className="group relative"><summary className="flex list-none cursor-pointer items-center gap-2 rounded-[10px] p-1.5 hover:bg-white/[.06]"><span className="grid size-8 place-items-center rounded-full bg-white/[.12] text-[11px] font-bold">{user.name.slice(0, 2).toUpperCase()}</span><span className="hidden text-left leading-4 lg:block"><strong className="block text-[12px]">{user.name}</strong><em className="block text-[11px] not-italic text-white/50">{roleLabel}</em></span><ChevronDown className="size-3 text-white/55" /></summary><form action={logout} className="absolute right-0 top-11 w-28 rounded-lg border border-white/[.12] bg-[#161616] p-1"><Button type="submit" variant="ghost" className="w-full justify-start text-white hover:bg-white/[.08] hover:text-white"><LogOut className="size-4" />退出</Button></form></details></div></header>
        <div className="md:hidden"><nav className="flex gap-2 overflow-x-auto border-b border-white/[.11] px-4 py-2 text-[12px]"><Link href="/workspace" className="rounded-lg bg-white/[.1] px-3 py-2">工作台</Link>{knowledgeNavigation.map((item) => <Link href={item.href} key={item.href} className="whitespace-nowrap px-3 py-2 text-white/65">{item.label}</Link>)}</nav></div>
        {children}
      </div>
    </div>
  );
}
