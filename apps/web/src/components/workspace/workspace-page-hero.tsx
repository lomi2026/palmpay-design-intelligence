import type { ReactNode } from 'react';

type WorkspacePageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  metric?: { value: string | number; label: string };
};

export function WorkspaceHeroMetric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="min-w-[82px] rounded-[14px] border border-[var(--v9-line)] bg-[var(--v9-soft)] p-3.5">
      <strong className="block text-[26px] font-semibold leading-none tracking-[-.055em] text-[var(--v9-text)]">{value}</strong>
      <span className="mt-2 block text-[10px] text-[var(--v9-subtle)]">{label}</span>
    </div>
  );
}

export function WorkspacePageHero({ eyebrow, title, description, children, metric }: WorkspacePageHeroProps) {
  return (
    <header className="relative overflow-hidden rounded-[22px] border border-[var(--v9-line)] bg-[var(--v9-panel)] px-6 py-7 sm:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--v9-grid-line)_1px,transparent_1px),linear-gradient(var(--v9-grid-line)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />
      <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[.2em] text-[var(--v9-subtle)]">{eyebrow}</p>
          <h1 className="mt-3 text-[34px] font-semibold tracking-[-.055em] text-[var(--v9-text)]">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--v9-copy)]">{description}</p>
        </div>
        {children || metric ? (
          <div className="flex flex-wrap items-end gap-3">
            {metric ? <WorkspaceHeroMetric label={metric.label} value={metric.value} /> : null}
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}
