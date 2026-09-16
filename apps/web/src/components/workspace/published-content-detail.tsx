import { DeleteContentButton } from './delete-content-button';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, MoreHorizontal } from 'lucide-react';
import { authenticatedApiHeaders, loadCurrentUser } from '@/lib/auth';
import { ApiError, serverApiFetch } from '@/lib/api';
import {
  contentTypeLabel,
  type ContentCard,
  type ContentType,
  type PublishedAttachment,
} from '@/lib/content-types';
import { contentBody, readableValue } from '@/lib/content-editor-schema';
import { ContentSections } from './content-sections';
import { FavoriteControl, ContentEngagementLinks } from './engagement-controls';
import { PublishedEdit } from '@/app/workspace/published-edit';
import { ContentLifecycle } from '@/app/workspace/content-lifecycle';
import { PublishedAttachments } from './published-attachments';
import { UsageSummary } from './usage-summary';
import { AssetImage } from './asset-image';
import { Button } from '@/components/ui/button';

type Detail = ContentCard & {
  attachments: PublishedAttachment[];
  currentVersion: { versionNumber?: number; versionLabel: string | null; body: unknown } | null;
};
export async function PublishedContentDetail({
  slug,
  type,
  route,
}: {
  slug: string;
  type: ContentType;
  route: string;
}) {
  const headers = await authenticatedApiHeaders();
  let content: Detail;
  try {
    content = await serverApiFetch<Detail>(`/api/contents/${encodeURIComponent(slug)}`, {
      headers,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  if (content.contentType !== type) notFound();
  const [user, usage] = await Promise.all([
    loadCurrentUser(),
    serverApiFetch<{ usageCount: number; projectReferences: number; favoriteCount: number }>(
      `/api/contents/${content.id}/usage-summary`,
      { headers },
    ),
  ]);
  const canEdit = Boolean(
    user?.permissions.includes('content.edit_all') ||
    (user?.id === content.owner.id && user.permissions.includes('content.edit_own')),
  );
  const canArchive = user?.permissions.includes('content.archive') ?? false;
  const canUnpublish = user?.permissions.includes('content.unpublish') ?? false;
  const body = contentBody(content as unknown as Record<string, unknown>);
  const website = readableValue(body.websiteUrl);
  let safeWebsite = false;
  try {
    const u = new URL(website);
    safeWebsite = ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password;
  } catch {}
  return (
    <main className="detail-page">
      <Link className="back-link" href={`/workspace/${route}`}>
        <ArrowLeft size={15} />
        返回{contentTypeLabel(type)}
      </Link>
      <header className="detail-hero">
        <div className="detail-intro">
          <div className="detail-identity">
            <span className="content-kind">{contentTypeLabel(type)}</span>
            {content.category && content.category.name !== contentTypeLabel(type) ? (
              <span>{content.category.name}</span>
            ) : null}
          </div>
          <h1>{content.title}</h1>
          {content.summary ? <p className="detail-summary">{content.summary}</p> : null}
          <div className="detail-toolbar">
            {type === 'AI_TOOL' && safeWebsite ? (
              <Button asChild>
                <a href={website} target="_blank" rel="noopener noreferrer">
                  打开工具
                  <ExternalLink size={15} />
                </a>
              </Button>
            ) : null}
            <FavoriteControl size="md" contentId={content.id} returnTo={`/workspace/${route}/${slug}`} />
            <ContentEngagementLinks contentId={content.id} />
            {canEdit ? <PublishedEdit contentId={content.id} /> : null}
            {canEdit || canArchive || canUnpublish ? (
              <details className="management-menu">
                <summary aria-label="更多管理操作">
                  <MoreHorizontal size={18} />
                </summary>
                <div>
                  <p>内容管理</p>
                  <ContentLifecycle
                    contentId={content.id}
                    canArchive={canArchive}
                    canUnpublish={canUnpublish}
                  />
                  {canEdit ? <DeleteContentButton contentId={content.id} title={content.title} redirectTo={`/workspace/${route}`} className="mt-3" /> : null}
                </div>
              </details>
            ) : null}
          </div>
        </div>
        {content.coverFile && ['DESIGN_ASSET', 'AI_TOOL'].includes(type) ? (
          <div className="detail-cover">
            <AssetImage fileId={content.coverFile.id} title={content.title} />
          </div>
        ) : null}
        <dl className="detail-metadata">
          {[
            ['负责人', content.owner.name],
            ['维护团队', content.team.name],
            [
              '内容版本',
              content.currentVersion?.versionLabel ??
                `v${content.currentVersion?.versionNumber ?? 1}`,
            ],
            ['最后更新', new Date(content.updatedAt).toLocaleDateString('zh-CN')],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <UsageSummary summary={usage} />
      </header>
      <ContentSections type={type} body={body} />
      <div className="detail-attachments">
        <PublishedAttachments attachments={content.attachments ?? []} />
      </div>
    </main>
  );
}
