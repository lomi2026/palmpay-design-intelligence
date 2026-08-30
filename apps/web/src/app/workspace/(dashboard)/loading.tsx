export default function WorkspaceEntryLoading() {
  return (
    <main
      className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10"
      aria-busy="true"
      aria-label="正在首次加载工作台"
    >
      <section className="overflow-hidden rounded-[26px] border border-white/[.1] bg-[linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.01)_55%),#111] px-6 py-8 md:px-9 md:py-10">
        <div className="h-3 w-36 animate-pulse rounded bg-white/10" />
        <div className="mt-5 h-12 w-full max-w-lg animate-pulse rounded-xl bg-white/10" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-white/[0.07]" />
      </section>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-[20px] border border-white/[.1] bg-white/[0.035]"
          />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-[22px] border border-white/[.1] bg-white/[0.035]" />
    </main>
  );
}
