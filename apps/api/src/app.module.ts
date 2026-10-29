import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from './common/prisma/prisma.module';
import configuration from './config/configurations';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationModule } from './modules/organization/organization.module';
import { CashflowModule } from './modules/cashflow/cashflow.module';
import { DebtModule } from './modules/debt/debt.module';
import { JwtAuthGuard } from './modules/organization/infrastructure/auth/jwt-auth.guard';
import { OrganizationMembershipGuard } from './common/guards/organization-membership.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditService } from './common/audit/audit.service';
import { AuditController } from './common/audit/audit.controller';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    PrismaModule,
    OrganizationModule,
    CashflowModule,
    DebtModule,
  ],
  controllers: [AppController, AuditController],
  providers: [
    AppService,
    AuditService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrganizationMembershipGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
