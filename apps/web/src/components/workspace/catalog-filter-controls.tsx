import Link from 'next/link';
import type { ContentCard } from '@/lib/content-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Filters = {
  search?: string;
  categoryId?: string;
  tag?: string;
  verificationStatus?: string;
};

const verificationLabels: Record<string, string> = {
  UNVERIFIED: '待验证',
  INTERNAL_TRIAL: '内部试运行',
  PILOT: '试点中',
  VERIFIED: '已验证',
  INVALIDATED: '已失效',
};

export function CatalogFilterControls({
  pathname,
  contents,
  filters,
  searchPlaceholder,
}: {
  pathname: string;
  contents: ContentCard[];
  filters: Filters;
  searchPlaceholder?: string;
}) {
  const categories = Array.from(
    new Map(contents.filter((item) => item.category).map((item) => [item.category!.id, item.category!])).values(),
  );
  const tags = Array.from(
    new Map(contents.flatMap((item) => item.tags.map(({ tag }) => [tag.normalizedName, tag] as const))).values(),
  );
  const statuses = Array.from(new Set(contents.map((item) => item.verificationStatus))).sort();
  const hasFilters = Boolean(filters.categoryId || filters.tag || filters.verificationStatus);

  return <form action={pathname} className="mt-4 flex flex-wrap items-end gap-2 rounded-[16px] border border-white/[.1] bg-white/[.025] p-3" method="get">
    {searchPlaceholder ? <label className="grid flex-1 gap-1 text-[10px] font-semibold tracking-[.1em] text-white/45">搜索<Input className="h-8 min-w-44 border-white/[.12] bg-black/25 text-xs text-white placeholder:text-white/35" defaultValue={filters.search ?? ''} name="search" placeholder={searchPlaceholder} type="search" /></label> : filters.search ? <input name="search" type="hidden" value={filters.search} /> : null}
    <label className="grid gap-1 text-[10px] font-semibold tracking-[.1em] text-white/45">分类<select className="h-8 min-w-32 rounded-lg border border-white/[.12] bg-black/25 px-2 text-xs text-white" defaultValue={filters.categoryId ?? ''} name="categoryId"><option value="">全部分类</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
    <label className="grid gap-1 text-[10px] font-semibold tracking-[.1em] text-white/45">标签<select className="h-8 min-w-28 rounded-lg border border-white/[.12] bg-black/25 px-2 text-xs text-white" defaultValue={filters.tag ?? ''} name="tag"><option value="">全部标签</option>{tags.map((tag) => <option key={tag.id} value={tag.normalizedName}>{tag.name}</option>)}</select></label>
    <label className="grid gap-1 text-[10px] font-semibold tracking-[.1em] text-white/45">适用状态<select className="h-8 min-w-28 rounded-lg border border-white/[.12] bg-black/25 px-2 text-xs text-white" defaultValue={filters.verificationStatus ?? ''} name="verificationStatus"><option value="">全部状态</option>{statuses.map((status) => <option key={status} value={status}>{verificationLabels[status] ?? status}</option>)}</select></label>
    <Button className="h-8 rounded-lg border-white/[.14] bg-white/[.06] px-3 text-xs text-white hover:bg-white/[.12] hover:text-white" size="sm" type="submit" variant="outline">应用筛选</Button>
    {hasFilters ? <Button asChild className="h-8 rounded-lg px-2.5 text-xs text-white/60 hover:bg-white/[.08] hover:text-white" size="sm" variant="ghost"><Link href={filters.search ? `${pathname}?search=${encodeURIComponent(filters.search)}` : pathname}>清除</Link></Button> : null}
  </form>;
}
