'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function WorkspaceSearchShortcut() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    router.push(`/workspace/search${trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : ''}`);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="mx-auto hidden h-9 w-[450px] justify-start rounded-[10px] border-[var(--v9-line)] bg-[var(--v9-field)] px-4 text-[12px] font-normal text-[var(--v9-subtle)] hover:bg-[var(--v9-soft-hover)] hover:text-[var(--v9-text)] lg:flex"
        >
          <Search className="mr-2 size-4" />搜索资产、Skill、案例或项目
          <kbd className="ml-auto rounded border border-[var(--v9-line)] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[680px] gap-0 overflow-hidden rounded-[18px] border border-border bg-popover p-0 text-popover-foreground shadow-2xl shadow-black/60" showCloseButton>
        <DialogHeader className="border-b border-border px-5 py-4 pr-14">
          <DialogTitle className="text-[16px] font-semibold">全局搜索</DialogTitle>
          <DialogDescription className="text-[12px] text-muted-foreground">在当前账号可访问的正式资产、Skill、案例和项目中搜索。</DialogDescription>
        </DialogHeader>
        <form className="p-5" onSubmit={submit}>
          <label className="sr-only" htmlFor="workspace-global-search">搜索资产、Skill、案例或项目</label>
          <div className="flex gap-2">
            <Input
              autoFocus
              className="h-11 border-border bg-background text-foreground placeholder:text-muted-foreground"
              id="workspace-global-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="输入标题、关键词或问题…"
              value={query}
            />
            <Button className="h-11 px-4" type="submit"><Search className="size-4" />搜索</Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">按 Enter 查看结果；搜索范围会始终遵循组织隔离与角色权限。</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
