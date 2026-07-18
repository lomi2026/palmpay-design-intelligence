'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type ContentType = 'DESIGN_ASSET' | 'AI_SKILL' | 'AI_CASE' | 'AI_PROJECT';
type Body = Record<string, unknown>;

function value(body: Body | undefined, key: string) {
  const item = body?.[key];
  return typeof item === 'string' ? item : '';
}

function list(body: Body | undefined, key: string) {
  const item = body?.[key];
  return Array.isArray(item) ? item.filter((entry): entry is string => typeof entry === 'string').join('\n') : '';
}

function Field({ label, name, defaultValue = '', placeholder, multiline = false }: { label: string; name: string; defaultValue?: string; placeholder?: string; multiline?: boolean }) {
  return <label className="grid gap-2 rounded-[16px] border border-white/[.1] bg-black/15 p-3.5 text-sm font-medium text-white/75"><span>{label}</span>{multiline ? <Textarea className="min-h-24 border-white/[.12] bg-black/30 text-white placeholder:text-white/35" defaultValue={defaultValue} name={name} placeholder={placeholder} /> : <Input className="h-11 border-white/[.12] bg-black/30 text-white placeholder:text-white/35" defaultValue={defaultValue} name={name} placeholder={placeholder} />}</label>;
}

export function ContentTypeFields({ contentType, body }: { contentType: ContentType; body?: Body }) {
  const sectionClass = 'grid gap-4 border-t border-white/[.1] pt-6';
  const heading = (eyebrow: string, title: string) => <div><p className="text-[11px] font-bold tracking-[.14em] text-white/45">{eyebrow}</p><h2 className="mt-1 text-[25px] font-semibold tracking-[-.04em] text-white">{title}</h2></div>;
  if (contentType === 'DESIGN_ASSET') return <section className={sectionClass}>{heading('ASSET DEFINITION', '设计资产信息')}<div className="grid gap-4 md:grid-cols-2"><Field label="资产类型" name="assetType" defaultValue={value(body, 'assetType')} placeholder="例如：组件规范、研究模板" /><Field label="适用平台" name="platforms" defaultValue={list(body, 'platforms')} placeholder="每行一个，例如 iOS" multiline /></div><Field label="适用场景" name="scenarios" defaultValue={list(body, 'scenarios')} placeholder="每行一个适用场景" multiline /><Field label="解决的问题" name="problemStatement" defaultValue={value(body, 'problemStatement')} placeholder="说明该资产解决的设计问题" multiline /><Field label="使用指引" name="usageGuide" defaultValue={value(body, 'usageGuide')} placeholder="说明如何使用、前置条件和注意事项" multiline /></section>;
  if (contentType === 'AI_SKILL') return <section className={sectionClass}>{heading('REUSABLE METHOD', 'AI Skill 信息')}<Field label="适用角色" name="applicableRoles" defaultValue={list(body, 'applicableRoles')} placeholder="每行一个，例如：UX Designer" multiline /><Field label="输入要求" name="inputRequirements" defaultValue={value(body, 'inputRequirements')} placeholder="执行前需要准备什么信息" multiline /><Field label="输出结构" name="outputSchema" defaultValue={value(body, 'outputSchema')} placeholder="期望 AI 输出的结构" multiline /><Field label="Prompt" name="promptTemplate" defaultValue={value(body, 'promptTemplate') || value(body, 'prompt')} placeholder="可复用的完整 Prompt" multiline /><Field label="执行步骤" name="executionSteps" defaultValue={value(body, 'executionSteps') || list(body, 'steps')} placeholder="按步骤说明工作方法" multiline /><Field label="人工复核规则" name="humanReviewRules" defaultValue={value(body, 'humanReviewRules')} placeholder="哪些判断必须由设计师完成" multiline /></section>;
  if (contentType === 'AI_CASE') return <section className={sectionClass}>{heading('PRACTICE EVIDENCE', 'AI 案例信息')}<Field label="原始问题与背景" name="background" defaultValue={value(body, 'background')} placeholder="项目原始问题和约束" multiline /><Field label="原有流程" name="originalProcess" defaultValue={value(body, 'originalProcess')} placeholder="AI 介入前如何完成工作" multiline /><Field label="AI 参与内容" name="aiResponsibilities" defaultValue={value(body, 'aiResponsibilities')} placeholder="AI 做了哪些工作" multiline /><Field label="设计师保留的判断" name="humanResponsibilities" defaultValue={value(body, 'humanResponsibilities')} placeholder="哪些判断仍由设计师负责" multiline /><Field label="结果与验证" name="resultSummary" defaultValue={value(body, 'resultSummary')} placeholder="发生了什么变化，如何验证" multiline /><Field label="局限性" name="limitations" defaultValue={value(body, 'limitations')} placeholder="不可复用或需谨慎使用的条件" multiline /></section>;
  return <section className={sectionClass}>{heading('PROJECT BRIEF', 'AI 项目信息')}<div className="grid gap-4 md:grid-cols-2"><Field label="项目编号" name="projectCode" defaultValue={value(body, 'projectCode')} placeholder="例如：P27" /><Field label="领域" name="domain" defaultValue={value(body, 'domain')} placeholder="例如：增长、风险与治理" /></div><Field label="目标价值" name="targetValue" defaultValue={value(body, 'targetValue')} placeholder="希望提升什么能力或业务价值" multiline /><Field label="问题陈述" name="problemStatement" defaultValue={value(body, 'problemStatement')} placeholder="当前机会或痛点" multiline /><Field label="解决假设" name="solutionHypothesis" defaultValue={value(body, 'solutionHypothesis')} placeholder="AI 可以如何介入" multiline /><Field label="预期结果" name="expectedOutcome" defaultValue={value(body, 'expectedOutcome')} placeholder="如何判断项目值得继续" multiline /></section>;
}
