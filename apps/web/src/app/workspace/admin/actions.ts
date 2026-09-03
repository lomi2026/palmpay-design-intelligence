'use server';

import { refresh, revalidatePath } from 'next/cache';
import { authenticatedApiHeaders } from '@/lib/auth';
import { ApiError, serverApiFetch } from '@/lib/api';
import type { AdminSaveResult } from './admin-save-result';

async function api(path: string, init: RequestInit) {
  return serverApiFetch(path, {
    ...init,
    headers: { ...(await authenticatedApiHeaders()), ...init.headers },
  });
}

function refreshAdmin(refreshShell = false) {
  // Keep the user on the current tab and return fresh server-component data in
  // the action response. Redirecting back to the same prefetched URL can restore
  // the browser's stale route payload even though the API mutation succeeded.
  revalidatePath('/workspace/admin');
  if (refreshShell) revalidatePath('/workspace', 'layout');
  refresh();
}

async function saveEdit(path: string, body: Record<string, unknown>): Promise<AdminSaveResult> {
  try {
    await api(path, {
      method: 'PATCH',
      signal: AbortSignal.timeout(15_000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    // Return the write acknowledgement immediately. AdminEditForm refreshes the
    // view separately, outside the save action's pending lifecycle.
    return { status: 'success', message: '保存成功' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof ApiError
        ? `保存失败：${error.message}`
        : '保存结果暂未确认，可能是网络较慢。请刷新核对状态后再重试。',
    };
  }
}

export async function createCategoryAction(formData: FormData) {
  await api('/api/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: String(formData.get('name') ?? ''),
      code: String(formData.get('code') ?? ''),
      contentTypes: [String(formData.get('contentType') ?? 'DESIGN_ASSET')],
    }),
  });
  refreshAdmin();
}
export async function createTagAction(formData: FormData) {
  await api('/api/admin/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: String(formData.get('name') ?? '') }),
  });
  refreshAdmin();
}

export async function updateCategoryStatusAction(formData: FormData) {
  const categoryId = String(formData.get('categoryId'));
  const status = String(formData.get('status'));
  return saveEdit(`/api/admin/categories/${categoryId}`, { status });
}

export async function updateTagStatusAction(formData: FormData) {
  const tagId = String(formData.get('tagId'));
  const status = String(formData.get('status'));
  return saveEdit(`/api/admin/tags/${tagId}`, { status });
}
export async function updateUserStatusAction(formData: FormData) {
  const organizationId = String(formData.get('organizationId'));
  const userId = String(formData.get('userId'));
  const replacementOwnerId = String(formData.get('replacementOwnerId') ?? '');
  return saveEdit(`/api/organizations/${organizationId}/users/${userId}/status`, {
    status: String(formData.get('status')),
    ...(replacementOwnerId ? { replacementOwnerId } : {}),
  });
}
export async function updateTeamAction(formData: FormData) {
  const organizationId = String(formData.get('organizationId'));
  const teamId = String(formData.get('teamId'));
  const ownerId = String(formData.get('ownerId') ?? '');
  return saveEdit(`/api/organizations/${organizationId}/teams/${teamId}`, {
    name: String(formData.get('name') ?? ''),
    status: String(formData.get('status') ?? 'ACTIVE'),
    ...(ownerId ? { ownerId } : {}),
  });
}
export async function assignRoleAction(formData: FormData) {
  const organizationId = String(formData.get('organizationId'));
  const userId = String(formData.get('userId'));
  await api(`/api/organizations/${organizationId}/users/${userId}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roleId: String(formData.get('roleId')),
      scopeType: 'ORGANIZATION',
      scopeId: organizationId,
    }),
  });
  refreshAdmin(true);
}

export async function removeUserRoleAction(formData: FormData) {
  const organizationId = String(formData.get('organizationId'));
  const userId = String(formData.get('userId'));
  const userRoleId = String(formData.get('userRoleId'));
  if (!organizationId || !userId || !userRoleId) return;
  await api(`/api/organizations/${organizationId}/users/${userId}/roles/${userRoleId}`, {
    method: 'DELETE',
  });
  refreshAdmin(true);
}
