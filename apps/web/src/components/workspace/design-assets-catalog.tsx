'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Check, CircleCheck, Grid2X2, LayoutList, Plus, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContentCard } from '@/lib/content-types';
import { cn } from '@/lib/utils';
import { FavoriteControl } from './engagement-controls';

type LegacyAssetBody = {
  legacy?: {
    owner?: string;
    date?: string;
    version?: string;
    statusLabel?: string;
    cover?: string;
  };
};

type DesignAssetCard = ContentCard & {
  currentVersion?: { versionLabel: string | null; body: unknown } | null;
};

const platforms = ['全部平台', 'Web', 'Mobile', '全平台'] as const;

function getLegacyBody(value: unknown): LegacyAssetBody {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as LegacyAssetBody;
}

function formatUpdated(date?: string) {
  if (!date) return '—';
  const [, month = '', day = ''] = date.match(/\d{4}-(\d{2})-(\d{2})/) ?? [];
  return month && day ? `${month}-${day}` : date;
}

function statusClass(status: string) {
  if (status === '待复审') return 'border-amber-200/20 bg-amber-200/8 text-amber-100/75';
  if (status === '试运行') return 'border-sky-200/20 bg-sky-200/8 text-sky-100/75';
  return 'border-emerald-200/20 bg-emerald-200/8 text-emerald-100/75';
}

