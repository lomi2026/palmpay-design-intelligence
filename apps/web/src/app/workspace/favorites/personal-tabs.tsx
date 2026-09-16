'use client';
import { confirmWorkspaceNavigation } from '@/components/workspace/use-unsaved-changes';

import { useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Clock3, Heart } from 'lucide-react';

import { useNavigationCache, WorkspaceResults } from '@/components/workspace/navigation-cache';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PersonalTabs({ activeTab, children }: {
  activeTab: 'favorites' | 'recent';
  children: ReactNode;
}) {
  const router = useRouter();
  const cache = useNavigationCache();
  const [isPending, startTransition] = useTransition();

  const visibleTab = cache?.pending?.startsWith('/workspace/favorites') ? (new URL(cache.pending, 'http://workspace').searchParams.get('tab') === 'recent' ? 'recent' : 'favorites') : activeTab;
  return (
    <Tabs
      className="mt-6"
      value={visibleTab}
      onValueChange={(value) => {
        if (!confirmWorkspaceNavigation()) return;
        const href = value === 'recent' ? '/workspace/favorites?tab=recent' : '/workspace/favorites';
        if (!navigator.onLine) { cache?.fail(() => { cache.begin(href); router.push(href); }); return; }
        cache?.begin(href);
        startTransition(() => router.push(href, { scroll: false }));
      }}
    >
      <TabsList aria-label="收藏与浏览" className="mb-3">
        <TabsTrigger className="px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-input/30" value="favorites"><Heart />我的收藏</TabsTrigger>
        <TabsTrigger className="px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:data-[state=active]:bg-input/30" value="recent"><Clock3 />最近浏览</TabsTrigger>
      </TabsList>
      <span aria-live="polite" className="sr-only">{isPending ? '正在切换内容' : ''}</span>
      <TabsContent aria-busy={isPending} className="" value={visibleTab}>
        <WorkspaceResults>{children}</WorkspaceResults>
      </TabsContent>
    </Tabs>
  );
}
