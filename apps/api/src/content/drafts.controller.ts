import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RbacGuard } from '../auth/rbac.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AutosaveDraftDto, CreateDraftDto } from './drafts.dto';
import { DraftsService } from './drafts.service';

@ApiTags('content drafts')
@ApiSecurity('development-user-email')
@UseGuards(AuthGuard, RbacGuard)
@Controller('content-drafts')
export class DraftsController {
  constructor(private readonly drafts: DraftsService) {}

  @Post()
  @RequirePermissions('content.create')
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateDraftDto) {
    return this.drafts.create(user, body);
  }

  @Post(':id/from-published')
  createFromPublished(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.drafts.createFromPublished(user, id);
  }

  @Post(':id/publish')
  @RequirePermissions('content.publish')
  publishApproved(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.drafts.publishApproved(user, id);
  }

  @Post(':id/unpublish')
  @RequirePermissions('content.unpublish')
  unpublish(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.drafts.unpublish(user, id);
  }

  @Post(':id/archive')
  @RequirePermissions('content.archive')
  archive(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.drafts.archive(user, id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.drafts.get(user, id);
  }

  @Patch(':id')
  autosave(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: AutosaveDraftDto) {
    return this.drafts.autosave(user, id, body);
  }

  @Get(':id/versions')
  versions(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.drafts.versions(user, id);
  }
}
