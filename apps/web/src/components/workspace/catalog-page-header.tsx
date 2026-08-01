export function CatalogPageHeader({
  eyebrow,
  title,
  description,
  search,
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
  filterParams?: Record<string, string | undefined>;
}) {
  return (
    <header className="relative overflow-hidden rounded-[22px] border border-[var(--v9-line)] bg-[var(--v9-panel)] px-6 py-7 sm:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--v9-grid-line)_1px,transparent_1px),linear-gradient(var(--v9-grid-line)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />
      <div className="relative">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[.2em] text-[var(--v9-subtle)]">{eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-[var(--v9-text)]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--v9-copy)]">{description}</p>
        </div>
      </div>
      <div className="relative mt-6 flex flex-wrap items-center gap-2 text-[11px] text-[var(--v9-copy)]">
        <span className="rounded-full border border-[var(--v9-line)] bg-[var(--v9-soft)] px-3 py-1.5">{count}</span>
        {source ? <span className="rounded-full border border-[var(--v9-line)] bg-[var(--v9-soft)] px-3 py-1.5">{source}</span> : null}
        {search ? <span className="rounded-full border border-[var(--v9-line)] bg-[var(--v9-soft)] px-3 py-1.5">搜索：{search}</span> : null}
      </div>
    </header>
  );
}
