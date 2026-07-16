import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AUTHENTICATION_ADAPTER } from './auth.types';
import { DevelopmentAuthAdapter } from './development-auth.adapter';
import { OptionalAuthGuard } from './optional-auth.guard';
import { RbacGuard } from './rbac.guard';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    RbacGuard,
    OptionalAuthGuard,
    DevelopmentAuthAdapter,
    {
      provide: AUTHENTICATION_ADAPTER,
      inject: [ConfigService, DevelopmentAuthAdapter],
      useFactory: (config: ConfigService, developmentAdapter: DevelopmentAuthAdapter) => {
        const mode = config.get('AUTH_MODE') ?? 'development';
        if (mode !== 'development') {
          throw new Error(
            `Unsupported AUTH_MODE: ${mode}. Configure the future enterprise OIDC adapter before use.`,
          );
        }
        return developmentAdapter;
      },
    },
  ],
  exports: [AUTHENTICATION_ADAPTER, AuthService, AuthGuard, OptionalAuthGuard, RbacGuard],
})
export class AuthModule {}
