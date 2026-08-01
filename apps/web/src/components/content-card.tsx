import Link from 'next/link';
import type { ContentCard as ContentCardData } from '@/lib/content-types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkspaceStatusBadge } from '@/components/workspace/workspace-status-badge';

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
    <Card className="group min-h-56 border border-[var(--v9-line)] bg-[var(--v9-panel)] py-5 shadow-none transition hover:-translate-y-0.5 hover:border-[var(--v9-line-strong)] hover:bg-[var(--v9-panel-2)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 text-[11px] text-[var(--v9-subtle)]">
          <Badge variant="outline" className="border-[var(--v9-line)] bg-[var(--v9-soft)] text-[var(--v9-copy)]">
            {content.category?.name ?? '未分类'}
          </Badge>
          <WorkspaceStatusBadge status={content.verificationStatus} />
        </div>
        <CardTitle className="mt-4 text-[19px] font-medium leading-7 text-[var(--v9-text)]">
          <Link
            className="transition group-hover:text-[var(--v9-muted)]"
            href={`/workspace/${contentRoute}/${content.slug}`}
            prefetch={false}
          >
            {content.title}
          </Link>
        </CardTitle>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--v9-copy)]">
          {content.summary ?? '暂无摘要'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {content.tags.map(({ tag }) => (
            <Badge variant="outline" className="border-[var(--v9-line)] bg-[var(--v9-soft)] text-[var(--v9-subtle)]" key={tag.id}>
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between border-[var(--v9-line)] bg-transparent px-5 pt-5 text-xs text-[var(--v9-subtle)]">
        <span>负责人 · {content.owner.name}</span>
        <span>{content.team.name}</span>
      </CardFooter>
    </Card>
  );
}
