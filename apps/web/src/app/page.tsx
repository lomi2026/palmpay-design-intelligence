import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between px-6 py-10 md:px-10">
      <section className="max-w-3xl pt-24">
        <p className="mb-5 text-sm tracking-[0.18em] text-neutral-400">
          PALMPAY DESIGN INTELLIGENCE HUB
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
          平台不是作品集，而是治理机制
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-400 md:text-lg">
          V1.0 工程底座已初始化。正式内容、权限和治理流程将在后续阶段接入。
        </p>
        <Link
          className="mt-10 inline-flex rounded-[var(--radius-md)] border border-neutral-600 px-4 py-2 text-sm transition hover:bg-neutral-900"
          href="/workspace"
        >
          进入工作台
        </Link>
      </section>
      <p className="text-sm text-neutral-500">PalmPay体验设计Hub V1.0</p>
    </main>
  );
}
