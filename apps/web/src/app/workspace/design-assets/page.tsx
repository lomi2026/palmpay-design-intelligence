import Link from 'next/link';
import { Grid2X2, LayoutList, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { CatalogFilterControls } from '@/components/workspace/catalog-filter-controls';
import { DesignAssetsCatalog } from '@/components/workspace/design-assets-catalog';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import type { ContentListResponse } from '@/lib/content-types';
import { cn } from '@/lib/utils';

const platforms = ['全部平台', 'Web', 'Mobile', '全平台'] as const;

type Platform = (typeof platforms)[number];
type View = 'grid' | 'list';

function isPlatform(value: string | undefined): value is Platform {
  return platforms.includes(value as Platform);
}

export default async function DesignAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    tag?: string;
    verificationStatus?: string;
    platform?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search ?? '';
  const { categoryId, tag, verificationStatus } = params;
  const platform: Platform = isPlatform(params.platform) ? params.platform : '全部平台';
  const view: View = params.view === 'list' ? 'list' : 'grid';
  const filters = { search: search.trim() || undefined, categoryId, tag, verificationStatus, platform, view };
  const apiFilters = { search: filters.search, categoryId, tag, verificationStatus };
  const query = new URLSearchParams({ type: 'DESIGN_ASSET', pageSize: '100' });
  for (const [key, value] of Object.entries(apiFilters)) if (value) query.set(key, value);
  const baseQuery = new URLSearchParams({ type: 'DESIGN_ASSET', pageSize: '100' });
  const [contents, filterSource] = await Promise.all([
    serverApiFetch<ContentListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() }),
    serverApiFetch<ContentListResponse>(`/api/contents?${baseQuery}`, { headers: await authenticatedApiHeaders() }),
  ]);

  function viewHref(nextView: View) {
    const next = new URLSearchParams();
    if (filters.search) next.set('search', filters.search);
    if (categoryId) next.set('categoryId', categoryId);
    if (tag) next.set('tag', tag);
    if (verificationStatus) next.set('verificationStatus', verificationStatus);
    if (platform !== '全部平台') next.set('platform', platform);
    if (nextView !== 'grid') next.set('view', nextView);
    const suffix = next.toString();
    return suffix ? `/workspace/design-assets?${suffix}` : '/workspace/design-assets';
  }

  const selectClass = 'h-10 min-w-32 rounded-lg border border-[var(--v9-line-strong)] bg-[var(--v9-field)] px-3 text-xs text-[var(--v9-text)] outline-none focus-visible:border-[var(--v9-text)] focus-visible:ring-3 focus-visible:ring-[var(--v9-soft-hover)]';

  return (
    <main className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[.2em] text-[var(--v9-subtle)]">DESIGN ASSET LIBRARY</p>
          <h1 className="mt-3 text-[32px] font-semibold leading-10 tracking-[-0.045em] text-white">设计资产</h1>
          <p className="mt-1.5 text-sm text-white/48">搜索、判断并复用经过治理的团队设计资产。</p>
        </div>
        <Button asChild className="h-9 rounded-lg bg-white px-3.5 text-sm text-black hover:bg-white/90">
          <Link href="/workspace/submit?type=DESIGN_ASSET"><Plus />新增资产</Link>
        </Button>
      </div>

      <CatalogFilterControls
        contents={filterSource.items}
        extraControls={(
          <>
            <label>
              <span className="sr-only">平台</span>
              <NativeSelect className={selectClass} defaultValue={platform} name="platform">
                {platforms.map((item) => <option key={item} value={item}>{item}</option>)}
              </NativeSelect>
            </label>
            <input name="view" type="hidden" value={view} />
            <div aria-label="视图切换" className="flex h-10 items-center rounded-lg border border-[var(--v9-line-strong)] bg-[var(--v9-field)] p-1">
              <Button asChild size="icon-xs" variant="ghost">
                <Link aria-label="卡片视图" aria-pressed={view === 'grid'} className={cn('size-7 rounded-md p-0', view === 'grid' ? 'bg-[var(--v9-soft-hover)] text-[var(--v9-text)]' : 'text-[var(--v9-muted)]')} href={viewHref('grid')}><Grid2X2 /></Link>
              </Button>
              <Button asChild size="icon-xs" variant="ghost">
                <Link aria-label="列表视图" aria-pressed={view === 'list'} className={cn('size-7 rounded-md p-0', view === 'list' ? 'bg-[var(--v9-soft-hover)] text-[var(--v9-text)]' : 'text-[var(--v9-muted)]')} href={viewHref('list')}><LayoutList /></Link>
              </Button>
            </div>
          </>
        )}
        filters={filters}
        pathname="/workspace/design-assets"
        searchPlaceholder="搜索资产名称、场景或描述"
      />
      <DesignAssetsCatalog contents={contents.items} platform={platform} view={view} />
    </main>
  );
}
