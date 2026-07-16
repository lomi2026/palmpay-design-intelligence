import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../database/prisma.service';
import { ContentStatus, ReviewActionType, ReviewRequestStatus, UserStatus } from '../generated/prisma/enums';
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
    if (!new Set<ContentStatus>([ContentStatus.DRAFT, ContentStatus.CHANGES_REQUESTED]).has(content.status)) {
      throw new ConflictException('Only a draft or change-requested content can be submitted.');
    }
    if (!content.draftVersion) throw new ConflictException('This content does not have a draft version.');
    const draftVersion = content.draftVersion;

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
      await tx.content.update({ where: { id: content.id }, data: { status: ContentStatus.IN_REVIEW } });
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

  async queue(user: AuthenticatedUser) {
    const items = await this.prisma.reviewRequest.findMany({
      where: { content: { organizationId: user.organizationId, deletedAt: null } },
      include: {
        content: { select: { id: true, title: true, contentType: true, status: true } },
        version: { select: { id: true, versionNumber: true, versionLabel: true, title: true, summary: true } },
        submittedBy: { select: { id: true, name: true, email: true } },
        assignedReviewer: { select: { id: true, name: true, email: true } },
        actions: { orderBy: { createdAt: "asc" }, select: { id: true, action: true, comment: true, createdAt: true, actorId: true } },
      },
      orderBy: [{ status: "asc" }, { submittedAt: "asc" }],
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
      await tx.content.update({ where: { id: review.contentId }, data: { status: contentStatus } });
      await tx.contentVersion.update({ where: { id: review.versionId }, data: { versionStatus: contentStatus } });
      await tx.reviewAction.create({ data: { reviewRequestId: review.id, actorId: user.id, action, comment } });
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
}
