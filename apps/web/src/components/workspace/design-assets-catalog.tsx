'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { AssetImage } from './asset-image';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ContentCard } from '@/lib/content-types';
import { cn } from '@/lib/utils';
import { FavoriteControl } from './engagement-controls';
import { WorkspaceEmptyState } from './workspace-empty-state';

type LegacyAssetBody = {
  legacy?: {
    owner?: string;
    date?: string;
    version?: string;
    statusLabel?: string;
    cover?: string;
  };
};

type DesignAssetCard = ContentCard & {
  currentVersion?: { versionLabel: string | null; body: unknown } | null;
};

const platforms = ['全部平台', 'Web', 'Mobile', '全平台'] as const;

function getLegacyBody(value: unknown): LegacyAssetBody {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as LegacyAssetBody;
}

function formatUpdated(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai',
  }).format(date).replace('/', '-');
}

export function DesignAssetsCatalog({
  contents,
  platform,
  view,
}: {
  contents: DesignAssetCard[];
  platform: (typeof platforms)[number];
  view: 'grid' | 'list';
}) {
  const filtered = useMemo(() => {
    return contents.filter((content) => {
      const matchesPlatform = platform === '全部平台' || content.assetDetail?.platforms.includes(platform);
      return matchesPlatform;
    });
  }, [contents, platform]);

  return (
    <section>


      {filtered.length ? (
        <section className={cn('mt-4 gap-4', view === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3' : 'grid grid-cols-1')}>
          {filtered.map((content) => {
            const legacy = getLegacyBody(content.currentVersion?.body).legacy;
            const updatedDate = formatUpdated(content.updatedAt);
            return (
              <Card className="gap-0 overflow-hidden border-[var(--v9-line)] bg-[var(--v9-panel)] py-0 shadow-none transition hover:border-[var(--v9-line-strong)]" key={content.id}>
                {view === 'grid' ? <Link className="block border-b border-[var(--v9-line)]" aria-label={`打开 ${content.title}`} href={`/workspace/design-assets/${content.slug}`}><AssetImage fileId={content.coverFile?.id} title={content.title} /></Link> : null}
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    {view === 'list' ? <div className="flex min-w-0 items-center gap-1.5 text-[var(--v9-subtle)]"><span className="truncate">{content.category?.name ?? '未分类'}</span><span aria-hidden="true">·</span><span>{content.assetDetail?.platforms[0] ?? '全平台'}</span></div> : null}
                    <FavoriteControl contentId={content.id} returnTo="/workspace/design-assets" />
                  </div>
                  <CardTitle className="mt-3 text-base"><Link href={`/workspace/design-assets/${content.slug}`}>{content.title}</Link></CardTitle>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[var(--v9-muted)]">{content.summary}</p>
                </CardHeader>

                <CardFooter className="mx-4 flex justify-between border-t border-[var(--v9-line)] bg-transparent px-0 py-4 text-xs text-[var(--v9-subtle)]">
                  <span>{legacy?.owner ?? content.owner.name} {legacy?.version ?? content.currentVersion?.versionLabel ?? ''}</span>
                  <span className="ml-auto">{updatedDate ? <time dateTime={content.updatedAt} title="最近更新">{updatedDate}</time> : null}</span>
                </CardFooter>
              </Card>
            );
          })}
        </section>
      ) : (
        <WorkspaceEmptyState className="mt-4 py-16 text-center">没有符合当前筛选条件的资产。</WorkspaceEmptyState>
      )}
    </section>
  );
}
