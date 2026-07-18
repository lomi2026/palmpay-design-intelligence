import { DesignAssetsCatalog } from '@/components/workspace/design-assets-catalog';
import { CatalogFilterControls } from '@/components/workspace/catalog-filter-controls';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import type { ContentListResponse } from '@/lib/content-types';

export default async function DesignAssetsPage({ searchParams }: { searchParams: Promise<{ search?: string; categoryId?: string; tag?: string; verificationStatus?: string }> }) {
  const { search = '', categoryId, tag, verificationStatus } = await searchParams;
  const filters = { search: search.trim() || undefined, categoryId, tag, verificationStatus };
  const query = new URLSearchParams({ type: 'DESIGN_ASSET', pageSize: '100' });
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  const baseQuery = new URLSearchParams({ type: 'DESIGN_ASSET', pageSize: '100' });
  const [contents, filterSource] = await Promise.all([
    serverApiFetch<ContentListResponse>(`/api/contents?${query}`, { headers: await authenticatedApiHeaders() }),
    serverApiFetch<ContentListResponse>(`/api/contents?${baseQuery}`, { headers: await authenticatedApiHeaders() }),
  ]);

  return <main className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8"><CatalogFilterControls contents={filterSource.items} filters={filters} pathname="/workspace/design-assets" searchPlaceholder="搜索资产名称、场景或描述" /><DesignAssetsCatalog contents={contents.items} search={search} /></main>;
}
