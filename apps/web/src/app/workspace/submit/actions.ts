'use server';

import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
import { redirect } from 'next/navigation';

export type ActionState = { error?: string; id?: string; savedAt?: string; submitted?: boolean };

function optionalText(value: FormDataEntryValue | null) {
  const result = typeof value === 'string' ? value.trim() : '';
  return result || undefined;
}

function lines(formData: FormData, key: string) {
  const value = optionalText(formData.get(key));
  return value ? value.split('\n').map((item) => item.trim()).filter(Boolean) : [];
}

function structuredBody(contentType: string, formData: FormData) {
  const text = (key: string) => optionalText(formData.get(key));
  if (contentType === 'DESIGN_ASSET') return { assetType: text('assetType'), platforms: lines(formData, 'platforms'), scenarios: lines(formData, 'scenarios'), unsuitableScenarios: lines(formData, 'unsuitableScenarios'), problemStatement: text('problemStatement'), usageGuide: text('usageGuide'), resourceLinks: lines(formData, 'resourceLinks'), relatedAssetIds: lines(formData, 'relatedAssetIds') };
  if (contentType === 'AI_SKILL') return { goal: text('goal'), scenarios: lines(formData, 'scenarios'), unsuitableScenarios: lines(formData, 'unsuitableScenarios'), applicableRoles: lines(formData, 'applicableRoles'), inputRequirements: text('inputRequirements'), outputSchema: text('outputSchema'), promptTemplate: text('promptTemplate'), executionSteps: text('executionSteps'), exampleInput: text('exampleInput'), exampleOutput: text('exampleOutput'), humanReviewRules: text('humanReviewRules'), limitations: text('limitations'), recommendedModels: lines(formData, 'recommendedModels'), dataSecurityLevel: text('dataSecurityLevel'), promptVersion: text('promptVersion') };
  if (contentType === 'AI_CASE') return { background: text('background'), originalProblem: text('originalProblem'), originalProcess: text('originalProcess'), aiIntervention: text('aiIntervention'), aiResponsibilities: text('aiResponsibilities'), humanResponsibilities: text('humanResponsibilities'), resultSummary: text('resultSummary'), beforeAfterComparison: text('beforeAfterComparison'), sampleSize: text('sampleSize'), validationMethod: text('validationMethod'), dataResult: text('dataResult'), limitations: text('limitations'), reusableConclusion: text('reusableConclusion'), relatedSkillContentId: text('relatedSkillContentId'), relatedProjectContentId: text('relatedProjectContentId') };
  return { projectCode: text('projectCode'), domain: text('domain'), targetValue: text('targetValue'), projectStage: text('projectStage'), priority: text('priority'), problemStatement: text('problemStatement'), solutionHypothesis: text('solutionHypothesis'), expectedOutcome: text('expectedOutcome'), riskLevel: text('riskLevel'), evaluationResult: text('evaluationResult'), relatedSkillIds: lines(formData, 'relatedSkillIds'), relatedCaseIds: lines(formData, 'relatedCaseIds'), convertedProjectRef: text('convertedProjectRef') };
}

export async function createDraftAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const draft = await serverApiFetch<{ id: string }>('/api/content-drafts', {
      method: 'POST',
      headers: { ...(await authenticatedApiHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: formData.get('contentType'),
        teamId: formData.get('teamId'),
        categoryId: optionalText(formData.get('categoryId')),
        tagIds: formData.getAll('tagIds'),
        title: formData.get('title'),
        summary: optionalText(formData.get('summary')),
        body: structuredBody(String(formData.get('contentType') ?? ''), formData),
      }),
    });
    return { id: draft.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '无法创建草稿。' };
  }
}

export async function createPublishedEditDraftAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get('id') ?? '');
  try {
    const draft = await serverApiFetch<{ id: string }>(`/api/content-drafts/${id}/from-published`, {
      method: 'POST',
      headers: await authenticatedApiHeaders(),
    });
    return { id: draft.id };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '无法创建编辑草稿。' };
  }
}

export async function submitReviewAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  try {
    await serverApiFetch(`/api/reviews/content/${id}/submit`, {
      method: "POST",
      headers: { ...(await authenticatedApiHeaders()), "Content-Type": "application/json" },
      body: JSON.stringify({ message: optionalText(formData.get("message")) }),
    });
    return { submitted: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "无法提交审核。" };
  }
}

export async function autosaveDraftAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get('id') ?? '');
  try {
    await serverApiFetch(`/api/content-drafts/${id}`, {
      method: 'PATCH',
      headers: { ...(await authenticatedApiHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.get('title'),
        summary: optionalText(formData.get('summary')),
        changeSummary: optionalText(formData.get('changeSummary')),
        categoryId: optionalText(formData.get('categoryId')) ?? null,
        tagIds: formData.getAll('tagIds'),
        body: structuredBody(String(formData.get('contentType') ?? ''), formData),
      }),
    });
    return { savedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '自动保存失败。' };
  }
}

export async function saveAndPreviewDraftAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await serverApiFetch(`/api/content-drafts/${id}`, {
    method: 'PATCH',
    headers: { ...(await authenticatedApiHeaders()), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: formData.get('title'),
      summary: optionalText(formData.get('summary')),
      changeSummary: optionalText(formData.get('changeSummary')),
      categoryId: optionalText(formData.get('categoryId')) ?? null,
      tagIds: formData.getAll('tagIds'),
      body: structuredBody(String(formData.get('contentType') ?? ''), formData),
    }),
  });
  redirect(`/workspace/submit/${encodeURIComponent(id)}/preview`);
}

export async function contentLifecycleAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get('id') ?? '');
  const operation = String(formData.get('operation') ?? '');
  if (!new Set(['unpublish', 'archive']).has(operation)) return { error: '无效的内容生命周期操作。' };
  try {
    await serverApiFetch(`/api/content-drafts/${id}/${operation}`, {
      method: 'POST',
      headers: await authenticatedApiHeaders(),
    });
    return { savedAt: operation === 'unpublish' ? '内容已下架。' : '内容已归档。' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '内容状态更新失败。' };
  }
}
