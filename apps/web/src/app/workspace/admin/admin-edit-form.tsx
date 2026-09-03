'use client';

import type { ComponentProps } from 'react';

// React resets successful action forms. Radix Select listens for that native
// reset event and restores its mount-time value, even for controlled selects.
// Editing is not creation: retain the submitted fields while the action returns
// refreshed server data instead of resetting them to the pre-edit snapshot.
export function AdminEditForm(props: ComponentProps<'form'>) {
  return (
    <form
      {...props}
      onResetCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    />
  );
}