function AssetCover({ category, cover, platform }: { category: string; cover?: string; platform: string }) {
  const preview = (() => {
    switch (cover) {
      case 'amount': return <div className="absolute inset-x-8 top-4 rounded-2xl border border-white/15 bg-black/95 p-5 shadow-2xl"><div className="text-[10px] uppercase tracking-widest text-white/40">Settlement amount</div><div className="mt-3 flex items-end justify-between border-b border-white/12 pb-4"><span className="text-3xl font-semibold tracking-tight">₦ 125,000.00</span><span className="text-xs text-white/45">NGN</span></div><div className="mt-4 flex gap-2"><span className="h-7 flex-1 rounded-md bg-white" /><span className="h-7 w-12 rounded-md border border-white/20" /></div></div>;
      case 'desktop': return <div className="absolute inset-x-2 top-1 h-32 rounded-xl border border-white/15 bg-black/95 p-2 shadow-2xl"><div className="flex h-full"><div className="w-9 rounded-md bg-white p-1.5"><div className="mx-auto size-3 rounded-full bg-black" />{Array.from({ length: 4 }, (_, index) => <div className="mx-auto mt-2 h-1 w-4 rounded bg-black/35" key={index} />)}</div><div className="flex-1 p-2"><div className="flex justify-between"><div className="h-2 w-20 rounded bg-white/70" /><div className="h-5 w-14 rounded bg-white" /></div><div className="mt-3 grid grid-cols-3 gap-2">{Array.from({ length: 3 }, (_, index) => <div className="h-9 rounded border border-white/15 bg-white/[0.035]" key={index} />)}</div><div className="mt-2 h-10 rounded border border-white/15 bg-white/[0.025]" /></div></div></div>;
      case 'mobile': return <div className="absolute left-1/2 top-0 h-36 w-20 -translate-x-1/2 rounded-[20px] border-2 border-white/80 bg-black p-2 shadow-2xl"><div className="mx-auto h-1 w-7 rounded-full bg-white/30" /><div className="mt-3 h-4 w-10 rounded bg-white/80" /><div className="mt-3 rounded-lg border border-white/15 p-2"><div className="h-2 w-8 rounded bg-white/20" /><div className="mt-2 h-3 w-12 rounded bg-white/70" /></div><div className="mt-2 h-8 rounded-lg bg-white" /></div>;
      case 'form': return <div className="absolute inset-x-7 top-2 rounded-2xl border border-white/15 bg-black/95 p-4 shadow-2xl"><div className="mb-3 flex gap-2"><span className="size-5 rounded-full bg-white" /><span className="mt-1 h-3 w-24 rounded bg-white/75" /></div>{Array.from({ length: 2 }, (_, index) => <div className="mb-3" key={index}><div className="mb-1 h-2 w-14 rounded bg-white/25" /><div className={cn('h-8 rounded-md border border-white/20', index === 1 && 'border-dashed border-white/60')} /></div>)}<div className="ml-auto h-7 w-20 rounded bg-white" /></div>;
      case 'checklist': return <div className="absolute inset-x-10 top-0 rounded-2xl border border-white/15 bg-black/95 p-4 shadow-2xl"><div className="mb-4 h-3 w-24 rounded bg-white/75" />{Array.from({ length: 4 }, (_, index) => <div className="mb-3 flex items-center gap-2" key={index}><span className={cn('grid size-4 place-items-center rounded border border-white/35', index < 2 && 'bg-white text-black')} >{index < 2 ? <Check className="size-3" /> : null}</span><span className="h-2 flex-1 rounded bg-white/15" /></div>)}</div>;
      case 'research': return <div className="absolute inset-x-5 top-3 grid h-28 grid-cols-[.8fr_1.2fr] gap-3 rounded-2xl border border-white/15 bg-black/95 p-4 shadow-2xl"><div><div className="h-3 w-16 rounded bg-white/70" /><div className="mt-4 space-y-2">{['w-[65%]', 'w-[85%]', 'w-1/2'].map((width) => <div className={cn('h-2 rounded bg-white/15', width)} key={width} />)}</div></div><div className="flex items-end gap-2 border-b border-l border-white/20 p-2">{[35, 60, 48, 80, 68].map((height, index) => <div className="flex-1 bg-white" key={index} style={{ height: `${height}%`, opacity: 0.35 + index * 0.1 }} />)}</div></div>;
      case 'compare': return <div className="absolute inset-x-5 top-3 grid h-28 grid-cols-2 gap-2"><div className="rounded-xl border border-white/15 bg-black/95 p-3 shadow-xl"><div className="mb-2 text-[9px] uppercase tracking-widest text-white/40">Design</div><div className="h-16 rounded-md border border-white/20 p-2"><div className="h-2 w-12 rounded bg-white/20" /><div className="mt-3 h-6 rounded bg-white" /></div></div><div className="relative rounded-xl border border-white/15 bg-black/95 p-3 shadow-xl"><div className="mb-2 text-[9px] uppercase tracking-widest text-white/40">Build</div><div className="h-16 rounded-md border border-white/20 p-2"><div className="h-2 w-10 rounded bg-white/20" /><div className="mt-3 h-6 rounded border-2 border-dashed border-white/70" /></div><span className="absolute top-12 right-1 grid size-5 place-items-center rounded-full bg-white text-[9px] text-black">3</span></div></div>;
      case 'table':
      default: return <div className="absolute inset-x-3 top-2 h-28 rounded-xl border border-white/15 bg-black/90 p-3 shadow-xl"><div className="mb-3 flex items-center justify-between"><div className="h-2 w-16 rounded bg-white/80" /><div className="h-6 w-16 rounded border border-white/20" /></div>{Array.from({ length: 3 }, (_, row) => <div className="mb-2 grid grid-cols-[1.2fr_.8fr_.65fr_.35fr] gap-2" key={row}>{[15, 10, 10, 25].map((opacity, column) => <span className="h-2 rounded bg-white" key={column} style={{ opacity: opacity / 100 }} />)}</div>)}</div>;
    }
  })();

  return <div className="relative h-40 overflow-hidden border-b border-white/10 bg-white/[0.025] p-5"><div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:16px_16px]" /><div className="relative z-10 h-full">{preview}</div><Badge className="absolute bottom-4 left-4 z-20 h-5 rounded-full border-transparent bg-white/10 px-2.5 text-xs font-medium text-white" variant="secondary">{category}</Badge><span className="absolute top-4 right-4 z-20 rounded-full border border-white/15 bg-black/80 px-2 py-1 text-[10px] text-white/75 backdrop-blur">{platform}</span></div>;
}

