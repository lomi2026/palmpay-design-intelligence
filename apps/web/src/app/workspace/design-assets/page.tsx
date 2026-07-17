import { DesignAssetsCatalog } from '@/components/workspace/design-assets-catalog';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';
import type { ContentListResponse } from '@/lib/content-types';

export default async function DesignAssetsPage() {
  const query = new URLSearchParams({ type: 'DESIGN_ASSET', pageSize: '100' });
  const contents = await serverApiFetch<ContentListResponse>(`/api/contents?${query}`, {
    headers: await authenticatedApiHeaders(),
  });

  return <DesignAssetsCatalog contents={contents.items} />;
}
