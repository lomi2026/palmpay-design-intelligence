import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '../generated/prisma/client';
import { RoleScopeType, UserStatus } from '../generated/prisma/enums';
import type {
  AssignUserRoleDto,
  UpdateTeamDto,
  UpdateUserStatusDto,
  UserListQueryDto,
} from './identity.dto';
import { AuditService } from '../governance/audit.service';

const userDetails = {
  primaryTeam: { select: { id: true, name: true, code: true } },
  userRoles: {
    include: {
      role: { include: { rolePermissions: { include: { permission: true } } } },
    },
  },
} as const;

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async getOrganization(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) throw new NotFoundException('Organization not found.');
    return organization;
  }

  async listTeams(organizationId: string) {
    return this.prisma.team.findMany({
      where: { organizationId },
      include: {
        owner: { select: { id: true, name: true, email: true, status: true } },
        _count: { select: { members: true } },
      },
      orderBy: [{ name: 'asc' }],
    });
  }

  async updateTeam(organizationId: string, teamId: string, input: UpdateTeamDto, actorId: string) {
    if (input.name === undefined && input.ownerId === undefined && input.status === undefined) {
      throw new BadRequestException('At least one team field must be provided.');
    }

    const team = await this.prisma.team.findFirst({ where: { id: teamId, organizationId } });
    if (!team) throw new NotFoundException('Team not found.');

    if (input.ownerId) {
      const owner = await this.prisma.user.findFirst({
        where: { id: input.ownerId, organizationId, deletedAt: null },
      });
      if (!owner) throw new BadRequestException('Team owner must belong to the same organization.');
    }

    const updated = await this.prisma.team.update({
      where: { id: teamId },
      data: { name: input.name, ownerId: input.ownerId, status: input.status },
    });
    await this.audit.write({
      organizationId,
      actorId,
      action: 'team.update',
      entityType: 'team',
      entityId: teamId,
      beforeData: team,
      afterData: updated,
    });
    return updated;
  }

  async listUsers(organizationId: string, query: UserListQueryDto) {
    const where = {
      organizationId,
      deletedAt: null,
      status: query.status,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { email: { contains: query.search, mode: 'insensitive' as const } },
              { employeeId: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
    const skip = (query.page - 1) * query.pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: userDetails,
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        skip,
        take: query.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, page: query.page, pageSize: query.pageSize, total };
  }

  async getUser(organizationId: string, userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, organizationId, deletedAt: null },
      include: userDetails,
    });
    if (!user) throw new NotFoundException('User not found.');
    return user;
  }

  async updateUserStatus(
    organizationId: string,
    userId: string,
    input: UpdateUserStatusDto,
    actorId: string,
  ) {
    const existing = await this.getUser(organizationId, userId);
    const disabling =
      input.status === UserStatus.DISABLED && existing.status !== UserStatus.DISABLED;
    const result = await this.prisma.$transaction(async (tx) => {
      const ownedContent = disabling
        ? await tx.content.findMany({
            where: { organizationId, ownerId: userId, deletedAt: null },
            select: { id: true, title: true, slug: true, status: true },
            orderBy: { updatedAt: 'desc' },
          })
        : [];
      if (ownedContent.length > 0 && !input.replacementOwnerId) {
        throw new ConflictException({
          code: 'CONTENT_OWNERSHIP_TRANSFER_REQUIRED',
          message: 'Select an active replacement owner before disabling this user.',
          ownedContentCount: ownedContent.length,
          ownedContent: ownedContent.slice(0, 20),
        });
      }

      if (ownedContent.length > 0) {
        if (input.replacementOwnerId === userId) {
          throw new BadRequestException('The replacement owner must be a different user.');
        }
        const replacementOwner = await tx.user.findFirst({
          where: {
            id: input.replacementOwnerId,
            organizationId,
            status: UserStatus.ACTIVE,
            deletedAt: null,
          },
          select: {
            id: true,
            primaryTeamId: true,
            userRoles: {
              select: {
                scopeType: true,
                scopeId: true,
                role: {
                  select: {
                    rolePermissions: {
                      select: { permission: { select: { code: true } } },
                    },
                  },
                },
              },
            },
          },
        });
        if (!replacementOwner) {
          throw new BadRequestException(
            'The replacement owner must be an active user in the same organization.',
          );
        }
        const canOwnContent = replacementOwner.userRoles.some(
          ({ scopeType, scopeId, role }) =>
            ((scopeType === RoleScopeType.ORGANIZATION && scopeId === organizationId) ||
              (scopeType === RoleScopeType.TEAM && scopeId === replacementOwner.primaryTeamId)) &&
            role.rolePermissions.some(({ permission }) =>
              ['content.edit_own', 'content.edit_all'].includes(permission.code),
            ),
        );
        if (!canOwnContent) {
          throw new BadRequestException(
            'The replacement owner must have an applicable content editing permission.',
          );
        }
        const transferred = await tx.content.updateMany({
          where: { organizationId, ownerId: userId, deletedAt: null },
          data: { ownerId: replacementOwner.id },
        });
        if (transferred.count !== ownedContent.length) {
          throw new ConflictException('Content ownership changed during the disable operation.');
        }
        await tx.auditLog.create({
          data: {
            organizationId,
            actorId,
            action: 'content.owner.transfer',
            entityType: 'content_ownership',
            entityId: userId,
            beforeData: {
              ownerId: userId,
              contentIds: ownedContent.map((content) => content.id),
            },
            afterData: {
              ownerId: replacementOwner.id,
              contentIds: ownedContent.map((content) => content.id),
            },
          },
        });
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: { status: input.status },
      });
      await tx.auditLog.create({
        data: {
          organizationId,
          actorId,
          action: input.status === UserStatus.DISABLED ? 'user.disable' : 'user.status.update',
          entityType: 'user',
          entityId: userId,
          beforeData: JSON.parse(JSON.stringify(existing)) as Prisma.InputJsonValue,
          afterData: JSON.parse(JSON.stringify(updated)) as Prisma.InputJsonValue,
        },
      });
      return {
        updated,
        transferredContentIds: ownedContent.map((content) => content.id),
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return result.updated;
  }

  listPermissions() {
    return this.prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { code: 'asc' }] });
  }

  listRoles(organizationId: string) {
    return this.prisma.role.findMany({
      where: { OR: [{ organizationId: null }, { organizationId }] },
      include: { rolePermissions: { include: { permission: true } } },
      orderBy: [{ isSystem: 'desc' }, { code: 'asc' }],
    });
  }

  async assignUserRole(
    organizationId: string,
    userId: string,
    input: AssignUserRoleDto,
    actorId: string,
  ) {
    const [user, role] = await Promise.all([
      this.prisma.user.findFirst({ where: { id: userId, organizationId, deletedAt: null } }),
      this.prisma.role.findFirst({
        where: { id: input.roleId, OR: [{ organizationId: null }, { organizationId }] },
      }),
    ]);
    if (!user) throw new NotFoundException('User not found.');
    if (!role) throw new NotFoundException('Role not found.');

    await this.validateRoleScope(organizationId, input.scopeType, input.scopeId);

    try {
      const assignment = await this.prisma.userRole.create({
        data: {
          userId,
          roleId: input.roleId,
          scopeType: input.scopeType,
          scopeId: input.scopeId,
          createdBy: actorId,
        },
        include: { role: true },
      });
      await this.audit.write({
        organizationId,
        actorId,
        action: 'user.role.assign',
        entityType: 'user_role',
        entityId: assignment.id,
        afterData: assignment,
      });
      return assignment;
    } catch (error: unknown) {
      if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('User role assignment already exists.');
      }
      throw error;
    }
  }

  async removeUserRole(
    organizationId: string,
    userId: string,
    userRoleId: string,
    actorId: string,
  ) {
    const assignment = await this.prisma.userRole.findFirst({
      where: { id: userRoleId, userId, user: { organizationId, deletedAt: null } },
    });
    if (!assignment) throw new NotFoundException('User role assignment not found.');
    await this.prisma.userRole.delete({ where: { id: userRoleId } });
    await this.audit.write({
      organizationId,
      actorId,
      action: 'user.role.remove',
      entityType: 'user_role',
      entityId: userRoleId,
      beforeData: assignment,
    });
    return { deleted: true };
  }

  private async validateRoleScope(
    organizationId: string,
    scopeType: RoleScopeType,
    scopeId: string,
  ) {
    if (scopeType === RoleScopeType.ORGANIZATION) {
      if (scopeId !== organizationId)
        throw new BadRequestException('Organization role scope must match the user organization.');
      return;
    }

    const team = await this.prisma.team.findFirst({ where: { id: scopeId, organizationId } });
    if (!team)
      throw new BadRequestException('Team role scope must belong to the user organization.');
  }
}
