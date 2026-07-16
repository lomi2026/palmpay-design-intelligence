import Link from 'next/link';
import { developmentLogin } from './actions';

const errorMessages: Record<string, string> = {
  'invalid-email': '请输入有效的企业邮箱。',
  'user-unavailable': '用户不存在、未启用或已被禁用。',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-2xl">
        <p className="text-xs tracking-[0.2em] text-neutral-500">PALMPAY DESIGN HUB</p>
        <h1 className="mt-4 text-2xl font-semibold">登录体验设计 Hub</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-400">
          当前为隔离的开发认证入口。正式环境接入企业 SSO 后将替换此表单。
        </p>

        <form action={developmentLogin} className="mt-7 space-y-4">
          <label className="block text-sm text-neutral-300" htmlFor="email">
            企业邮箱
          </label>
          <input
            autoComplete="email"
            className="h-11 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-black/30 px-3 outline-none transition focus:border-neutral-500"
            id="email"
            name="email"
            placeholder="name@palmpay.com"
            required
            type="email"
          />
          {error ? (
            <p className="text-sm text-red-400">{errorMessages[error] ?? '登录失败，请重试。'}</p>
          ) : null}
          <button
            className="h-11 w-full rounded-[var(--radius-md)] bg-white px-4 text-sm font-medium text-black transition hover:bg-neutral-200"
            type="submit"
          >
            继续
          </button>
        </form>

        <Link className="mt-6 inline-flex text-sm text-neutral-500 hover:text-neutral-300" href="/">
          返回公开首页
        </Link>
      </section>
    </main>
  );
}
