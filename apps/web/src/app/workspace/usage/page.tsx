import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
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
      <Link href="/workspace" className="text-sm text-[var(--v9-muted)] transition hover:text-[var(--v9-text)]">
        ← 返回工作台
      </Link>
      <div className="mt-5"><WorkspacePageHero description="确认后会将这次复用与正式 AI 项目库中的真实项目关联；浏览和收藏不会被视为有效使用。" eyebrow="REAL PROJECT REUSE" metric={{ value: projects.total, label: '可关联项目' }} title="把‘看过’和‘真正用过’区分开。" /></div>
      {success ? (
        <p className="mt-5 rounded-lg border border-[var(--v9-status-success-line)] bg-[var(--v9-status-success-bg)] p-3 text-sm text-[var(--v9-status-success-text)]">
          已记录真实项目引用。
        </p>
      ) : null}
      {error ? (
        <p className="mt-5 rounded-lg border border-[var(--v9-status-danger-line)] bg-[var(--v9-status-danger-bg)] p-3 text-sm text-[var(--v9-status-danger-text)]">
          请选择一个正式项目后再提交。
        </p>
      ) : null}
      <form
        action={usageConfirmationAction}
        className="mt-5 space-y-5 rounded-2xl border border-[var(--v9-line)] bg-[var(--v9-panel)] p-5 md:p-6"
      >
        <input type="hidden" name="contentId" value={contentId} />
        <div>
          <label className="text-sm">关联项目</label>
          <NativeSelect
            name="projectContentId"
            required
            defaultValue=""
            className="h-9 w-full rounded-lg border border-[var(--v9-line-strong)] bg-[var(--v9-field)] px-3 text-sm text-[var(--v9-text)]"
            containerClassName="mt-2 w-full"
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
          </NativeSelect>
        </div>
        <div>
          <label className="text-sm">使用说明（可选）</label>
          <Input
            name="note"
            maxLength={1000}
            placeholder="记录应用场景、产出或后续验证计划"
            className="mt-2"
          />
        </div>
        <Button className="bg-white text-black hover:bg-white/85" type="submit">确认使用并关联项目</Button>
      </form>
    </main>
  );
}
