import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { PrismaModule } from './common/prisma/prisma.module';
import configuration from './config/configurations';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationModule } from './modules/organization/organization.module';
import { CashflowModule } from './modules/cashflow/cashflow.module';
import { DebtModule } from './modules/debt/debt.module';

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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
