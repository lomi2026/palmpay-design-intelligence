'use client';
import { userError } from '@/lib/user-error';
import { useRef, useState } from 'react';
import { prepareDraftUpload, completeDraftUpload, type AttachmentActionState } from './attachment-actions';
import { invalidateWorkspaceCache } from '@/components/workspace/cache-events';
export function useDraftUpload() {
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  const lock = useRef(false);
  // Retain a completed binary transfer when only verification/binding needs retry.
  const transfer = useRef<{ checksum: string; id: string; cover: boolean; fileId: string } | null>(null);
  async function upload(data: FormData): Promise<AttachmentActionState> {
    if (lock.current) return {};
    const file = data.get('file'); const id = String(data.get('id') ?? ''); const cover = data.get('cover') === 'true';
    if (!(file instanceof File) || !file.size || file.size > (cover ? 5 : 100) * 1024 * 1024) { setError('请选择大小符合限制的文件。'); return {}; }
    window.dispatchEvent(new CustomEvent('workspace-upload', { detail: { id, pending: true } }));
    lock.current = true; setPending(true); setError(''); setProgress(null);
    try {
      setStage('准备上传…');
      const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
      const checksum = btoa(String.fromCharCode(...digest));
      let uploaded = transfer.current;
      if (!uploaded || uploaded.checksum !== checksum || uploaded.id !== id || uploaded.cover !== cover) {
        const intent = await prepareDraftUpload({ id, name: file.name, type: file.type, size: file.size, checksum, cover });
        setStage('上传文件'); setProgress(0);
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest(); xhr.open(intent.upload.method, intent.upload.url); xhr.timeout = 120000;
          for (const [key, value] of Object.entries(intent.upload.headers)) xhr.setRequestHeader(key, value);
          xhr.upload.onprogress = event => { if (event.lengthComputable) setProgress(Math.round(event.loaded / event.total * 100)); };
          xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(Error('文件传输失败，请重试。'));
          xhr.onerror = xhr.ontimeout = () => reject(Error('文件传输中断，请重试。')); xhr.send(file);
        });
        uploaded = { checksum, id, cover, fileId: intent.file.id }; transfer.current = uploaded;
      }
      setProgress(null); setStage('校验并保存文件…');
      const result = await completeDraftUpload(id, uploaded.fileId, cover);
      if (result.error) throw Error(result.error);
      transfer.current = null; setStage('已保存'); invalidateWorkspaceCache(['/workspace/contributions', '/workspace/submit']);
      return result;
    } catch (reason) { const message = userError(reason, '上传失败，请重试。'); setError(message); setStage(''); return { error: message }; }
    finally { lock.current = false; setPending(false); window.dispatchEvent(new CustomEvent('workspace-upload', { detail: { id, pending: false } })); }
  }
  return { upload, pending, progress, stage, error };
}
