'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FilePenLine,
  Heart,
  Layers3,
  LayoutDashboard,
  Lightbulb,
  Menu,
  Send,
  Settings,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type NavigationCapabilities = {
  canAnalyze: boolean;
  canCreate: boolean;
  canManage: boolean;
  canReview: boolean;
  canSubmit: boolean;
};

type NavigationProps = NavigationCapabilities & {
  projectCount: number;
};

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string | number;
};

function navigationGroups({
  canAnalyze,
  canCreate,
  canManage,
  canReview,
  canSubmit,
  projectCount,
}: NavigationProps): Array<{ label: string; items: NavigationItem[] }> {
  return [
    {
      label: '个人空间',
      items: [
        { href: '/workspace', label: '工作台', icon: LayoutDashboard },
        { href: '/workspace/favorites', label: '我的收藏', icon: Heart },
        { href: '/workspace/recent', label: '最近浏览', icon: Clock3 },
        { href: '/workspace/notifications', label: '通知中心', icon: Bell },
        ...(canCreate ? [{ href: '/workspace/contributions', label: '我的贡献', icon: FilePenLine }] : []),
      ],
    },
    {
      label: '知识与能力',
      items: [
        { href: '/workspace/design-assets', label: '设计资产', icon: Layers3 },
        { href: '/workspace/ai-skills', label: 'AI Skill', icon: Sparkles },
        { href: '/workspace/ai-projects', label: 'AI 项目库', icon: Lightbulb, badge: projectCount },
        { href: '/workspace/ai-cases', label: 'AI 案例', icon: BriefcaseBusiness },
      ],
    },
    {
      label: '共建与治理',
      items: [
        ...(canCreate ? [{ href: '/workspace/submit', label: '提交内容', icon: Send }] : []),
        ...(canSubmit ? [{ href: '/workspace/submissions', label: '我的提交', icon: FileCheck2 }] : []),
        ...(canReview ? [{ href: '/workspace/reviews', label: '审核中心', icon: ClipboardCheck }] : []),
      ],
    },
    {
      label: '价值与数据',
      items: canAnalyze
        ? [
            { href: '/workspace/overview', label: '价值总览', icon: BarChart3 },
            { href: '/workspace/insights', label: '数据洞察', icon: ChartNoAxesCombined },
          ]
        : [],
    },
    {
      label: '平台管理',
      items: canManage ? [{ href: '/workspace/admin', label: '管理中心', icon: Settings }] : [],
    },
  ].filter((group) => group.items.length > 0);
}

function isActive(pathname: string, href: string) {
  return href === '/workspace' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function NavigationLinks({ closeOnNavigate = false, ...props }: NavigationProps & { closeOnNavigate?: boolean }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      {navigationGroups(props).map((group) => (
        <section key={group.label}>
          <p className="mb-2 px-2 text-[11px] text-white/45">{group.label}</p>
          <nav className="space-y-1" aria-label={group.label}>
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              const link = (
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-10 items-center gap-3 rounded-[10px] px-3 text-[13px] transition',
                    active
                      ? 'bg-white/[.1] font-semibold text-white'
                      : 'text-white/70 hover:bg-white/[.06] hover:text-white',
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                  {item.badge !== undefined ? (
                    <Badge variant="outline" className="ml-auto border-white/[.12] px-1.5 text-[10px] text-white/60">
                      {item.badge}
                    </Badge>
                  ) : null}
                </Link>
              );
              return closeOnNavigate ? <SheetClose asChild key={item.href}>{link}</SheetClose> : <div key={item.href}>{link}</div>;
            })}
          </nav>
        </section>
      ))}
    </div>
  );
}

export function WorkspaceSidebarNavigation(props: NavigationProps) {
  return <NavigationLinks {...props} />;
}

export function WorkspaceMobileNavigation(props: NavigationProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-sm" className="mr-2 size-9 border-white/[.12] bg-transparent text-white hover:bg-white/[.06] hover:text-white md:hidden" aria-label="打开工作台菜单">
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="gap-0 p-0">
        <SheetHeader className="border-b border-white/[.1] pr-14">
          <SheetTitle>PalmPay Design Hub</SheetTitle>
          <SheetDescription>工作台导航</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-3">
          <NavigationLinks {...props} closeOnNavigate />
        </div>
      </SheetContent>
    </Sheet>
  );
}

const routeLabels: Array<[string, string]> = [
  ['/workspace/design-assets', '设计资产'],
  ['/workspace/ai-skills', 'AI Skill'],
  ['/workspace/ai-projects', 'AI 项目库'],
  ['/workspace/ai-cases', 'AI 案例'],
  ['/workspace/favorites', '我的收藏'],
  ['/workspace/recent', '最近浏览'],
  ['/workspace/notifications', '通知中心'],
  ['/workspace/contributions', '我的贡献'],
  ['/workspace/submissions', '我的提交'],
  ['/workspace/submit', '提交内容'],
  ['/workspace/reviews', '审核中心'],
  ['/workspace/overview', '价值总览'],
  ['/workspace/insights', '数据洞察'],
  ['/workspace/admin', '管理中心'],
  ['/workspace/search', '全局搜索'],
];

export function WorkspaceBreadcrumb() {
  const pathname = usePathname();
  const label = pathname === '/workspace'
    ? '工作台'
    : routeLabels.find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1] ?? '工作台';
  return (
    <div className="hidden items-center gap-2 text-[13px] text-white/55 md:flex">
      <span>PalmPay UX</span>
      <span>›</span>
      <strong className="font-semibold text-white">{label}</strong>
    </div>
  );
}
