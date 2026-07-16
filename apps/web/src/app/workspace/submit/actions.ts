'use server';

import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

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
  if (contentType === 'DESIGN_ASSET') return { assetType: text('assetType'), platforms: lines(formData, 'platforms'), scenarios: lines(formData, 'scenarios'), problemStatement: text('problemStatement'), usageGuide: text('usageGuide') };
  if (contentType === 'AI_SKILL') return { applicableRoles: lines(formData, 'applicableRoles'), inputRequirements: text('inputRequirements'), outputSchema: text('outputSchema'), promptTemplate: text('promptTemplate'), executionSteps: text('executionSteps'), humanReviewRules: text('humanReviewRules') };
  if (contentType === 'AI_CASE') return { background: text('background'), originalProcess: text('originalProcess'), aiResponsibilities: text('aiResponsibilities'), humanResponsibilities: text('humanResponsibilities'), resultSummary: text('resultSummary'), limitations: text('limitations') };
  return { projectCode: text('projectCode'), domain: text('domain'), targetValue: text('targetValue'), problemStatement: text('problemStatement'), solutionHypothesis: text('solutionHypothesis'), expectedOutcome: text('expectedOutcome') };
}

export async function createDraftAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const draft = await serverApiFetch<{ id: string }>('/api/content-drafts', {
      method: 'POST',
      headers: { ...(await authenticatedApiHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentType: formData.get('contentType'),
        teamId: formData.get('teamId'),
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
        body: structuredBody(String(formData.get('contentType') ?? ''), formData),
      }),
    });
    return { savedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '自动保存失败。' };
  }
}
