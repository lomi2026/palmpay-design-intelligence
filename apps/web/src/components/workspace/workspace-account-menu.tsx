'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { logout } from '@/app/login/actions';
import { Button } from '@/components/ui/button';

export function WorkspaceAccountMenu({ name, roleLabel }: { name: string; roleLabel: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeFromOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeFromKeyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', closeFromOutside);
    document.addEventListener('keydown', closeFromKeyboard);
    return () => {
      document.removeEventListener('pointerdown', closeFromOutside);
      document.removeEventListener('keydown', closeFromKeyboard);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-10 cursor-pointer items-center gap-2 rounded-[10px] px-2 hover:bg-[var(--v9-soft-hover)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--v9-raised)] text-[11px] font-bold">{name.slice(0, 2).toUpperCase()}</span>
        <span className="hidden text-left leading-4 lg:block"><strong className="block text-[12px]">{name}</strong><em className="block text-[11px] not-italic text-[var(--v9-muted)]">{roleLabel}</em></span>
        <ChevronDown className={`size-3 text-[var(--v9-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <form action={logout} className="absolute right-0 top-11 w-28 rounded-lg border border-[var(--v9-line)] bg-[var(--v9-panel-2)] p-1 shadow-xl" role="menu">
          <Button type="submit" variant="ghost" className="w-full justify-start text-[var(--v9-text)] hover:bg-[var(--v9-soft-hover)] hover:text-[var(--v9-text)]"><LogOut className="size-4" />退出</Button>
        </form>
      ) : null}
    </div>
  );
}