export function DesignAssetsCatalog({ contents, search }: { contents: DesignAssetCard[]; search: string }) {
  const [platform, setPlatform] = useState<(typeof platforms)[number]>('全部平台');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return contents.filter((content) => {
      const matchesPlatform = platform === '全部平台' || content.assetDetail?.platforms.includes(platform);
      return matchesPlatform;
    });
  }, [contents, platform]);

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[32px] font-semibold leading-10 tracking-[-0.045em] text-white">设计资产</h1>
          <p className="mt-1.5 text-sm text-white/48">搜索、判断并复用经过治理的团队设计资产。</p>
        </div>
        <Button asChild className="h-9 rounded-lg bg-white px-3.5 text-sm text-black hover:bg-white/90">
          <Link href="/workspace/submit?type=DESIGN_ASSET"><Plus />新增资产</Link>
        </Button>
      </div>

      <section className="mt-7 rounded-xl border border-white/10 bg-white/[0.025] p-3.5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-end">
          <Select onValueChange={(value) => setPlatform(value as (typeof platforms)[number])} value={platform}>
            <SelectTrigger className="h-10 w-full border-white/10 bg-black/20 text-white/75 lg:w-32"><SelectValue placeholder={platform}>{platform}</SelectValue></SelectTrigger>
            <SelectContent>{platforms.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex rounded-lg border border-white/10 bg-black/20 p-0.5">
            <Button aria-label="卡片视图" className={cn('size-7 rounded-md p-0', view === 'grid' ? 'bg-white/12 text-white hover:bg-white/16' : 'text-white/45 hover:bg-white/8 hover:text-white')} onClick={() => setView('grid')} size="icon-xs" type="button" variant="ghost"><Grid2X2 /></Button>
            <Button aria-label="列表视图" className={cn('size-7 rounded-md p-0', view === 'list' ? 'bg-white/12 text-white hover:bg-white/16' : 'text-white/45 hover:bg-white/8 hover:text-white')} onClick={() => setView('list')} size="icon-xs" type="button" variant="ghost"><LayoutList /></Button>
          </div>
        </div>
        {search ? <p className="mt-3 text-xs text-white/45">搜索：{search}</p> : null}
      </section>

      <div className="mt-5 flex items-center justify-between text-xs text-white/42">
        <span>共 {filtered.length} 项资产</span>
        <span>最近更新优先</span>
      </div>

      {filtered.length ? (
        <section className={cn('mt-3.5 gap-3.5', view === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3' : 'grid grid-cols-1')}>
          {filtered.map((content) => {
            const legacy = getLegacyBody(content.currentVersion?.body).legacy;
            const status = legacy?.statusLabel ?? '已发布';
            return (
              <Card className={cn('gap-0 overflow-hidden border border-white/10 bg-white/[0.025] py-0 shadow-none transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.045]', view === 'list' && 'md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center')} key={content.id}>
                {view === 'grid' ? <Link aria-label={`打开 ${content.title}`} href={`/workspace/design-assets/${content.slug}`} prefetch={false}><AssetCover category={content.category?.name ?? '未分类'} cover={legacy?.cover} platform={content.assetDetail?.platforms[0] ?? '全平台'} /></Link> : null}
                <CardHeader className="p-4 pb-4">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    {view === 'list' ? <div className="flex min-w-0 items-center gap-1.5 text-white/42"><span className="truncate">{content.category?.name ?? '未分类'}</span><span className="text-white/20">·</span><span>{content.assetDetail?.platforms[0] ?? '全平台'}</span></div> : <Badge className={cn('h-5 rounded-full border px-2 text-xs font-medium', statusClass(status))} variant="outline">{status === '已验证' ? <ShieldCheck className="size-3" /> : <CircleCheck className="size-3" />}{status}</Badge>}
                    <FavoriteControl contentId={content.id} returnTo="/workspace/design-assets" />
                  </div>
                  <CardTitle className="mt-3 text-base font-semibold leading-6 tracking-tight text-white"><Link className="transition hover:text-white/70" href={`/workspace/design-assets/${content.slug}`} prefetch={false}>{content.title}</Link></CardTitle>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-white/47">{content.summary}</p>
                </CardHeader>
                <CardContent className="px-4 pb-0">
                  <div className="mb-4 flex flex-wrap gap-2">{content.tags.map(({ tag }) => <Badge className="h-5 rounded-full border-white/10 bg-white/[0.035] px-2.5 text-xs font-medium text-white/43" key={tag.id} variant="outline">{tag.name}</Badge>)}</div>
                </CardContent>
                <CardFooter className="mx-4 flex border-t border-white/10 bg-transparent px-0 py-4 text-xs text-white/35 md:col-start-1">
                  <span>{legacy?.owner ?? content.owner.name} {legacy?.version ?? content.currentVersion?.versionLabel ?? ''}</span>
                  <span className="ml-auto">{formatUpdated(legacy?.date)}</span>
                </CardFooter>
              </Card>
            );
          })}
        </section>
      ) : (
        <section className="mt-3.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center text-sm text-white/45">没有符合当前筛选条件的资产。</section>
      )}
    </section>
  );
}
