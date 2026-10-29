import { Module } from '@nestjs/common';
import { AccountsService } from './application/accounts.service';
import { BillsService } from './application/bills.service';
import { CategoriesService } from './application/categories.service';
import { CostCentersService } from './application/cost-centers.service';
import { TransactionsService } from './application/transactions.service';
import { DashboardService } from './application/dashboard.service';
import { PluggyService } from './application/pluggy.service';
import { AccountsController } from './infrastructure/controllers/accounts.controller';
import { BillsController } from './infrastructure/controllers/bills.controller';
import { CategoriesController } from './infrastructure/controllers/categories.controller';
import { CostCentersController } from './infrastructure/controllers/cost-centers.controller';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';
import { PluggyController } from './infrastructure/controllers/pluggy.controller';

@Module({
  imports: [],
  controllers: [
    AccountsController,
    BillsController,
    CategoriesController,
    CostCentersController,
    TransactionsController,
    DashboardController,
    PluggyController,
  ],
  providers: [
    AccountsService,
    BillsService,
    CategoriesService,
    CostCentersService,
    TransactionsService,
    DashboardService,
    PluggyService,
  ],
  exports: [
    AccountsService,
    BillsService,
    CategoriesService,
    CostCentersService,
    TransactionsService,
    DashboardService,
    PluggyService,
  ],
})
export class CashflowModule {}
