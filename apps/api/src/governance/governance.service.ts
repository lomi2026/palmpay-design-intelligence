import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../database/prisma.service';
import { TagStatus } from '../generated/prisma/enums';
import { AuditService } from './audit.service';
import type {
  AdminContentQueryDto,
  CreateCategoryDto,
  CreateTagDto,
  UpdateCategoryDto,
  UpdateTagDto,
} from './governance.dto';

@Injectable()
export class GovernanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listContent(user: AuthenticatedUser, query: AdminContentQueryDto) {
    const where = {
      organizationId: user.organizationId,
      deletedAt: null,
      contentType: query.type,
      status: query.status,
      categoryId: query.categoryId,
      ...(query.tagId ? { tags: { some: { tagId: query.tagId } } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' as const } },
              { summary: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.content.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          category: { select: { id: true, name: true } },
          currentVersion: { select: { versionLabel: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.content.count({ where }),
    ]);
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async listCategories(user: AuthenticatedUser) {
    const categories = await this.prisma.category.findMany({
      where: { organizationId: user.organizationId },
      include: { _count: { select: { contents: { where: { organizationId: user.organizationId, deletedAt: null } } } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return categories.map(({ _count, ...category }) => ({ ...category, usageCount: _count.contents }));
  }

  async createCategory(user: AuthenticatedUser, input: CreateCategoryDto) {
    try {
      const created = await this.prisma.category.create({
        data: {
          organizationId: user.organizationId,
          name: input.name,
          code: input.code.trim().toLowerCase(),
          contentTypes: input.contentTypes,
          sortOrder: input.sortOrder ?? 0,
          parentId: input.parentId,
        },
      });
      await this.audit.write({
        organizationId: user.organizationId,
        actorId: user.id,
        action: 'taxonomy.category.create',
        entityType: 'category',
        entityId: created.id,
        afterData: created,
      });
      return created;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002')
        throw new ConflictException('Category code already exists.');
      throw error;
    }
  }

  async updateCategory(user: AuthenticatedUser, categoryId: string, input: UpdateCategoryDto) {
    const existing = await this.prisma.category.findFirst({
      where: { id: categoryId, organizationId: user.organizationId },
    });
    if (!existing) throw new NotFoundException('Category not found.');
    const updated = await this.prisma.category.update({ where: { id: categoryId }, data: input });
    await this.audit.write({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'taxonomy.category.update',
      entityType: 'category',
      entityId: categoryId,
      beforeData: existing,
      afterData: updated,
    });
    return updated;
  }

  async listTags(user: AuthenticatedUser) {
    const tags = await this.prisma.tag.findMany({
      where: { organizationId: user.organizationId },
      include: { _count: { select: { contents: { where: { content: { organizationId: user.organizationId, deletedAt: null } } } } } },
      orderBy: { name: 'asc' },
    });
    return tags.map(({ _count, ...tag }) => ({ ...tag, usageCount: _count.contents }));
  }

  async createTag(user: AuthenticatedUser, input: CreateTagDto) {
    const normalizedName = input.name.trim().toLocaleLowerCase('zh-CN');
    try {
      const created = await this.prisma.tag.create({
        data: {
          organizationId: user.organizationId,
          name: input.name.trim(),
          normalizedName,
          status: TagStatus.DISABLED,
        },
      });
      await this.audit.write({
        organizationId: user.organizationId,
        actorId: user.id,
        action: 'taxonomy.tag.create',
        entityType: 'tag',
        entityId: created.id,
        afterData: created,
      });
      return created;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002')
        throw new ConflictException('Tag already exists.');
      throw error;
    }
  }

  async updateTag(user: AuthenticatedUser, tagId: string, input: UpdateTagDto) {
    const existing = await this.prisma.tag.findFirst({
      where: { id: tagId, organizationId: user.organizationId },
    });
    if (!existing) throw new NotFoundException('Tag not found.');
    const updated = await this.prisma.tag.update({
      where: { id: tagId },
      data: {
        name: input.name?.trim(),
        normalizedName: input.name?.trim().toLocaleLowerCase('zh-CN'),
        status: input.status,
      },
    });
    await this.audit.write({
      organizationId: user.organizationId,
      actorId: user.id,
      action: 'taxonomy.tag.update',
      entityType: 'tag',
      entityId: tagId,
      beforeData: existing,
      afterData: updated,
    });
    return updated;
  }
}
