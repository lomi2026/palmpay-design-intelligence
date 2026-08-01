export default function WorkspaceLoading() {
  return (
    <main className="px-5 py-8 md:px-8 md:py-10" aria-busy="true" aria-label="正在加载工作台内容">
      <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
      <div className="mt-4 h-9 w-52 animate-pulse rounded-lg bg-white/10" />
      <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.07]" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-2xl border border-white/10 bg-white/[0.035]" />
    </main>
  );
}
