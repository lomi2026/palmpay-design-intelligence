'use client';

import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import type { ComponentProps } from 'react';

type AdminSubmitButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

export function AdminSubmitButton({
  children,
  disabled,
  pendingLabel = '保存中…',
  ...props
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button {...props} aria-disabled={pending || disabled} disabled={pending || disabled} type="submit">
      {pending ? pendingLabel : children}
    </Button>
  );
}
