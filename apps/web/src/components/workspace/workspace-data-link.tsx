'use client';
import Link from 'next/link';
import { useNavigationCache } from './navigation-cache';
import { useRouter } from 'next/navigation';
import { type ComponentProps } from 'react';

export function WorkspaceDataLink(props: ComponentProps<typeof Link>) {
  const router = useRouter();
  const cache = useNavigationCache();
  return <Link {...props} prefetch={false} onNavigate={(event) => {
    props.onNavigate?.(event);
    if (typeof props.href !== 'string') return;
    cache?.begin(props.href);
    const target = new URL(props.href, window.location.href);
    if (target.pathname === window.location.pathname && target.search === window.location.search) {
      event.preventDefault();
      router.refresh();
    }
  }}>{props.children}</Link>;
}
