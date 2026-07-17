import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CatalogPageHeader({
  eyebrow,
  title,
  description,
  search,
  searchId,
  searchPlaceholder,
  count,
  source,
}: {
  eyebrow: string;
  title: string;
  description: string;
  search: string;
  searchId: string;
  searchPlaceholder: string;
  count: string;
  source?: string;
}) {
  return (
    <header className="border-b border-white/10 pb-7">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-xs tracking-[0.18em] text-violet-200/75">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-white">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">{description}</p>
        </div>
        <form className="flex w-full max-w-md gap-2" method="get">
          <label className="sr-only" htmlFor={searchId}>搜索{title}</label>
          <Input className="min-w-0 border-white/15 bg-white/[0.045] text-white placeholder:text-white/35" defaultValue={search} id={searchId} name="search" placeholder={searchPlaceholder} type="search" />
          <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white" type="submit"><Search /> 搜索</Button>
        </form>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/45">
        <span>{count}</span>
        {source ? <span>{source}</span> : null}
        {search ? <span>搜索：{search}</span> : null}
      </div>
    </header>
  );
}
