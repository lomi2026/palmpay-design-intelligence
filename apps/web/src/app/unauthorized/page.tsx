import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#090909] px-6 text-center">
      <section className="relative overflow-hidden rounded-[28px] border border-white/[.11] bg-[#111112] p-9 shadow-2xl shadow-black/30">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
        <div className="relative"><p className="text-[11px] font-semibold tracking-[.2em] text-white/45">403 · ACCESS CONTROL</p>
        <h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white">无权访问此页面</h1>
        <p className="mt-2 text-white/55">请联系平台管理员确认账号状态与角色范围。</p>
        <Button asChild variant="outline" className="mt-6 border-white/15 bg-white/[.04] text-white hover:bg-white/10 hover:text-white"><Link href="/">返回首页</Link></Button>
        </div>
      </section>
    </main>
  );
}
