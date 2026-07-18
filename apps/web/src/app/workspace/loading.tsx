export default function WorkspaceLoading() {
  return (
    <main aria-busy="true" aria-label="页面加载中" className="mx-auto max-w-[1232px] px-5 py-7 md:px-8">
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[.06]">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-white/45" />
      </div>
      <p className="mt-3 text-[11px] text-white/40">正在加载内容…</p>
    </main>
  );
}
