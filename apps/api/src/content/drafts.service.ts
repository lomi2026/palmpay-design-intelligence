import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma/client';
import {
  AttachmentEntityType,
  AttachmentUsageType,
  ContentStatus,
  UploadStatus,
} from '../generated/prisma/enums';
import type { AutosaveDraftDto, CreateDraftDto } from './drafts.dto';
import { AuditService } from '../governance/audit.service';
import { EngagementService } from '../engagement/engagement.service';

@Injectable()
export class DraftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly engagement: EngagementService,
  ) {}

  async create(user: AuthenticatedUser, input: CreateDraftDto) {
    const teamId = input.teamId ?? user.primaryTeamId;
    if (!teamId) throw new BadRequestException('Select a team before creating content.');
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId: user.organizationId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!team)
      throw new BadRequestException('The selected team is not available in your organization.');
    const draft = await this.prisma.$transaction(async (tx) => {
      const content = await tx.content.create({
        data: {
          organizationId: user.organizationId,
          contentType: input.contentType,
          title: input.title,
          summary: input.summary,
          slug: `draft-${randomUUID()}`,
          categoryId: input.categoryId,
          ownerId: user.id,
          teamId,
          status: ContentStatus.DRAFT,
          visibility: input.visibility,
          createdById: user.id,
        },
      });
      const version = await tx.contentVersion.create({
        data: {
          contentId: content.id,
          versionNumber: 1,
          versionLabel: input.versionLabel,
          versionStatus: ContentStatus.DRAFT,
          title: input.title,
          summary: input.summary,
          body: input.body as Prisma.InputJsonValue,
          createdById: user.id,
        },
      });
      return tx.content.update({
        where: { id: content.id },
        data: { draftVersionId: version.id },
        include: { draftVersion: true },
      });
    });
    await this.audit.write({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'content.create',
      entityType: 'content',
      entityId: draft.id,
      afterData: draft,
    });
    await this.engagement.recordEvent(user, 'content_create', draft.id);
    return this.serialize(draft);
  }

  async createFromPublished(user: AuthenticatedUser, contentId: string) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, organizationId: user.organizationId, deletedAt: null },
      include: { currentVersion: true, draftVersion: true },
    });
    if (!content) throw new NotFoundException('Content was not found.');
    if (content.ownerId !== user.id && !user.permissions.includes('content.edit_all')) {
      throw new ForbiddenException('You cannot edit this content.');
    }
    if (content.status !== ContentStatus.PUBLISHED || !content.currentVersion) {
      throw new ConflictException(
        'Only published content with a current version can create an edit draft.',
      );
    }
    const publishedVersion = content.currentVersion;
    const publishedVersionId = content.currentVersionId;
    if (!publishedVersionId)
      throw new ConflictException('Published content is missing its current version reference.');
    if (content.draftVersion) {
      if (
        new Set<ContentStatus>([ContentStatus.DRAFT, ContentStatus.CHANGES_REQUESTED]).has(
          content.draftVersion.versionStatus,
        )
      ) {
        return this.serialize(content);
      }
      throw new ConflictException(
        'This content already has a draft version in review or awaiting publication.',
      );
    }

    const draft = await this.prisma.$transaction(async (tx) => {
      const latestVersion = await tx.contentVersion.findFirst({
        where: { contentId: content.id },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true },
      });
      const version = await tx.contentVersion.create({
        data: {
          contentId: content.id,
          versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
          versionStatus: ContentStatus.DRAFT,
          baseVersionId: publishedVersionId,
          title: publishedVersion.title,
          summary: publishedVersion.summary,
          body:
            publishedVersion.body === null
              ? Prisma.JsonNull
              : (publishedVersion.body as Prisma.InputJsonValue),
          createdById: user.id,
        },
      });
      const attachments = await tx.attachmentRelation.findMany({
        where: { entityType: AttachmentEntityType.VERSION, entityId: publishedVersionId },
        select: { fileId: true, usageType: true, sortOrder: true },
      });
      if (attachments.length) {
        await tx.attachmentRelation.createMany({
          data: attachments.map((attachment) => ({
            ...attachment,
            entityType: AttachmentEntityType.VERSION,
            entityId: version.id,
          })),
        });
      }
      return tx.content.update({
        where: { id: content.id },
        data: { draftVersionId: version.id },
        include: { draftVersion: true },
      });
    });
    return this.serialize(draft);
  }

  async publishApproved(user: AuthenticatedUser, contentId: string) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, organizationId: user.organizationId, deletedAt: null },
      include: { draftVersion: true },
    });
    if (!content) throw new NotFoundException('Content was not found.');
    if (!content.draftVersion)
      throw new ConflictException('This content does not have a version awaiting publication.');
    if (content.draftVersion.versionStatus !== ContentStatus.APPROVED) {
      throw new ConflictException('Only an approved draft version can be published.');
    }
    if (
      !new Set<ContentStatus>([ContentStatus.APPROVED, ContentStatus.PUBLISHED]).has(content.status)
    ) {
      throw new ConflictException('This content cannot be published in its current state.');
    }

    const now = new Date();
    const published = await this.prisma.$transaction(async (tx) => {
      const promoted = await tx.contentVersion.updateMany({
        where: {
          id: content.draftVersion!.id,
          contentId: content.id,
          versionStatus: ContentStatus.APPROVED,
        },
        data: { versionStatus: ContentStatus.PUBLISHED, publishedAt: now },
      });
      if (promoted.count !== 1)
        throw new ConflictException('This draft version is no longer awaiting publication.');

      const published = await tx.content.updateMany({
        where: { id: content.id, draftVersionId: content.draftVersion!.id },
        data: {
          currentVersionId: content.draftVersion!.id,
          draftVersionId: null,
          status: ContentStatus.PUBLISHED,
          title: content.draftVersion!.title,
          summary: content.draftVersion!.summary,
          publishedAt: now,
          lastReviewedAt: now,
        },
      });
      if (published.count !== 1)
        throw new ConflictException(
          'This content version was changed before it could be published.',
        );

      return tx.content.findUniqueOrThrow({
        where: { id: content.id },
        include: { currentVersion: true },
      });
    });
    await this.audit.write({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'content.publish',
      entityType: 'content',
      entityId: content.id,
      beforeData: { status: content.status, draftVersionId: content.draftVersion.id },
      afterData: published,
    });
    return published;
  }

  async unpublish(user: AuthenticatedUser, contentId: string) {
    const content = await this.findLifecycleContent(user, contentId);
    if (content.status !== ContentStatus.PUBLISHED) {
      throw new ConflictException('Only published content can be unpublished.');
    }
    const updated = await this.prisma.content.update({
      where: { id: content.id },
      data: { status: ContentStatus.UNPUBLISHED },
    });
    await this.audit.write({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'content.unpublish',
      entityType: 'content',
      entityId: content.id,
      beforeData: { status: content.status },
      afterData: updated,
    });
    return updated;
  }

  async archive(user: AuthenticatedUser, contentId: string) {
    const content = await this.findLifecycleContent(user, contentId);
    if (
      !new Set<ContentStatus>([ContentStatus.PUBLISHED, ContentStatus.UNPUBLISHED]).has(
        content.status,
      )
    ) {
      throw new ConflictException('Only published or unpublished content can be archived.');
    }
    const updated = await this.prisma.content.update({
      where: { id: content.id },
      data: { status: ContentStatus.ARCHIVED, archivedAt: new Date() },
    });
    await this.audit.write({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'content.archive',
      entityType: 'content',
      entityId: content.id,
      beforeData: { status: content.status },
      afterData: updated,
    });
    return updated;
  }

  async autosave(user: AuthenticatedUser, contentId: string, input: AutosaveDraftDto) {
    const content = await this.findEditableDraft(user, contentId);
    const draft = content.draftVersion;
    if (!draft)
      throw new ConflictException('This content does not have an editable draft version.');

    const [updatedContent, updatedVersion] = await this.prisma.$transaction([
      this.prisma.content.update({
        where: { id: content.id },
        data: {
          ...(content.status === ContentStatus.PUBLISHED
            ? {}
            : {
                ...(input.title !== undefined ? { title: input.title } : {}),
                ...(input.summary !== undefined ? { summary: input.summary } : {}),
                ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
                ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
              }),
        },
      }),
      this.prisma.contentVersion.update({
        where: { id: draft.id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.summary !== undefined ? { summary: input.summary } : {}),
          ...(input.versionLabel !== undefined ? { versionLabel: input.versionLabel } : {}),
          ...(input.changeSummary !== undefined ? { changeSummary: input.changeSummary } : {}),
          ...(input.body !== undefined ? { body: input.body as Prisma.InputJsonValue } : {}),
        },
      }),
    ]);
    if (input.attachmentFileIds !== undefined) {
      const fileIds = [...new Set(input.attachmentFileIds)];
      const files = await this.prisma.fileAttachment.findMany({
        where: {
          id: { in: fileIds },
          organizationId: user.organizationId,
          uploadStatus: UploadStatus.READY,
          deletedAt: null,
        },
        select: { id: true, uploadedById: true },
      });
      const canManageAll = user.permissions.includes('content.edit_all');
      if (
        files.length !== fileIds.length ||
        files.some((file) => file.uploadedById !== user.id && !canManageAll)
      ) {
        throw new BadRequestException('Each attachment must be a ready file that you can manage.');
      }
      await this.prisma.$transaction([
        this.prisma.attachmentRelation.deleteMany({
          where: { entityType: AttachmentEntityType.VERSION, entityId: draft.id },
        }),
        ...(fileIds.length
          ? [
              this.prisma.attachmentRelation.createMany({
                data: fileIds.map((fileId, sortOrder) => ({
                  fileId,
                  entityType: AttachmentEntityType.VERSION,
                  entityId: draft.id,
                  usageType: AttachmentUsageType.ATTACHMENT,
                  sortOrder,
                })),
              }),
            ]
          : []),
      ]);
    }

    return { content: this.serialize(updatedContent), version: this.serialize(updatedVersion) };
  }

  async get(user: AuthenticatedUser, contentId: string) {
    const content = await this.findEditableDraft(user, contentId);
    const attachments = content.draftVersion
      ? await this.prisma.attachmentRelation.findMany({
          where: { entityType: AttachmentEntityType.VERSION, entityId: content.draftVersion.id },
          include: { file: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        })
      : [];
    return {
      ...this.serialize(content),
      attachments: attachments.map((attachment) => ({
        ...attachment,
        file: { ...attachment.file, sizeBytes: attachment.file.sizeBytes.toString() },
      })),
    };
  }

  async versions(user: AuthenticatedUser, contentId: string) {
    await this.findEditableDraft(user, contentId);
    const versions = await this.prisma.contentVersion.findMany({
      where: { contentId },
      orderBy: { versionNumber: 'desc' },
    });
    return { items: versions.map((version) => this.serialize(version)) };
  }

  async availableTeams(user: AuthenticatedUser) {
    const items = await this.prisma.team.findMany({
      where: { organizationId: user.organizationId, status: 'ACTIVE' },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
    return { items };
  }

  private async findEditableDraft(user: AuthenticatedUser, contentId: string) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, organizationId: user.organizationId, deletedAt: null },
      include: { draftVersion: true },
    });
    if (!content) throw new NotFoundException('Content was not found.');
    if (content.ownerId !== user.id && !user.permissions.includes('content.edit_all')) {
      throw new ForbiddenException('You cannot edit this content.');
    }
    if (
      !content.draftVersion ||
      !new Set<ContentStatus>([ContentStatus.DRAFT, ContentStatus.CHANGES_REQUESTED]).has(
        content.draftVersion.versionStatus,
      )
    ) {
      throw new ConflictException('Only a draft or change-requested version can be autosaved.');
    }
    if (
      !new Set<ContentStatus>([
        ContentStatus.DRAFT,
        ContentStatus.CHANGES_REQUESTED,
        ContentStatus.PUBLISHED,
      ]).has(content.status)
    ) {
      throw new ConflictException('This content cannot be edited in its current state.');
    }
    return content;
  }

  private async findLifecycleContent(user: AuthenticatedUser, contentId: string) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, organizationId: user.organizationId, deletedAt: null },
      include: { draftVersion: true },
    });
    if (!content) throw new NotFoundException('Content was not found.');
    if (content.draftVersion) {
      throw new ConflictException(
        'Content with an active draft, review or approved version cannot change lifecycle state.',
      );
    }
    return content;
  }

  private serialize<T>(value: T) {
    return value;
  }
}
