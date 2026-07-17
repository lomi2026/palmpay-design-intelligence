'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WorkspaceSearchShortcut() {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        router.push('/workspace/search');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  return (
    <Button
      asChild
      variant="outline"
      className="mx-auto hidden h-9 w-[450px] justify-start rounded-[10px] border-white/[.12] bg-white/[.035] px-4 text-[12px] font-normal text-white/45 hover:bg-white/[.06] hover:text-white lg:flex"
    >
      <Link href="/workspace/search">
        <Search className="mr-2 size-4" />搜索资产、Skill、案例或项目
        <kbd className="ml-auto rounded border border-white/[.12] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </Link>
    </Button>
  );
}
