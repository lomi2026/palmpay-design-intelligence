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
    <header className="relative overflow-hidden rounded-[22px] border border-white/[.11] bg-[#111112] px-6 py-7 sm:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      <div className="relative flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[.2em] text-white/45">{eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">{description}</p>
        </div>
        <form className="flex w-full max-w-xl gap-2" method="get">
          <label className="sr-only" htmlFor={searchId}>搜索{title}</label>
          <Input className="min-w-0 border-white/[.14] bg-black/[.25] text-white placeholder:text-white/35" defaultValue={search} id={searchId} name="search" placeholder={searchPlaceholder} type="search" />
          <Button className="border-white/[.16] bg-white/[.06] text-white hover:bg-white/[.12] hover:text-white" type="submit" variant="outline"><Search /> 搜索</Button>
        </form>
      </div>
      <div className="relative mt-6 flex flex-wrap items-center gap-2 text-[11px] text-white/50">
        <span className="rounded-full border border-white/[.11] bg-black/[.2] px-3 py-1.5">{count}</span>
        {source ? <span className="rounded-full border border-white/[.11] bg-black/[.2] px-3 py-1.5">{source}</span> : null}
        {search ? <span className="rounded-full border border-white/[.11] bg-black/[.2] px-3 py-1.5">搜索：{search}</span> : null}
      </div>
    </header>
  );
}
