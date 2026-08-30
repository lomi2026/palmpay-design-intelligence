'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPublishedEditDraftAction, type ActionState } from './submit/actions';
import { Button } from '@/components/ui/button';

const initialState: ActionState = {};

export function PublishedEdit({ contentId }: { contentId: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createPublishedEditDraftAction, initialState);

  useEffect(() => {
    if (state.id) router.push(`/workspace/submit/${state.id}`);
  }, [router, state.id]);

  return (
    <form action={action} className="flex max-w-[190px] flex-col items-end gap-1.5">
      <input name="id" type="hidden" value={contentId} />
      <Button
        variant="outline"
        className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white"
        disabled={pending}
        type="submit"
      >
        {pending ? '创建草稿中…' : '编辑内容'}
      </Button>
      <span className="text-right text-[10px] leading-4 text-white/40">将创建新草稿版本，不改写已发布内容</span>
      {state.error ? <p className="max-w-64 text-right text-xs text-red-400">{state.error}</p> : null}
    </form>
  );
}
