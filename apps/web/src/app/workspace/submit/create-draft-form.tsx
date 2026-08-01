'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, FileText, Layers3, Sparkles } from 'lucide-react';

import { createDraftAction, type ActionState } from './actions';
import { ContentTypeFields } from './content-type-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';

type Team = { id: string; name: string; code: string };
type ContentType = 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT';

const initialState: ActionState = {};

const contentTypes: Array<{ value: ContentType; label: string; description: string; icon: typeof Layers3 }> = [
  { value: 'DESIGN_ASSET', label: '设计资产', description: '沉淀可直接复用的规范、模板与方法。', icon: Layers3 },
  { value: 'AI_SKILL', label: 'AI Skill', description: '记录可复用的 AI 工作方法与判断边界。', icon: Sparkles },
  { value: 'AI_CASE', label: 'AI 案例', description: '说明 AI 如何介入、结果如何被验证。', icon: FileText },
  { value: 'AI_PROJECT', label: 'AI 项目', description: '建立可评估、可试点的探索方向。', icon: BriefcaseBusiness },
];

export function CreateDraftForm({
  teams,
  initialContentType = 'DESIGN_ASSET',
}: {
  teams: Team[];
  initialContentType?: ContentType;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createDraftAction, initialState);
  const [contentType, setContentType] = useState<ContentType>(initialContentType);
  useEffect(() => {
    if (state.id) router.replace(`/workspace/submit/${state.id}`);
  }, [router, state.id]);

  return (
    <form action={action} className="mt-6 overflow-hidden rounded-[20px] border border-[var(--v9-line)] bg-[var(--v9-panel)]">
      <section className="border-b border-[var(--v9-line)] p-5 md:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[11px] font-semibold tracking-[.16em] text-white/45">01 / 内容类型</p><h2 className="mt-2 text-[22px] font-semibold tracking-[-.04em] text-white">选择要沉淀的团队能力</h2></div><p className="max-w-sm text-[12px] leading-5 text-white/45">不同类型会使用对应字段结构；创建后均以私有草稿开始。</p></div>
        <input name="contentType" type="hidden" value={contentType} />
        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{contentTypes.map(({ value, label, description, icon: Icon }) => <button aria-pressed={contentType === value} className={`rounded-[14px] border p-4 text-left text-[var(--v9-text)] transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--v9-soft-hover)] ${contentType === value ? 'border-[var(--v9-status-accent-line)] bg-[var(--v9-status-accent-bg)]' : 'border-[var(--v9-line)] bg-[var(--v9-soft)] hover:border-[var(--v9-line-strong)] hover:bg-[var(--v9-soft-hover)]'}`} key={value} onClick={() => setContentType(value)} type="button"><Icon className={contentType === value ? 'size-4 text-[var(--v9-status-accent-text)]' : 'size-4 text-[var(--v9-muted)]'} /><strong className="mt-6 block text-[14px]">{label}</strong><span className="mt-1.5 block text-[11px] leading-5 text-[var(--v9-copy)]">{description}</span></button>)}</div>
      </section>
      <section className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
        <label className="grid gap-1.5 text-sm text-white/75">归属团队<NativeSelect className="h-9 w-full rounded-lg border border-white/15 bg-black/25 px-3 text-sm text-white" containerClassName="w-full" name="teamId" required><option value="">请选择团队</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</NativeSelect></label>
        <div className="hidden md:block" />
        <label className="grid gap-1.5 text-sm text-white/75 md:col-span-2">标题<Input className="border-white/15 bg-black/25 text-white placeholder:text-white/35" name="title" placeholder="用清晰、可检索的标题说明内容" required /></label>
        <label className="grid gap-1.5 text-sm text-white/75 md:col-span-2">摘要<Textarea className="min-h-20 border-white/15 bg-black/25 text-white placeholder:text-white/35" name="summary" placeholder="说明它解决什么问题、适用于哪些场景" /></label>
        <div className="md:col-span-2"><ContentTypeFields contentType={contentType} /></div>
      </section>
      {state.error ? <p className="px-5 text-sm text-red-400 md:px-6">{state.error}</p> : null}
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-4 md:px-6"><p className="text-xs text-white/40">创建后将保存为草稿，不会公开发布。</p><Button className="bg-white text-black hover:bg-white/85" disabled={pending} type="submit">{pending ? '正在创建…' : '创建草稿'}</Button></div>
    </form>
  );
}
