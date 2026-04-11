import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { Account } from '../domain/account.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAccountDto): Promise<Account> {
    const data = await this.prisma.rls.account.create({
      data: {
        name: dto.name,
        type: dto.type,
        initialBalance: dto.initialBalance,
        initialBalanceDate: new Date(dto.initialBalanceDate),
      },
    });

    return new Account(data.id, data.name, data.type as any, Number(data.initialBalance), data.initialBalanceDate, Number(data.initialBalance));
  }

  async findAll(): Promise<Account[]> {
    const accounts = await this.prisma.rls.account.findMany();
    // We can also calculate balances here, but for lists it might be heavy unless grouped. 
    // To do it efficiently for all accounts, we use a groupBy or raw query.
    // For MVP, since we use RLS, doing a fast sum query loop locally is fine, or simple aggregation.

    return Promise.all(accounts.map(async acc => {
      const balance = await this.calculateAccountBalance(acc.id, Number(acc.initialBalance));
      const entity = new Account(acc.id, acc.name, acc.type as any, Number(acc.initialBalance), acc.initialBalanceDate);
      entity.setRuntimeBalance(balance);
      return entity;
    }));
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.prisma.rls.account.findUnique({
      where: { id },
    });

    if (!account) throw new NotFoundException('Account not found');

    const balance = await this.calculateAccountBalance(account.id, Number(account.initialBalance));
    
    const entity = new Account(account.id, account.name, account.type as any, Number(account.initialBalance), account.initialBalanceDate);
    entity.setRuntimeBalance(balance);
    return entity;
  }

  async update(id: string, dto: UpdateAccountDto): Promise<Account> {
    const updated = await this.prisma.rls.account.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
      },
    });

    return this.findOne(updated.id);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.rls.account.delete({ where: { id } });
  }

  private async calculateAccountBalance(accountId: string, initialBalance: number): Promise<number> {
    const rlsClient = this.prisma.rls;
    
    // Sum all incomes
    const incomes = await rlsClient.transaction.aggregate({
      where: { accountId, type: 'entrada' },
      _sum: { amount: true }
    });

    // Sum all expenses
    const expenses = await rlsClient.transaction.aggregate({
      where: { accountId, type: { in: ['saida', 'transferencia'] } },
      _sum: { amount: true }
    });

    // Sum all transfer incomes (where this account is the destination)
    const transfersIn = await rlsClient.transaction.aggregate({
      where: { accountIdDest: accountId, type: 'transferencia' },
      _sum: { amount: true }
    });

    const sumIncomes = Number(incomes._sum.amount || 0);
    const sumExpenses = Number(expenses._sum.amount || 0);
    const sumTransfersIn = Number(transfersIn._sum.amount || 0);

    return initialBalance + sumIncomes + sumTransfersIn - sumExpenses;
  }
}
