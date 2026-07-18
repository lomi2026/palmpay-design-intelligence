'use client';

import { Check, Copy, Heart, Link2, NotebookPen } from 'lucide-react';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { favoriteAction, recordContentShareAction } from '@/app/workspace/engagement-actions';

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
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white"
      >
        <Link href={`/workspace/usage?contentId=${contentId}`}>
          <NotebookPen />
          确认使用
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white"
      >
        <Link href={`/workspace/related?contentId=${contentId}`}>
          <Link2 />
          关联内容
        </Link>
      </Button>
      <ContentShareButton contentId={contentId} />
    </div>
  );
}

function ContentShareButton({ contentId }: { contentId: string }) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  async function copyCanonicalLink() {
    const link = `${window.location.origin}${pathname}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.createElement('textarea');
      input.value = link;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      const copiedWithFallback = document.execCommand('copy');
      input.remove();
      if (!copiedWithFallback) return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
    try {
      await recordContentShareAction(contentId, pathname);
    } catch {
      // Sharing remains useful even if analytics is temporarily unavailable.
    }
  }

  return <Button aria-label={copied ? '链接已复制' : '复制链接'} className="h-9 rounded-[10px] border-white/[.14] bg-black/[.16] px-3 text-[12px] text-white/85 hover:bg-white/[.08] hover:text-white" onClick={copyCanonicalLink} type="button" variant="outline">{copied ? <Check /> : <Copy />}{copied ? '已复制' : '复制链接'}</Button>;
}
