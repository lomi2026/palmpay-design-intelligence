import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ContentStatus } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(user: AuthenticatedUser) {
    const since = daysAgo(30);
    const organizationId = user.organizationId;
    const [published, activeUsers, contributors, usageEvents, projects, verifiedCases, favorites] =
      await Promise.all([
        this.prisma.content.groupBy({
          where: { organizationId, deletedAt: null, status: ContentStatus.PUBLISHED },
          by: ['contentType'],
          _count: { _all: true },
        }),
        this.prisma.usageEvent.groupBy({
          where: { organizationId, occurredAt: { gte: since }, userId: { not: null } },
          by: ['userId'],
        }),
        this.prisma.content.groupBy({
          where: { organizationId, deletedAt: null },
          by: ['createdById'],
        }),
        this.prisma.usageEvent.count({
          where: { organizationId, occurredAt: { gte: since }, eventType: 'usage_confirmed' },
        }),
        this.prisma.usageEvent.count({
          where: { organizationId, occurredAt: { gte: since }, eventType: 'project_referenced' },
        }),
        this.prisma.content.count({
          where: {
            organizationId,
            contentType: 'AI_CASE',
            verificationStatus: 'VERIFIED',
            deletedAt: null,
          },
        }),
        this.prisma.favorite.count({
          where: {
            user: { organizationId, deletedAt: null },
            content: { organizationId, deletedAt: null },
          },
        }),
      ]);
    const countFor = (type: string) =>
      published.find((item) => item.contentType === type)?._count._all ?? 0;
    return {
      periodDays: 30,
      publishedAssets: countFor('DESIGN_ASSET'),
      publishedSkills: countFor('AI_SKILL'),
      publishedCases: countFor('AI_CASE'),
      effectiveUsage30d: usageEvents,
      projectReferences30d: projects,
      activeUsers30d: activeUsers.length,
      contributors: contributors.length,
      verifiedCases,
      favorites,
    };
  }

  async insights(user: AuthenticatedUser) {
    const organizationId = user.organizationId;
    const since = daysAgo(30);
    const [
      contentStatus,
      typeDistribution,
      searchLogs,
      noResult,
      eventCounts,
      staleContent,
      reviews,
    ] = await Promise.all([
      this.prisma.content.groupBy({
        where: { organizationId, deletedAt: null },
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.content.groupBy({
        where: { organizationId, deletedAt: null },
        by: ['contentType'],
        _count: { _all: true },
      }),
      this.prisma.searchLog.groupBy({
        where: { organizationId, searchedAt: { gte: since } },
        by: ['normalizedKeyword'],
        _count: { _all: true },
        orderBy: { _count: { normalizedKeyword: 'desc' } },
        take: 10,
      }),
      this.prisma.searchLog.groupBy({
        where: { organizationId, searchedAt: { gte: since }, resultCount: 0 },
        by: ['normalizedKeyword'],
        _count: { _all: true },
        orderBy: { _count: { normalizedKeyword: 'desc' } },
        take: 10,
      }),
      this.prisma.usageEvent.groupBy({
        where: { organizationId, occurredAt: { gte: since } },
        by: ['eventType'],
        _count: { _all: true },
      }),
      this.prisma.content.findMany({
        where: {
          organizationId,
          deletedAt: null,
          status: ContentStatus.PUBLISHED,
          updatedAt: { lt: daysAgo(180) },
        },
        select: { id: true, title: true, slug: true, updatedAt: true, contentType: true },
        orderBy: { updatedAt: 'asc' },
        take: 20,
      }),
      this.prisma.reviewRequest.findMany({
        where: { content: { organizationId }, completedAt: { not: null } },
        select: { submittedAt: true, completedAt: true, status: true },
      }),
    ]);
    const completed = reviews.filter((review) => review.completedAt);
    const averageReviewHours = completed.length
      ? Math.round(
          (completed.reduce(
            (sum, review) =>
              sum + (review.completedAt!.getTime() - review.submittedAt.getTime()) / 3600000,
            0,
          ) /
            completed.length) *
            10,
        ) / 10
      : 0;
    const rejected = completed.filter((review) => review.status === 'CHANGES_REQUESTED').length;
    return {
      periodDays: 30,
      contentStatus: contentStatus.map((item) => ({
        status: item.status,
        _count: item._count._all,
      })),
      typeDistribution: typeDistribution.map((item) => ({
        contentType: item.contentType,
        _count: item._count._all,
      })),
      topSearches: searchLogs.map((item) => ({
        keyword: item.normalizedKeyword,
        count: item._count._all,
      })),
      noResultSearches: noResult.map((item) => ({
        keyword: item.normalizedKeyword,
        count: item._count._all,
      })),
      eventCounts: eventCounts.map((item) => ({
        eventType: item.eventType,
        count: item._count._all,
      })),
      staleContent,
      governance: {
        averageReviewHours,
        returnRate: completed.length ? Math.round((rejected / completed.length) * 1000) / 10 : 0,
      },
    };
  }
}
