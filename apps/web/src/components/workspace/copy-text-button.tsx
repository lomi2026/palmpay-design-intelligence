'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

export function CopyTextButton({ text, label = '复制内容' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      aria-label={copied ? '已复制' : label}
      className="h-9 border-white/[.14] bg-white/[.05] px-3 text-[12px] text-white hover:bg-white/[.12] hover:text-white"
      onClick={copy}
      type="button"
      variant="outline"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? '已复制' : label}
    </Button>
  );
}
