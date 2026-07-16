import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { DraftsController } from './drafts.controller';
import { DraftTeamsController } from './draft-teams.controller';
import { DraftsService } from './drafts.service';

@Module({
  imports: [AuthModule],
  controllers: [ContentController, DraftsController, DraftTeamsController],
  providers: [ContentService, DraftsService],
})
export class ContentModule {}
