'use client';
import { startTransition, useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { invalidateWorkspaceCache } from './cache-events';
import { useNavigationCache } from './navigation-cache';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { deleteContentAction, type DeleteContentState } from '@/app/workspace/delete-content-action';
export function DeleteContentButton({ contentId, title, redirectTo, disabled, className, onOpen, neutral = false }: { contentId: string; title: string; redirectTo?: string; disabled?: boolean; className?: string; onOpen?: () => void; neutral?: boolean }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<DeleteContentState, FormData>(deleteContentAction, {});
  const router = useRouter();
  const cache = useNavigationCache();
  const begin = cache?.begin;
  useEffect(() => { if (state.deleted) {
    invalidateWorkspaceCache();
    window.dispatchEvent(new CustomEvent('workspace-content-removed', { detail: contentId }));
    if (redirectTo) { begin?.(redirectTo); router.replace(redirectTo); } else startTransition(() => router.refresh());
  } }, [state.deleted, router, redirectTo, begin, contentId]);
  if (state.deleted) return null;
  return <Dialog open={open} onOpenChange={(value) => { if (!pending) { if (value) onOpen?.(); setOpen(value); } }}>
    <DialogTrigger asChild><Button type="button" disabled={disabled} size="sm" variant={neutral ? "outline" : "ghost"} className={`${neutral ? "border-white/15 bg-transparent text-white hover:bg-white/[0.07] hover:text-white" : "text-[var(--v9-status-danger-text)]"} ${className ?? ''}`}><Trash2 className="size-4" />删除</Button></DialogTrigger>
    <DialogContent><DialogTitle>删除内容</DialogTitle><DialogDescription>确定删除「{title}」？删除后将从目录、搜索、收藏及内容列表中移除，同时清除内容关联和相关使用统计。此操作无法撤销。</DialogDescription>
      <form data-managed-cache="" action={action} onSubmit={(event) => event.stopPropagation()}><input type="hidden" name="inline" value="true" /><input type="hidden" name="contentId" value={contentId} />{redirectTo ? <input type="hidden" name="returnTo" value={redirectTo} /> : null}{state.error ? <p role="alert" className="mb-4 text-sm text-destructive">{state.error}</p> : null}<DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>取消</Button><Button type="submit" variant="destructive" disabled={pending}>{pending ? '删除中…' : '确认删除'}</Button></DialogFooter></form>
    </DialogContent>
  </Dialog>;
}
