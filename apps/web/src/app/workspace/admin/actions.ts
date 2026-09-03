'use server';

import { refresh, revalidatePath } from 'next/cache';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

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
  if (!categoryId || !status) return;
  await api(`/api/admin/categories/${categoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  refreshAdmin();
}

export async function updateTagStatusAction(formData: FormData) {
  const tagId = String(formData.get('tagId'));
  const status = String(formData.get('status'));
  if (!tagId || !status) return;
  await api(`/api/admin/tags/${tagId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  refreshAdmin();
}
export async function updateUserStatusAction(formData: FormData) {
  const organizationId = String(formData.get('organizationId'));
  const userId = String(formData.get('userId'));
  const replacementOwnerId = String(formData.get('replacementOwnerId') ?? '');
  await api(`/api/organizations/${organizationId}/users/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: String(formData.get('status')),
      ...(replacementOwnerId ? { replacementOwnerId } : {}),
    }),
  });
  refreshAdmin(true);
}
export async function updateTeamAction(formData: FormData) {
  const organizationId = String(formData.get('organizationId'));
  const teamId = String(formData.get('teamId'));
  const ownerId = String(formData.get('ownerId') ?? '');
  await api(`/api/organizations/${organizationId}/teams/${teamId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: String(formData.get('name') ?? ''),
      status: String(formData.get('status') ?? 'ACTIVE'),
      ...(ownerId ? { ownerId } : {}),
    }),
  });
  refreshAdmin(true);
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
