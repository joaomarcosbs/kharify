import { Module } from '@nestjs/common';
import { AccountsService } from './application/accounts.service';
import { BillsService } from './application/bills.service';
import { CategoriesService } from './application/categories.service';
import { TransactionsService } from './application/transactions.service';
import { AccountsController } from './infrastructure/controllers/accounts.controller';
import { BillsController } from './infrastructure/controllers/bills.controller';
import { CategoriesController } from './infrastructure/controllers/categories.controller';
import { TransactionsController } from './infrastructure/controllers/transactions.controller';

@Module({
  imports: [],
  controllers: [AccountsController, BillsController, CategoriesController, TransactionsController],
  providers: [AccountsService, BillsService, CategoriesService, TransactionsService],
})
export class CashflowModule {}

