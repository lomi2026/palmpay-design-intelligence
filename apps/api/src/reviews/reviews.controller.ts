import { Body, Controller, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
}
