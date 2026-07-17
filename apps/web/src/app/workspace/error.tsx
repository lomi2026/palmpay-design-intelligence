'use client';

import { RotateCcw, TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-5 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-200">
          <TriangleAlert className="size-5" />
        </span>
        <p className="mt-5 text-xs tracking-[0.18em] text-white/40">WORKSPACE ERROR</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">页面暂时无法加载</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">正式数据服务可能暂时不可用。你可以重试当前请求；未提交的数据不会在这里被伪造或替代。</p>
        <Button type="button" onClick={reset} className="mt-6 bg-white font-semibold text-black hover:bg-white/90">
          <RotateCcw className="size-4" /> 重新加载
        </Button>
      </section>
    </main>
  );
}
