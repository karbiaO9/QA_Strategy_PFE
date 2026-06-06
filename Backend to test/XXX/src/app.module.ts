import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule, ClsService } from 'nestjs-cls';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { requireEnv } from './common/config/env';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { ProfileGuard } from './common/guards/profile.guard';
import { PoliciesGuard } from './common/guards/policies.guard';
import { Kine, KineSchema } from './modules/kines/schemas/kine.schema';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
import { CaslModule } from './common/casl/casl.module';
import { RedisModule } from './common/redis/redis.module';
import { StorageModule } from './common/storage/storage.module';
import { OAuthModule } from './common/oauth/oauth.module';
import { MailerModule } from './common/mailer/mailer.module';
import { TenantContextService } from './common/context/tenant-context.service';
import { TenantContextInterceptor } from './common/context/tenant-context.interceptor';
import { buildTenantScopePlugin } from './common/mongoose/tenant-scope.plugin';

import { ActionsModule } from './modules/actions/actions.module';
import { ModulesModule } from './modules/modules/modules.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { RolesModule } from './modules/roles/roles.module';
import { KinesModule } from './modules/kines/kines.module';
import { KineProfilesModule } from './modules/kine-profiles/kine-profiles.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AdminsModule } from './modules/admins/admins.module';
import { CabinetsModule } from './modules/cabinets/cabinets.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

    MongooseModule.forRootAsync({
      imports: [
        ClsModule.forFeature(),
      ],
      inject: [ClsService],
      useFactory: (cls: ClsService) => {
        const tenantCtx = new TenantContextService(cls);
        return {
          uri: requireEnv('MONGODB_URI'),
          connectionFactory: (connection: any) => {
            connection.plugin(buildTenantScopePlugin(tenantCtx));
            return connection;
          },
        };
      },
    }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: requireEnv('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '24h') as any,
        },
      }),
    }),

    MongooseModule.forFeature([{ name: Kine.name, schema: KineSchema }]),

    RedisModule,
    StorageModule,
    OAuthModule,
    MailerModule,
    CaslModule,

    AdminsModule,
    KinesModule,
    KineProfilesModule,
    PatientsModule,
    CabinetsModule,

    ActionsModule,
    ModulesModule,
    PermissionsModule,
    RolesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TenantContextService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ProfileGuard },
    { provide: APP_GUARD, useClass: PoliciesGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: MongoExceptionFilter },
  ],
  exports: [TenantContextService],
})
export class AppModule {}
