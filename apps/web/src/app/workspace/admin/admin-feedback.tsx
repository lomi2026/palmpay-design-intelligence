'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import type { AdminSaveResult } from './admin-save-result';

const feedbackEvent = 'palmpay:admin-save-feedback';

export function showAdminFeedback(result: AdminSaveResult) {
  window.dispatchEvent(new CustomEvent(feedbackEvent, { detail: result }));
}

export function AdminFeedback() {
  const [notice, setNotice] = useState<AdminSaveResult | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const show = (event: Event) => {
      const result = (event as CustomEvent<AdminSaveResult>).detail;
      clearTimeout(timer);
      setNotice(result);
      if (result.status === 'success') timer = setTimeout(() => setNotice(null), 5000);
    };
    window.addEventListener(feedbackEvent, show);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(feedbackEvent, show);
    };
  }, []);

  if (!notice) return null;
  const success = notice.status === 'success';
  const Icon = success ? CheckCircle2 : CircleAlert;
  return (
    <div
      role={success ? 'status' : 'alert'}
      className="fixed right-5 top-20 z-50 flex max-w-[min(420px,calc(100vw-40px))] items-start gap-3 rounded-xl border border-[var(--v9-line)] bg-[var(--v9-panel)] px-4 py-3 text-sm text-[var(--v9-text)] shadow-lg"
    >
      <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${success ? 'text-emerald-500' : 'text-amber-500'}`} />
      <span>{notice.message}</span>
      <button aria-label="关闭保存提示" className="shrink-0 rounded p-0.5" onClick={() => setNotice(null)} type="button"><X aria-hidden className="size-4" /></button>
    </div>
  );
}
