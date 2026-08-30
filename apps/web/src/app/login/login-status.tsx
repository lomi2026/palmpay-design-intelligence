'use client';

import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';

type ServiceStatus = 'connecting' | 'ready' | 'slow';

export function LoginServiceStatus() {
  const [status, setStatus] = useState<ServiceStatus>('connecting');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 65_000);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

    fetch(`${apiBaseUrl}/api/health`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
      .then((response) => setStatus(response.ok ? 'ready' : 'slow'))
      .catch(() => setStatus('slow'))
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const message = {
    connecting: '正在连接测试服务，首次启动可能需要约 1 分钟。',
    ready: '测试服务已连接，可直接登录。',
    slow: '测试服务连接较慢；点击登录后会继续等待，请稍候。',
  }[status];

  return (
    <p aria-live="polite" className="mt-5 rounded-xl border border-white/10 bg-white/[.035] px-3 py-2 text-xs leading-5 text-white/55">
      {message}
    </p>
  );
}

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      aria-disabled={pending}
      className="h-11 w-full bg-white text-black hover:bg-white/85"
      disabled={pending}
      type="submit"
    >
      {pending ? '正在登录，请稍候…' : '继续'}
    </Button>
  );
}
