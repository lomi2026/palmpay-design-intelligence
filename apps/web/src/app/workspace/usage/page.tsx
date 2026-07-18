import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import type { ContentListResponse } from '@/lib/content-types';
import { usageConfirmationAction } from '../engagement-actions';
import { WorkspacePageHero } from '@/components/workspace/workspace-page-hero';

export default async function UsagePage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; success?: string; error?: string }>;
}) {
  const { contentId = '', success, error } = await searchParams;
  const projects = await serverApiFetch<ContentListResponse>(
    '/api/contents?type=AI_PROJECT&pageSize=100',
    { headers: await authenticatedApiHeaders() },
  );
  return (
    <main className="mx-auto max-w-[960px] px-5 py-8 md:px-8 md:py-10">
      <Link href="/workspace" className="text-sm text-white/50 transition hover:text-white">
        ← 返回工作台
      </Link>
      <div className="mt-5"><WorkspacePageHero description="确认后会将这次复用与正式 AI 项目库中的真实项目关联；浏览和收藏不会被视为有效使用。" eyebrow="REAL PROJECT REUSE" metric={{ value: projects.total, label: '可关联项目' }} title="把‘看过’和‘真正用过’区分开。" /></div>
      {success ? (
        <p className="mt-5 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
          已记录真实项目引用。
        </p>
      ) : null}
      {error ? (
        <p className="mt-5 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100">
          请选择一个正式项目后再提交。
        </p>
      ) : null}
      <form
        action={usageConfirmationAction}
        className="mt-5 space-y-5 rounded-2xl border border-white/[.11] bg-[#111112] p-5 md:p-6"
      >
        <input type="hidden" name="contentId" value={contentId} />
        <div>
          <label className="text-sm">关联项目</label>
          <select
            name="projectContentId"
            required
            defaultValue=""
            className="mt-2 h-9 w-full rounded-lg border border-white/15 bg-white/[.04] px-3 text-sm text-white"
          >
            <option value="" disabled>
              选择 AI 项目库中的正式项目
            </option>
            {projects.items.map((project) => (
              <option value={project.id} key={project.id}>
                {project.projectDetail?.projectCode
                  ? `${project.projectDetail.projectCode} · `
                  : ''}
                {project.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm">使用说明（可选）</label>
          <Input
            name="note"
            maxLength={1000}
            placeholder="记录应用场景、产出或后续验证计划"
            className="mt-2 border-white/15 bg-white/[.04] text-white"
          />
        </div>
        <Button className="bg-white text-black hover:bg-white/85" type="submit">确认使用并关联项目</Button>
      </form>
    </main>
  );
}
