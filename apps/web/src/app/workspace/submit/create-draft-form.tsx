'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDraftAction, type ActionState } from './actions';
import { ContentTypeFields } from './content-type-fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Team = { id: string; name: string; code: string };

const initialState: ActionState = {};

export function CreateDraftForm({ teams }: { teams: Team[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createDraftAction, initialState);
  const [contentType, setContentType] = useState<'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT'>('DESIGN_ASSET');
  useEffect(() => {
    if (state.id) router.replace(`/workspace/submit/${state.id}`);
  }, [router, state.id]);

  return (
    <form action={action} className="mt-6 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
      <section className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-white/75">内容类型
          <select className="h-9 rounded-lg border border-white/15 bg-black/25 px-3 text-sm text-white" name="contentType" value={contentType} onChange={(event) => setContentType(event.target.value as typeof contentType)}>
            <option value="DESIGN_ASSET">设计资产</option><option value="AI_SKILL">AI Skill</option><option value="AI_CASE">AI 案例</option><option value="AI_PROJECT">AI 项目</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm text-white/75">归属团队
          <select className="h-9 rounded-lg border border-white/15 bg-black/25 px-3 text-sm text-white" name="teamId" required>
            <option value="">请选择团队</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
      </section>
      <label className="grid gap-1.5 text-sm text-white/75">标题<Input className="border-white/15 bg-black/25 text-white placeholder:text-white/35" name="title" placeholder="用清晰、可检索的标题说明内容" required /></label>
      <label className="grid gap-1.5 text-sm text-white/75">摘要<Textarea className="min-h-20 border-white/15 bg-black/25 text-white placeholder:text-white/35" name="summary" placeholder="说明它解决什么问题、适用于哪些场景" /></label>
      <ContentTypeFields contentType={contentType} />
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <div className="flex items-center justify-between border-t border-white/10 pt-4"><p className="text-xs text-white/40">创建后将保存为草稿，不会公开发布。</p><Button className="bg-white text-black hover:bg-white/85" disabled={pending} type="submit">{pending ? '正在创建…' : '创建草稿'}</Button></div>
    </form>
  );
}
