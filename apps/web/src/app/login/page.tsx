import Link from 'next/link';
import { developmentLogin, testLogin } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const errorMessages: Record<string, string> = {
  'invalid-email': '请输入有效的企业邮箱。',
  'user-unavailable': '用户不存在、未启用或已被禁用。',
  'invalid-credentials': '邮箱、测试访问码无效，或该用户尚未启用。',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const isTestMode = process.env.AUTH_MODE === 'test';

  return (
    <main className="grid min-h-screen place-items-center bg-[#090909] px-6 py-12">
      <section className="relative w-full max-w-[560px] overflow-hidden rounded-[28px] border border-white/[.11] bg-[#111112] p-7 shadow-2xl shadow-black/30 sm:p-10">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
        <div className="relative"><p className="text-[11px] font-semibold tracking-[.24em] text-white/45">PALMPAY DESIGN HUB</p>
        <h1 className="mt-4 text-[34px] font-semibold tracking-[-.055em] text-white">登录体验设计 Hub</h1>
        <p className="mt-2 text-sm leading-6 text-white/55">
          {isTestMode
            ? '测试环境仅允许已启用成员使用测试访问码登录。正式环境接入企业 SSO 后将替换此表单。'
            : '当前为隔离的开发认证入口。正式环境接入企业 SSO 后将替换此表单。'}
        </p>

        <form action={isTestMode ? testLogin : developmentLogin} className="mt-8 space-y-4">
          <label className="block text-sm text-white/75" htmlFor="email">
            企业邮箱
          </label>
          <Input
            autoComplete="email"
            className="h-11 w-full border-white/15 bg-black/25 text-white placeholder:text-white/35"
            id="email"
            name="email"
            placeholder="name@palmpay.com"
            required
            type="email"
          />
          {isTestMode ? (
            <>
              <label className="block text-sm text-white/75" htmlFor="accessCode">
                测试访问码
              </label>
              <Input
                autoComplete="current-password"
                className="h-11 w-full border-white/15 bg-black/25 text-white placeholder:text-white/35"
                id="accessCode"
                name="accessCode"
                required
                type="password"
              />
            </>
          ) : null}
          {error ? (
            <p className="text-sm text-red-400">{errorMessages[error] ?? '登录失败，请重试。'}</p>
          ) : null}
          <Button
            className="h-11 w-full bg-white text-black hover:bg-white/85"
            type="submit"
          >
            继续
          </Button>
        </form>

        <Link className="mt-7 inline-flex text-sm text-white/45 transition hover:text-white/75" href="/">
          返回公开首页
        </Link>
        </div>
      </section>
    </main>
  );
}
