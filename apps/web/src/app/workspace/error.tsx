'use client';

import { RotateCcw, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,.08),transparent_34%),#090909] px-5 py-12">
      <section className="w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/[.12] bg-[linear-gradient(135deg,rgba(255,255,255,.07),transparent_55%),#111] p-7 text-center md:p-11">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-amber-200/15 bg-amber-400/10 text-amber-200">
          <TriangleAlert className="size-5" />
        </span>
        <p className="mt-6 text-[11px] font-bold tracking-[.18em] text-white/45">WORKSPACE RECOVERY</p>
        <h1 className="mt-3 text-[38px] font-semibold tracking-[-.055em] text-white md:text-[52px]">页面暂时无法加载。</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55">正式数据服务可能暂时不可用。你可以安全重试当前请求；未提交的数据不会在这里被伪造或替代。</p>
        <Button type="button" onClick={reset} className="mt-7 h-11 bg-white px-5 font-semibold text-black hover:bg-white/90">
          <RotateCcw className="size-4" /> 重新加载
        </Button>
      </section>
    </main>
  );
}
