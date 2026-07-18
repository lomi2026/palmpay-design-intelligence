'use client';

import { Heart, Link2, NotebookPen } from 'lucide-react';
import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { favoriteAction } from '@/app/workspace/engagement-actions';

export function FavoriteControl({
  contentId,
  returnTo,
  active = false,
}: {
  contentId: string;
  returnTo: string;
  active?: boolean;
}) {
  const [, action, pending] = useActionState(
    async (_state: void | undefined, formData: FormData) => {
      await favoriteAction(formData);
    },
    undefined,
  );
  return (
    <form action={action} className="shrink-0">
      <input type="hidden" name="contentId" value={contentId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="active" value={String(active)} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white"
      >
        <Heart className={active ? 'fill-current' : ''} />
        {active ? '取消收藏' : '收藏'}
      </Button>
    </form>
  );
}

export function ContentEngagementLinks({ contentId }: { contentId: string }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="内容协作操作">
      <Link href={`/workspace/usage?contentId=${contentId}`}>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white"
        >
          <NotebookPen />
          确认使用
        </Button>
      </Link>
      <Link href={`/workspace/related?contentId=${contentId}`}>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white"
        >
          <Link2 />
          关联内容
        </Button>
      </Link>
    </div>
  );
}
