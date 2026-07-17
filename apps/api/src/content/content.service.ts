import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { AttachmentEntityType, ContentStatus, ContentVisibility } from '../generated/prisma/enums';
import type { ContentListQueryDto } from './content.dto';

const contentCardInclude = {
  category: { select: { id: true, name: true, code: true } },
  owner: { select: { id: true, name: true, avatarUrl: true } },
  team: { select: { id: true, name: true, code: true } },
  projectDetail: {
    select: {
      projectCode: true,
      domain: true,
      targetValue: true,
      projectStage: true,
      priority: true,
    },
  },
  skillDetail: { select: { applicableRoles: true } },
  caseDetail: { select: { metricName: true } },
  assetDetail: { select: { platforms: true, scenarios: true } },
  currentVersion: { select: { versionLabel: true, body: true } },
  coverFile: true,
  tags: { include: { tag: true } },
} as const;

const contentDetailInclude = {
  ...contentCardInclude,
  currentVersion: true,
  assetDetail: true,
  skillDetail: true,
  caseDetail: { include: { evidence: true } },
  projectDetail: {
    include: { suggestedOwnerTeam: { select: { id: true, name: true, code: true } } },
  },
  sourceRelations: {
    include: {
      targetContent: {
        select: { id: true, slug: true, title: true, contentType: true, status: true },
      },
    },
  },
} as const;

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ContentListQueryDto, user?: AuthenticatedUser) {
    const where: Prisma.ContentWhereInput = {
      status: ContentStatus.PUBLISHED,
      deletedAt: null,
      contentType: query.type,
      categoryId: query.categoryId,
      tags: query.tag
        ? { some: { tag: { normalizedName: query.tag.trim().toLowerCase() } } }
        : undefined,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { summary: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      AND: [this.visibilityWhere(user)],
    };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.content.findMany({
        where,
        include: contentCardInclude,
        orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
        skip,
        take: query.pageSize,
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      items: items.map((item) => this.serializeContentFiles(item)),
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  }

  async getBySlug(slug: string, user?: AuthenticatedUser) {
    const content = await this.prisma.content.findFirst({
      where: {
        slug,
        status: ContentStatus.PUBLISHED,
        deletedAt: null,
        AND: [this.visibilityWhere(user)],
      },
      include: contentDetailInclude,
    });
    if (!content) throw new NotFoundException('Content not found.');

    const attachments = await this.prisma.attachmentRelation.findMany({
      where: { entityType: AttachmentEntityType.CONTENT, entityId: content.id },
      include: { file: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return {
      ...this.serializeContentFiles(content),
      attachments: attachments.map((relation) => ({
        ...relation,
        file: this.serializeFile(relation.file),
      })),
    };
  }

  private visibilityWhere(user?: AuthenticatedUser): Prisma.ContentWhereInput {
    const allowed: Prisma.ContentWhereInput[] = [{ visibility: ContentVisibility.PUBLIC }];

    if (user?.permissions.includes('content.read')) {
      allowed.push({
        organizationId: user.organizationId,
        visibility: ContentVisibility.ORGANIZATION,
      });
      if (user.primaryTeamId) {
        allowed.push({
          organizationId: user.organizationId,
          teamId: user.primaryTeamId,
          visibility: ContentVisibility.TEAM,
        });
      }
    }

    if (user) {
      allowed.push({ ownerId: user.id, visibility: ContentVisibility.RESTRICTED });
      if (user.permissions.includes('content.edit_all')) {
        allowed.push({
          organizationId: user.organizationId,
          visibility: ContentVisibility.RESTRICTED,
        });
      }
    }

    return { OR: allowed };
  }

  private serializeContentFiles<T extends { coverFile: { sizeBytes: bigint } | null }>(content: T) {
    return {
      ...content,
      coverFile: content.coverFile ? this.serializeFile(content.coverFile) : null,
    };
  }

  private serializeFile<T extends { sizeBytes: bigint }>(file: T) {
    return { ...file, sizeBytes: file.sizeBytes.toString() };
  }
}
