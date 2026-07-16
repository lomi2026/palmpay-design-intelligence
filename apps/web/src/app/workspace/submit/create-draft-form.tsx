'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createDraftAction, type ActionState } from './actions';

type Team = { id: string; name: string; code: string };

const initialState: ActionState = {};

export function CreateDraftForm({ teams }: { teams: Team[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createDraftAction, initialState);
  useEffect(() => {
    if (state.id) router.replace(`/workspace/submit/${state.id}`);
  }, [router, state.id]);

  return (
    <form action={action} className="mt-6 grid gap-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 md:p-6">
      <section className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm text-neutral-300">内容类型
          <select className="h-9 rounded-md border border-[var(--border)] bg-black px-3 text-sm" defaultValue="DESIGN_ASSET" name="contentType">
            <option value="DESIGN_ASSET">设计资产</option><option value="AI_SKILL">AI Skill</option><option value="AI_CASE">AI 案例</option><option value="AI_PROJECT">AI 项目</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm text-neutral-300">归属团队
          <select className="h-9 rounded-md border border-[var(--border)] bg-black px-3 text-sm" name="teamId" required>
            <option value="">请选择团队</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
      </section>
      <label className="grid gap-1.5 text-sm text-neutral-300">标题<input className="h-9 rounded-md border border-[var(--border)] bg-black px-3 text-sm" name="title" placeholder="用清晰、可检索的标题说明内容" required /></label>
      <label className="grid gap-1.5 text-sm text-neutral-300">摘要<textarea className="min-h-20 rounded-md border border-[var(--border)] bg-black px-3 py-2 text-sm" name="summary" placeholder="说明它解决什么问题、适用于哪些场景" /></label>
      <label className="grid gap-1.5 text-sm text-neutral-300">结构化内容 <span className="text-xs text-neutral-500">暂以 JSON 保存，后续会按内容类型提供专用字段。</span><textarea className="min-h-40 rounded-md border border-[var(--border)] bg-black px-3 py-2 font-mono text-xs leading-5" defaultValue={'{}'} name="body" spellCheck={false} /></label>
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4"><p className="text-xs text-neutral-500">创建后将保存为草稿，不会公开发布。</p><button className="h-9 rounded-md bg-white px-4 text-sm font-medium text-black disabled:opacity-50" disabled={pending} type="submit">{pending ? '正在创建…' : '创建草稿'}</button></div>
    </form>
  );
}
