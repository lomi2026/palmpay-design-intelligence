'use server';

import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

export type ActionState = { error?: string; id?: string; savedAt?: string; submitted?: boolean };

function optionalText(value: FormDataEntryValue | null) {
  const result = typeof value === 'string' ? value.trim() : '';
  return result || undefined;
}

function parseBody(value: FormDataEntryValue | null) {
  const source = typeof value === 'string' && value.trim() ? value : '{}';
  const parsed: unknown = JSON.parse(source);
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') throw new Error('内容结构需为 JSON 对象。');
  return parsed;
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
        body: parseBody(formData.get('body')),
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
        body: parseBody(formData.get('body')),
      }),
    });
    return { savedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '自动保存失败。' };
  }
}
