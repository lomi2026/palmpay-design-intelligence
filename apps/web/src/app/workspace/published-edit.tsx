'use client';

import { useActionState } from 'react';
import { createPublishedEditDraftAction, type ActionState } from './submit/actions';
import { Button } from '@/components/ui/button';

const initialState: ActionState = {};

export function PublishedEdit({ contentId, label = '编辑内容' }: { contentId: string; label?: string }) {
  const [state, action, pending] = useActionState(createPublishedEditDraftAction, initialState);

  return (
    <form action={action} className="flex flex-col items-start gap-1.5">
      <input name="id" type="hidden" value={contentId} />
      <Button
        title="创建或继续编辑草稿，重新发布前保持当前内容状态"
        variant="outline"
        className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white"
        disabled={pending}
        type="submit"
      >
        {pending ? '创建草稿中…' : label}
      </Button>
      {state.error ? <p className="max-w-64 text-right text-xs text-red-400">{state.error}</p> : null}
    </form>
  );
}
