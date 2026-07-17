import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../database/prisma.service';
import { AttachmentEntityType, ContentStatus, ReviewActionType, ReviewRequestStatus, UserStatus } from '../generated/prisma/enums';
import type { AssignReviewerDto, ReviewDecisionDto, SubmitReviewDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(user: AuthenticatedUser, contentId: string, input: SubmitReviewDto) {
    const content = await this.prisma.content.findFirst({
      where: { id: contentId, organizationId: user.organizationId, deletedAt: null },
      include: { draftVersion: true },
    });
    if (!content) throw new NotFoundException('Content was not found.');
    if (content.ownerId !== user.id && !user.permissions.includes('content.edit_all')) {
      throw new ForbiddenException('You cannot submit this content for review.');
    }
    if (!content.draftVersion) throw new ConflictException('This content does not have a draft version.');
    const draftVersion = content.draftVersion;
    if (!new Set<ContentStatus>([ContentStatus.DRAFT, ContentStatus.CHANGES_REQUESTED]).has(draftVersion.versionStatus)) {
      throw new ConflictException('Only a draft or change-requested version can be submitted.');
    }

    return this.prisma.$transaction(async (tx) => {
      const active = await tx.reviewRequest.findFirst({
        where: { versionId: draftVersion.id, status: ReviewRequestStatus.PENDING },
      });
      if (active) throw new ConflictException('This draft version already has an active review.');
      const review = await tx.reviewRequest.create({
        data: {
          contentId: content.id,
          versionId: draftVersion.id,
          submittedById: user.id,
          submitMessage: input.message,
        },
      });
      const reviewers = await tx.user.findMany({ where: { organizationId: user.organizationId, status: UserStatus.ACTIVE, id: { not: user.id }, userRoles: { some: { role: { rolePermissions: { some: { permission: { code: 'review.process' } } } } } } }, select: { id: true } });
      if (reviewers.length) await tx.notification.createMany({ data: reviewers.map((reviewer) => ({ receiverId: reviewer.id, type: 'review_submitted', title: '有新的内容待审核', message: '一项内容已提交审核，请进入审核中心处理。', relatedEntityType: 'review_request', relatedEntityId: review.id, sentAt: new Date() })) });
      if (content.status !== ContentStatus.PUBLISHED) {
        await tx.content.update({ where: { id: content.id }, data: { status: ContentStatus.IN_REVIEW } });
      }
      await tx.contentVersion.update({
        where: { id: draftVersion.id },
        data: { versionStatus: ContentStatus.IN_REVIEW, submittedAt: new Date() },
      });
      return review;
    });
  }

  async assign(user: AuthenticatedUser, reviewId: string, input: AssignReviewerDto) {
    const review = await this.findProcessableReview(user, reviewId);
    const reviewer = await this.prisma.user.findFirst({
      where: {
        id: input.reviewerId,
        organizationId: user.organizationId,
        status: UserStatus.ACTIVE,
        userRoles: { some: { role: { rolePermissions: { some: { permission: { code: 'review.process' } } } } } },
      },
      select: { id: true },
    });
    if (!reviewer) throw new NotFoundException('The selected reviewer is not available.');
    if (review.submittedById === reviewer.id) throw new ConflictException('A submitter cannot review their own content.');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.reviewRequest.update({
        where: { id: review.id },
        data: { assignedReviewerId: reviewer.id },
      });
      await tx.reviewAction.create({
        data: { reviewRequestId: review.id, actorId: user.id, action: ReviewActionType.ASSIGN, metadata: { reviewerId: reviewer.id } },
      });
      if (reviewer.id !== user.id) await tx.notification.create({ data: { receiverId: reviewer.id, type: 'review_assigned', title: '你被分配了审核任务', message: '请进入审核中心查看提交版本并完成审核。', relatedEntityType: 'review_request', relatedEntityId: review.id, sentAt: new Date() } });
      return updated;
    });
  }

  async approve(user: AuthenticatedUser, reviewId: string, input: ReviewDecisionDto) {
    const review = await this.findAssignedReview(user, reviewId);
    return this.finishReview(user, review, ReviewRequestStatus.APPROVED, ReviewActionType.APPROVE, ContentStatus.APPROVED, input.comment);
  }

  async requestChanges(user: AuthenticatedUser, reviewId: string, input: ReviewDecisionDto) {
    const review = await this.findAssignedReview(user, reviewId);
    return this.finishReview(
      user,
      review,
      ReviewRequestStatus.CHANGES_REQUESTED,
      ReviewActionType.REQUEST_CHANGES,
      ContentStatus.CHANGES_REQUESTED,
      input.comment,
    );
  }

  async comment(user: AuthenticatedUser, reviewId: string, input: ReviewDecisionDto) {
    const review = await this.findAssignedReview(user, reviewId);
    return this.prisma.reviewAction.create({
      data: { reviewRequestId: review.id, actorId: user.id, action: ReviewActionType.COMMENT, comment: input.comment },
    });
  }

  async queue(user: AuthenticatedUser) {
    const items = await this.prisma.reviewRequest.findMany({
      where: { content: { organizationId: user.organizationId, deletedAt: null } },
      include: {
        content: { select: { id: true, title: true, contentType: true, status: true } },
        version: { select: { id: true, versionNumber: true, versionLabel: true, title: true, summary: true, changeSummary: true, body: true } },
        submittedBy: { select: { id: true, name: true, email: true } },
        assignedReviewer: { select: { id: true, name: true, email: true } },
        actions: { orderBy: { createdAt: "asc" }, select: { id: true, action: true, comment: true, createdAt: true, metadata: true, actor: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: [{ status: "asc" }, { submittedAt: "asc" }],
    });
    const now = new Date();
    return { items: items.map((item) => ({ ...item, isOverdue: Boolean(item.dueAt && item.dueAt < now) })) };
  }

  async mine(user: AuthenticatedUser) {
    const items = await this.prisma.reviewRequest.findMany({
      where: { submittedById: user.id, content: { organizationId: user.organizationId, deletedAt: null } },
      include: {
        content: { select: { id: true, slug: true, title: true, contentType: true, status: true } },
        version: { select: { versionNumber: true, title: true, versionStatus: true, changeSummary: true } },
        assignedReviewer: { select: { id: true, name: true, email: true } },
        actions: { orderBy: { createdAt: 'asc' }, select: { id: true, action: true, comment: true, createdAt: true, actor: { select: { id: true, name: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
    });
    return { items };
  }

  async reviewers(user: AuthenticatedUser) {
    const items = await this.prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        status: UserStatus.ACTIVE,
        userRoles: { some: { role: { rolePermissions: { some: { permission: { code: "review.process" } } } } } },
      },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    return { items };
  }

  async diff(user: AuthenticatedUser, reviewId: string) {
    const review = await this.prisma.reviewRequest.findFirst({
      where: { id: reviewId, content: { organizationId: user.organizationId, deletedAt: null } },
      include: {
        version: {
          include: {
            baseVersion: true,
          },
        },
      },
    });
    if (!review) throw new NotFoundException('Review request was not found.');
    const baseVersion = review.version.baseVersion;
    const [baseAttachments, versionAttachments] = await Promise.all([
      baseVersion ? this.versionAttachments(baseVersion.id) : Promise.resolve([]),
      this.versionAttachments(review.version.id),
    ]);
    const before = baseVersion ? this.versionSnapshot(baseVersion, baseAttachments) : null;
    const after = this.versionSnapshot(review.version, versionAttachments);

    return {
      baseVersion: baseVersion ? { id: baseVersion.id, versionNumber: baseVersion.versionNumber } : null,
      version: { id: review.version.id, versionNumber: review.version.versionNumber },
      changes: before ? this.diffValues(before, after) : [],
    };
  }

  private async finishReview(
    user: AuthenticatedUser,
    review: { id: string; contentId: string; versionId: string },
    reviewStatus: ReviewRequestStatus,
    action: ReviewActionType,
    contentStatus: ContentStatus,
    comment: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const completed = await tx.reviewRequest.update({
        where: { id: review.id },
        data: { status: reviewStatus, completedAt: new Date() },
      });
      const content = await tx.content.findUniqueOrThrow({
        where: { id: review.contentId },
        select: { status: true, currentVersionId: true },
      });
      if (!(content.status === ContentStatus.PUBLISHED && content.currentVersionId !== review.versionId)) {
        await tx.content.update({ where: { id: review.contentId }, data: { status: contentStatus } });
      }
      await tx.contentVersion.update({ where: { id: review.versionId }, data: { versionStatus: contentStatus } });
      await tx.reviewAction.create({ data: { reviewRequestId: review.id, actorId: user.id, action, comment } });
      await tx.notification.create({ data: { receiverId: completed.submittedById, type: reviewStatus === ReviewRequestStatus.APPROVED ? 'review_approved' : 'review_changes_requested', title: reviewStatus === ReviewRequestStatus.APPROVED ? '你的内容已通过审核' : '你的内容需要修改', message: comment, relatedEntityType: 'review_request', relatedEntityId: review.id, sentAt: new Date() } });
      return completed;
    });
  }

  private async findProcessableReview(user: AuthenticatedUser, reviewId: string) {
    const review = await this.prisma.reviewRequest.findFirst({
      where: { id: reviewId, content: { organizationId: user.organizationId, deletedAt: null } },
    });
    if (!review) throw new NotFoundException('Review request was not found.');
    if (review.status !== ReviewRequestStatus.PENDING) throw new ConflictException('This review request is already complete.');
    return review;
  }

  private async findAssignedReview(user: AuthenticatedUser, reviewId: string) {
    const review = await this.findProcessableReview(user, reviewId);
    if (review.assignedReviewerId !== user.id) throw new ForbiddenException('This review is not assigned to you.');
    if (review.submittedById === user.id) throw new ForbiddenException('You cannot review your own content.');
    return review;
  }

  private async versionAttachments(versionId: string) {
    const attachments = await this.prisma.attachmentRelation.findMany({
      where: { entityType: AttachmentEntityType.VERSION, entityId: versionId },
      include: { file: { select: { id: true, originalName: true, mimeType: true, sizeBytes: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return attachments.map(({ file }) => ({
      id: file.id,
      name: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes.toString(),
    }));
  }

  private versionSnapshot(
    version: { title: string; summary: string | null; versionLabel: string | null; changeSummary: string | null; body: unknown },
    attachments: Array<{ id: string; name: string; mimeType: string; sizeBytes: string }>,
  ) {
    return {
      title: version.title,
      summary: version.summary,
      versionLabel: version.versionLabel,
      changeSummary: version.changeSummary,
      body: version.body,
      attachments,
    };
  }

  private diffValues(before: unknown, after: unknown, path = ''): Array<{ path: string; before: unknown; after: unknown }> {
    if (Object.is(before, after)) return [];
    if (Array.isArray(before) || Array.isArray(after)) {
      return [{ path, before, after }];
    }
    if (this.isPlainObject(before) && this.isPlainObject(after)) {
      const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
      return keys.flatMap((key) => this.diffValues(before[key], after[key], path ? `${path}.${key}` : key));
    }
    return [{ path, before, after }];
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
