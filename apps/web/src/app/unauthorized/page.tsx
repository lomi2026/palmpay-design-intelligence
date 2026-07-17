import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,.16),transparent_30%),#0b0b0b] px-6 text-center">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-9 shadow-2xl shadow-black/30">
        <p className="text-sm tracking-[0.18em] text-violet-200/75">403</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-white">无权访问此页面</h1>
        <p className="mt-2 text-white/55">请联系平台管理员确认账号状态与角色范围。</p>
        <Button asChild variant="outline" className="mt-6 border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link href="/">返回首页</Link></Button>
      </section>
    </main>
  );
}
