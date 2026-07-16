'use server';

import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

export type ReviewActionState = { error?: string; done?: string };

async function reviewRequest(path: string, method: 'PATCH' | 'POST', body: Record<string, string>): Promise<ReviewActionState> {
  try {
    await serverApiFetch(path, {
      method,
      headers: { ...(await authenticatedApiHeaders()), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { done: '已更新审核状态。' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '审核操作失败。' };
  }
}

export async function assignReviewAction(_: ReviewActionState, formData: FormData) {
  return reviewRequest(`/api/reviews/${String(formData.get('id') ?? '')}/assign`, 'PATCH', { reviewerId: String(formData.get('reviewerId') ?? '') });
}

export async function approveReviewAction(_: ReviewActionState, formData: FormData) {
  return reviewRequest(`/api/reviews/${String(formData.get('id') ?? '')}/approve`, 'POST', { comment: String(formData.get('comment') ?? '').trim() });
}

export async function requestChangesAction(_: ReviewActionState, formData: FormData) {
  return reviewRequest(`/api/reviews/${String(formData.get('id') ?? '')}/request-changes`, 'POST', { comment: String(formData.get('comment') ?? '').trim() });
}
