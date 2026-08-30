'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

async function request(path: string, init: RequestInit) {
  return serverApiFetch(path, {
    ...init,
    headers: { ...(await authenticatedApiHeaders()), ...init.headers },
  });
}

export async function favoriteAction(formData: FormData) {
  const contentId = String(formData.get('contentId') ?? '');
  const active = formData.get('active') === 'true';
  if (!contentId) return;
  await request(`/api/contents/${contentId}/favorite`, { method: active ? 'DELETE' : 'POST' });
  revalidatePath('/workspace/favorites');
  revalidatePath('/workspace/recent');
  const returnTo = String(formData.get('returnTo') ?? '/workspace/favorites');
  redirect(returnTo);
}

export async function searchResultAction(formData: FormData) {
  const searchLogId = String(formData.get('searchLogId') ?? '');
  const contentId = String(formData.get('contentId') ?? '');
  const href = String(formData.get('href') ?? '/workspace/search');
  if (searchLogId && contentId)
    await request(`/api/search/${searchLogId}/click`, {
      method: 'PATCH',
      body: JSON.stringify({ contentId }),
      headers: { 'Content-Type': 'application/json' },
    });
  redirect(href);
}

export async function usageConfirmationAction(formData: FormData) {
  const contentId = String(formData.get('contentId') ?? '');
  const projectContentId = String(formData.get('projectContentId') ?? '');
  const note = String(formData.get('note') ?? '');
  if (!contentId || !projectContentId)
    redirect(`/workspace/usage?contentId=${encodeURIComponent(contentId)}&error=missing-project`);
  await request(`/api/contents/${contentId}/usage-confirmations`, {
    method: 'POST',
    body: JSON.stringify({
      projectContentId,
      note,
      sourcePage: `/workspace/usage?contentId=${contentId}`,
    }),
    headers: { 'Content-Type': 'application/json' },
  });
  redirect(`/workspace/usage?contentId=${encodeURIComponent(contentId)}&success=1`);
}

export async function createRelationAction(formData: FormData) {
  const contentId = String(formData.get('contentId') ?? '');
  const targetContentId = String(formData.get('targetContentId') ?? '');
  const relationType = String(formData.get('relationType') ?? 'RELATED');
  if (!contentId || !targetContentId)
    redirect(`/workspace/related?contentId=${encodeURIComponent(contentId)}&error=missing-target`);
  await request(`/api/contents/${contentId}/relations`, {
    method: 'POST',
    body: JSON.stringify({ targetContentId, relationType }),
    headers: { 'Content-Type': 'application/json' },
  });
  redirect(`/workspace/related?contentId=${encodeURIComponent(contentId)}&success=1`);
}

export async function removeRelationAction(formData: FormData) {
  const contentId = String(formData.get('contentId') ?? '');
  const relationId = String(formData.get('relationId') ?? '');
  if (contentId && relationId)
    await request(`/api/contents/${contentId}/relations/${relationId}`, { method: 'DELETE' });
  redirect(`/workspace/related?contentId=${encodeURIComponent(contentId)}`);
}

export async function recordContentShareAction(contentId: string, sourcePage: string) {
  if (!contentId) return;
  await request('/api/events', {
    method: 'POST',
    body: JSON.stringify({ eventType: 'content_share', contentId, sourcePage }),
    headers: { 'Content-Type': 'application/json' },
  });
}
