import Link from 'next/link';
import type { ContentCard as ContentCardData } from '@/lib/content-types';

const verificationLabels: Record<string, string> = {
  UNVERIFIED: '未验证',
  INTERNAL_TRIAL: '内部试用',
  PILOT: '试点中',
  VERIFIED: '已验证',
  INVALIDATED: '已失效',
};

export function ContentCard({ content }: { content: ContentCardData }) {
  return (
    <article className="flex min-h-52 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:border-neutral-600">
      <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
        <span>{content.category?.name ?? '未分类'}</span>
        <span>{verificationLabels[content.verificationStatus] ?? content.verificationStatus}</span>
      </div>
      <h2 className="mt-4 text-lg font-medium leading-7">
        <Link
          className="hover:underline hover:underline-offset-4"
          href={`/workspace/design-assets/${content.slug}`}
        >
          {content.title}
        </Link>
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
        {content.summary ?? '暂无摘要'}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {content.tags.map(({ tag }) => (
          <span
            className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs text-neutral-400"
            key={tag.id}
          >
            {tag.name}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between pt-5 text-xs text-neutral-500">
        <span>{content.owner.name}</span>
        <span>{content.team.name}</span>
      </div>
    </article>
  );
}
