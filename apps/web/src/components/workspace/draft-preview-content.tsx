import { Paperclip } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { contentTypeLabel } from '@/lib/content-types';

type Draft = {
  contentType: 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT';
  title: string;
  summary: string | null;
  draftVersion: { body: unknown; versionNumber: number; versionStatus: string } | null;
  attachments: Array<{ id: string; file: { originalName: string; mimeType: string; sizeBytes: string } }>;
};

type Body = Record<string, unknown>;
type DetailRow = [string, string | string[]];
const text = (body: Body, key: string) => typeof body[key] === 'string' && body[key].trim() ? body[key] as string : '待补充';
const lines = (body: Body, key: string) => Array.isArray(body[key]) ? (body[key] as unknown[]).filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
function Detail({ label, value }: { label: string; value: string | string[] }) {
  const values = Array.isArray(value) ? value : [value];
  return <div className="border-t border-[var(--v9-line)] py-4 first:border-t-0"><p className="text-[10px] font-bold tracking-[.13em] text-[var(--v9-subtle)]">{label}</p><div className="mt-2 space-y-1 text-sm leading-6 text-[var(--v9-copy)]">{values.map((item, index) => <p className="whitespace-pre-wrap" key={`${item}-${index}`}>{item}</p>)}</div></div>;
}

export function DraftPreviewContent({ draft }: { draft: Draft }) {
  const body = draft.draftVersion?.body && typeof draft.draftVersion.body === 'object' && !Array.isArray(draft.draftVersion.body) ? draft.draftVersion.body as Body : {};
  const details: DetailRow[] = draft.contentType === 'DESIGN_ASSET'
    ? [['资产类型', text(body, 'assetType')], ['适用平台', lines(body, 'platforms')], ['适用场景', lines(body, 'scenarios')], ['不适用场景', lines(body, 'unsuitableScenarios')], ['解决的问题', text(body, 'problemStatement')], ['使用指引', text(body, 'usageGuide')], ['资源链接', lines(body, 'resourceLinks')]]
    : draft.contentType === 'AI_SKILL'
      ? [['Skill 目标', text(body, 'goal')], ['适用场景', lines(body, 'scenarios')], ['不适用场景', lines(body, 'unsuitableScenarios')], ['适用角色', lines(body, 'applicableRoles')], ['输入要求', text(body, 'inputRequirements')], ['输出结构', text(body, 'outputSchema')], ['核心 Prompt', text(body, 'promptTemplate')], ['执行步骤', text(body, 'executionSteps')], ['示例输入', text(body, 'exampleInput')], ['示例输出', text(body, 'exampleOutput')], ['人工复核规则', text(body, 'humanReviewRules')], ['已知限制', text(body, 'limitations')]]
      : draft.contentType === 'AI_CASE'
        ? [['案例背景', text(body, 'background')], ['原始问题', text(body, 'originalProblem')], ['原有流程', text(body, 'originalProcess')], ['AI 介入节点', text(body, 'aiIntervention')], ['AI 完成内容', text(body, 'aiResponsibilities')], ['设计师判断内容', text(body, 'humanResponsibilities')], ['最终结果', text(body, 'resultSummary')], ['前后对比', text(body, 'beforeAfterComparison')], ['样本范围', text(body, 'sampleSize')], ['验证方式', text(body, 'validationMethod')], ['数据结果', text(body, 'dataResult')], ['可复用结论', text(body, 'reusableConclusion')]]
        : [['项目编号', text(body, 'projectCode')], ['所属领域', text(body, 'domain')], ['目标价值', text(body, 'targetValue')], ['当前阶段', text(body, 'projectStage')], ['优先级', text(body, 'priority')], ['问题陈述', text(body, 'problemStatement')], ['解决方案假设', text(body, 'solutionHypothesis')], ['预期效果', text(body, 'expectedOutcome')], ['风险', text(body, 'riskLevel')], ['评估结论', text(body, 'evaluationResult')]];
  return <main className="mx-auto max-w-[1232px] px-5 py-8 md:px-8 md:py-10"><section className="overflow-hidden rounded-[28px] border border-[var(--v9-status-warning-line)] bg-[var(--v9-panel)]"><div className="border-b border-[var(--v9-status-warning-line)] bg-[var(--v9-status-warning-bg)] px-6 py-3 text-[11px] font-bold tracking-[.14em] text-[var(--v9-status-warning-text)]">草稿预览 · 仅草稿作者与获授权编辑者可见 · 不会出现在目录或搜索结果中</div><div className="p-7 md:p-12"><p className="text-[11px] font-bold tracking-[.16em] text-[var(--v9-subtle)]">{contentTypeLabel(draft.contentType)} · 草稿版本 v{draft.draftVersion?.versionNumber ?? 1}</p><h1 className="mt-3 max-w-[850px] break-words text-[42px] font-semibold leading-[1.02] tracking-[-.055em] text-[var(--v9-text)] md:text-[60px]">{draft.title}</h1><p className="mt-5 max-w-[800px] whitespace-pre-wrap text-[16px] leading-8 text-[var(--v9-muted)]">{draft.summary ?? '暂无摘要'}</p></div></section><section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]"><Card className="border-[var(--v9-line)] bg-[var(--v9-panel)] py-0 shadow-none"><CardContent className="p-7 md:p-9"><h2 className="text-[30px] font-semibold tracking-[-.045em] text-[var(--v9-text)]">内容详情</h2><div className="mt-6">{details.map(([field, value]) => <Detail key={field} label={field} value={value as string | string[]} />)}</div></CardContent></Card><aside className="space-y-4"><Card className="border-[var(--v9-line)] bg-[var(--v9-panel)] py-0 shadow-none"><CardContent className="p-6"><h2 className="text-[24px] font-semibold tracking-[-.035em] text-[var(--v9-text)]">提交前检查</h2><p className="mt-3 text-sm leading-6 text-[var(--v9-muted)]">这是当前已保存的草稿版本。提交审核时，服务端仍会执行完整度校验。</p></CardContent></Card><Card className="border-[var(--v9-line)] bg-[var(--v9-panel)] py-0 shadow-none"><CardContent className="p-6"><h2 className="flex items-center gap-2 text-[24px] font-semibold tracking-[-.035em] text-[var(--v9-text)]"><Paperclip className="size-4" />草稿附件</h2>{draft.attachments.length ? <ul className="mt-4 grid gap-2">{draft.attachments.map((attachment) => <li className="rounded-xl border border-[var(--v9-line)] bg-[var(--v9-panel-2)] px-3 py-2 text-sm text-[var(--v9-copy)]" key={attachment.id}>{attachment.file.originalName}</li>)}</ul> : <p className="mt-3 text-sm text-[var(--v9-subtle)]">暂无附件</p>}</CardContent></Card></aside></section></main>;
}
