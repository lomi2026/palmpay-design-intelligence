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

  return <form action={action} className="flex flex-col items-end gap-2"><input name="id" type="hidden" value={contentId} />
    <div className="flex flex-wrap justify-end gap-2">
      {canUnpublish ? <Button variant="outline" className="border-amber-400/40 bg-transparent text-amber-200 hover:bg-amber-400/10 hover:text-amber-100" disabled={pending} name="operation" type="submit" value="unpublish">{pending ? '处理中…' : '下架内容'}</Button> : null}
      {canArchive ? <Button variant="destructive" disabled={pending} name="operation" type="submit" value="archive">{pending ? '处理中…' : '归档内容'}</Button> : null}
    </div>
    <span className="text-right text-xs text-white/40">下架或归档后，内容将不再出现在公开目录中</span>
    {state.error ? <p className="max-w-64 text-right text-xs text-red-400">{state.error}</p> : null}
  </form>;
}
