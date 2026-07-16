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

  @Get(':id')
  @RequirePermissions('content.create')
  get(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.drafts.get(user, id);
  }

  @Patch(':id')
  @RequirePermissions('content.create')
  autosave(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: AutosaveDraftDto) {
    return this.drafts.autosave(user, id, body);
  }

  @Get(':id/versions')
  @RequirePermissions('content.create')
  versions(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.drafts.versions(user, id);
  }
}
