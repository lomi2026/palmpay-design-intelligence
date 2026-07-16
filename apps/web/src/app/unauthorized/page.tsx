import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <section>
        <p className="text-sm tracking-[0.18em] text-neutral-500">403</p>
        <h1 className="mt-3 text-2xl font-semibold">无权访问此页面</h1>
        <p className="mt-2 text-neutral-400">请联系平台管理员确认账号状态与角色范围。</p>
        <Link className="mt-6 inline-flex underline underline-offset-4" href="/">
          返回首页
        </Link>
      </section>
    </main>
  );
}
