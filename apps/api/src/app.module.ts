import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ContentModule } from './content/content.module';
import { HealthController } from './health/health.controller';
import { FilesModule } from './files/files.module';
import { IdentityModule } from './identity/identity.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'] }),
    DatabaseModule,
    AuthModule,
    IdentityModule,
    ContentModule,
    FilesModule,
    ReviewsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
