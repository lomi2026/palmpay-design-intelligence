'use server';

import { createHash } from 'node:crypto';
import { authenticatedApiHeaders } from '@/lib/auth';
import { serverApiFetch } from '@/lib/api';

export type AttachmentActionState = { error?: string; savedAt?: string };

export async function uploadDraftAttachmentAction(_: AttachmentActionState, formData: FormData): Promise<AttachmentActionState> {
  const id = String(formData.get('id') ?? '');
  const file = formData.get('file');
  if (!(file instanceof File) || !file.size) return { error: '请选择一个非空文件。' };
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const headers = await authenticatedApiHeaders();
    const intent = await serverApiFetch<{ file: { id: string }; upload: { url: string; method: string; headers: Record<string, string> } }>('/api/files/upload-intents', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        checksumSha256: createHash('sha256').update(bytes).digest('base64'),
      }),
    });
    const uploaded = await fetch(intent.upload.url, { method: intent.upload.method, headers: intent.upload.headers, body: bytes });
    if (!uploaded.ok) throw new Error('文件上传未完成。');
    await serverApiFetch(`/api/files/${intent.file.id}/complete`, { method: 'POST', headers });
    const draft = await serverApiFetch<{ attachments: Array<{ fileId: string }> }>(`/api/content-drafts/${id}`, { headers });
    await serverApiFetch(`/api/content-drafts/${id}`, {
      method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ attachmentFileIds: [...draft.attachments.map((attachment) => attachment.fileId), intent.file.id] }),
    });
    return { savedAt: '附件已绑定' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '附件上传失败。' };
  }
}

export async function removeDraftAttachmentAction(_: AttachmentActionState, formData: FormData): Promise<AttachmentActionState> {
  const id = String(formData.get('id') ?? '');
  const fileId = String(formData.get('fileId') ?? '');
  try {
    const headers = await authenticatedApiHeaders();
    const draft = await serverApiFetch<{ attachments: Array<{ fileId: string }> }>(`/api/content-drafts/${id}`, { headers });
    await serverApiFetch(`/api/content-drafts/${id}`, {
      method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ attachmentFileIds: draft.attachments.map((attachment) => attachment.fileId).filter((value) => value !== fileId) }),
    });
    return { savedAt: '附件已移除' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : '无法移除附件。' };
  }
}
