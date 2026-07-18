import type { ReactNode } from 'react';

type WorkspacePageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  metric?: { value: string | number; label: string };
};

export function WorkspacePageHero({ eyebrow, title, description, children, metric }: WorkspacePageHeroProps) {
  return (
    <header className="relative overflow-hidden rounded-[22px] border border-white/[.11] bg-[#111112] px-6 py-7 sm:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[.2em] text-white/45">{eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-white">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">{description}</p>
        </div>
        {children || metric ? (
          <div className="flex flex-wrap items-end gap-3">
            {metric ? <div className="min-w-[92px] rounded-[14px] border border-white/[.1] bg-black/[.22] p-3.5"><strong className="block text-[27px] font-semibold leading-none tracking-[-.055em] text-white">{metric.value}</strong><span className="mt-2 block text-[10px] text-white/45">{metric.label}</span></div> : null}
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
