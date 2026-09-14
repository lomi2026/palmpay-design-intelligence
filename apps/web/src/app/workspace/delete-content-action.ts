'use server';

import { userError } from '@/lib/user-error';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';
export type DeleteContentState = { deleted?: boolean; error?: string };
export async function deleteContentAction(_: DeleteContentState, formData: FormData): Promise<DeleteContentState> {
  const id = String(formData.get('contentId') ?? '');
  if (!id) return { error: '缺少内容编号。' };
  try {
    await serverApiFetch(`/api/content-drafts/${encodeURIComponent(id)}`, {
      method: 'DELETE', headers: await authenticatedApiHeaders(), signal: AbortSignal.timeout(15000),
    });

  } catch (error) {
    return { error: userError(error, '删除未完成，请刷新后重试。') };
  }
  revalidatePath('/workspace', 'layout');
  if (formData.get('returnTo') === '/workspace/contributions') redirect('/workspace/contributions');
  return { deleted: true };
}
