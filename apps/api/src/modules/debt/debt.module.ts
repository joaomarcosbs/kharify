import { Module } from '@nestjs/common';
import { DebtsController } from './infrastructure/controllers/debts.controller';
import { DebtsService } from './application/debts.service';

@Module({
  imports: [],
  controllers: [DebtsController],
  providers: [DebtsService],
})
export class DebtModule {}
