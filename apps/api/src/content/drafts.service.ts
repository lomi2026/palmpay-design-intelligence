import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { AuthenticatedUser } from '../auth/auth.types';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { ContentStatus } from '../generated/prisma/enums';
import type { AutosaveDraftDto, CreateDraftDto } from './drafts.dto';

@Injectable()
export class DraftsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedUser, input: CreateDraftDto) {
    const teamId = input.teamId ?? user.primaryTeamId;
    if (!teamId) throw new BadRequestException('Select a team before creating content.');
    const team = await this.prisma.team.findFirst({
      where: { id: teamId, organizationId: user.organizationId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!team) throw new BadRequestException('The selected team is not available in your organization.');
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
    return this.serialize(draft);
  }

  async autosave(user: AuthenticatedUser, contentId: string, input: AutosaveDraftDto) {
    const content = await this.findEditableDraft(user, contentId);
    const draft = content.draftVersion;
    if (!draft) throw new ConflictException('This content does not have an editable draft version.');

    const [updatedContent, updatedVersion] = await this.prisma.$transaction([
      this.prisma.content.update({
        where: { id: content.id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.summary !== undefined ? { summary: input.summary } : {}),
          ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
          ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
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
    return { content: this.serialize(updatedContent), version: this.serialize(updatedVersion) };
  }

  async get(user: AuthenticatedUser, contentId: string) {
    const content = await this.findEditableDraft(user, contentId);
    return this.serialize(content);
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
    if (!new Set<ContentStatus>([ContentStatus.DRAFT, ContentStatus.CHANGES_REQUESTED]).has(content.status)) {
      throw new ConflictException('Only draft or change-requested content can be autosaved.');
    }
    return content;
  }

  private serialize<T>(value: T) {
    return value;
  }
}
