import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { RbacGuard } from '../auth/rbac.guard';
import type { AuthenticatedUser } from '../auth/auth.types';
import { AssignReviewerDto, ReviewDecisionDto, SubmitReviewDto } from './reviews.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiSecurity('development-user-email')
@UseGuards(AuthGuard, RbacGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('queue')
  @RequirePermissions('review.process')
  queue(@CurrentUser() user: AuthenticatedUser) {
    return this.reviews.queue(user);
  }

  @Get('reviewers')
  @RequirePermissions('review.process')
  reviewers(@CurrentUser() user: AuthenticatedUser) {
    return this.reviews.reviewers(user);
  }

  @Get('mine')
  @RequirePermissions('content.submit')
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.reviews.mine(user);
  }

  @Get(':id/diff')
  @RequirePermissions('review.process')
  diff(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.reviews.diff(user, id);
  }

  @Post('content/:contentId/submit')
  @RequirePermissions('content.submit')
  submit(@CurrentUser() user: AuthenticatedUser, @Param('contentId') contentId: string, @Body() body: SubmitReviewDto) {
    return this.reviews.submit(user, contentId, body);
  }

  @Patch(':id/assign')
  @RequirePermissions('review.process')
  assign(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: AssignReviewerDto) {
    return this.reviews.assign(user, id, body);
  }

  @Post(':id/approve')
  @RequirePermissions('review.process')
  approve(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: ReviewDecisionDto) {
    return this.reviews.approve(user, id, body);
  }

  @Post(':id/request-changes')
  @RequirePermissions('review.process')
  requestChanges(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: ReviewDecisionDto) {
    return this.reviews.requestChanges(user, id, body);
  }

  @Post(':id/comment')
  @RequirePermissions('review.process')
  comment(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: ReviewDecisionDto) {
    return this.reviews.comment(user, id, body);
  }
}
