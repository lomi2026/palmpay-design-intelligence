'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contentLifecycleAction, type ActionState } from './submit/actions';
import { Button } from '@/components/ui/button';

const initialState: ActionState = {};

export function ContentLifecycle({ contentId, canArchive, canUnpublish }: { contentId: string; canArchive: boolean; canUnpublish: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(contentLifecycleAction, initialState);
  useEffect(() => { if (state.savedAt) router.push('/workspace'); }, [router, state.savedAt]);
  if (!canArchive && !canUnpublish) return null;

  return <form action={action} className="flex flex-col items-start gap-1.5"><input name="id" type="hidden" value={contentId} />
    <div className="flex flex-wrap justify-start gap-3">
      {canUnpublish ? <Button variant="outline" className="h-9 rounded-[10px] border-[var(--v9-status-warning-line)] bg-[var(--v9-status-warning-bg)] px-3 text-[12px] text-[var(--v9-status-warning-text)] hover:bg-[var(--v9-status-warning-bg)] hover:text-[var(--v9-status-warning-text)]" disabled={pending} name="operation" type="submit" value="unpublish" title="下架后将不再显示在目录中">{pending ? '处理中…' : '下架内容'}</Button> : null}
      {canArchive ? <Button variant="destructive" className="h-9 rounded-[10px] px-3 text-[12px]" disabled={pending} name="operation" type="submit" value="archive" title="归档后将不再显示在目录中">{pending ? '处理中…' : '归档内容'}</Button> : null}
    </div>
    {state.error ? <p className="max-w-64 text-right text-[11px] text-[var(--v9-status-danger-text)]">{state.error}</p> : null}
  </form>;
}
