'use client';

import { startTransition, useActionState, useEffect, useRef, type ComponentProps } from 'react';
import { useRouter } from 'next/navigation';
import { showAdminFeedback } from './admin-feedback';
import type { AdminSaveResult } from './admin-save-result';

type AdminEditFormProps = Omit<ComponentProps<'form'>, 'action'> & {
  action: (formData: FormData) => Promise<AdminSaveResult>;
  resetOnSuccess?: boolean;
};

// React resets successful action forms. Radix Select listens for that native
// reset event and restores its mount-time value, even for controlled selects.
// Editing is not creation: retain the submitted fields while the action returns
// refreshed server data instead of resetting them to the pre-edit snapshot.
export function AdminEditForm({ action, resetOnSuccess = false, ...props }: AdminEditFormProps) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const allowReset = useRef(false);
  const [result, formAction] = useActionState<AdminSaveResult, FormData>(
    async (_previous: AdminSaveResult, formData: FormData): Promise<AdminSaveResult> => {
      try {
        return await action(formData);
      } catch {
        return { status: 'error', message: '连接中断，操作结果暂未确认。请刷新核对状态后再重试。' };
      }
    },
    { status: 'idle', message: '' },
  );

  useEffect(() => {
    if (result.status === 'idle') return;
    showAdminFeedback(result);
    // Run after the write action has settled. A slow follow-up read must not
    // keep a successfully saved row in the form's pending state.
    if (result.status === 'success') {
      if (resetOnSuccess) {
        allowReset.current = true;
        form.current?.reset();
        allowReset.current = false;
      }
      startTransition(() => router.refresh());
    }
  }, [result, router, resetOnSuccess]);

  return (
    <form
      {...props}
      ref={form}
      action={formAction}
      onResetCapture={(event) => {
        if (allowReset.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
    />
  );
}
