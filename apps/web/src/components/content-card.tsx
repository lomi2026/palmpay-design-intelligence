import Link from 'next/link';
import type { ContentCard as ContentCardData } from '@/lib/content-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const verificationLabels: Record<string, string> = {
  UNVERIFIED: '未验证',
  INTERNAL_TRIAL: '内部试用',
  PILOT: '试点中',
  VERIFIED: '已验证',
  INVALIDATED: '已失效',
};

export function ContentCard({ content }: { content: ContentCardData }) {
  const contentRoute =
    content.contentType === 'DESIGN_ASSET'
      ? 'design-assets'
      : content.contentType === 'AI_SKILL'
        ? 'ai-skills'
        : content.contentType === 'AI_CASE'
          ? 'ai-cases'
          : 'ai-projects';
  return (
    <Card className="group min-h-56 border border-white/[.1] bg-[#111112] py-5 shadow-none transition hover:-translate-y-0.5 hover:border-white/[.22] hover:bg-white/[.035]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 text-[11px] text-neutral-500">
          <Badge variant="outline" className="border-white/[.12] bg-white/[.035] text-white/55">
            {content.category?.name ?? '未分类'}
          </Badge>
          <span>
            {verificationLabels[content.verificationStatus] ?? content.verificationStatus}
          </span>
        </div>
        <CardTitle className="mt-4 text-[19px] font-medium leading-7 text-white">
          <Link
            className="transition group-hover:text-white/70"
            href={`/workspace/${contentRoute}/${content.slug}`}
          >
            {content.title}
          </Link>
        </CardTitle>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">
          {content.summary ?? '暂无摘要'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {content.tags.map(({ tag }) => (
            <Badge variant="outline" className="border-white/[.1] bg-black/[.18] text-white/45" key={tag.id}>
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between border-white/[.1] bg-transparent px-5 pt-5 text-xs text-white/40">
        <span>负责人 · {content.owner.name}</span>
        <span>{content.team.name}</span>
      </CardFooter>
    </Card>
  );
}
