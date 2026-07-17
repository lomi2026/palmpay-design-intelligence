'use server';

import { revalidatePath } from 'next/cache';
import { serverApiFetch } from '@/lib/api';
import { authenticatedApiHeaders } from '@/lib/auth';

async function request(path: string, init: RequestInit) {
  return serverApiFetch(path, {
    ...init,
    headers: { ...(await authenticatedApiHeaders()), ...init.headers },
  });
}

function refreshNotifications() {
  revalidatePath('/workspace', 'layout');
  revalidatePath('/workspace/notifications');
}

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = String(formData.get('notificationId') ?? '');
  if (!notificationId) return;
  await request(`/api/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
  });
  refreshNotifications();
}

export async function markAllNotificationsReadAction() {
  await request('/api/notifications/read-all', { method: 'PATCH' });
  refreshNotifications();
}
