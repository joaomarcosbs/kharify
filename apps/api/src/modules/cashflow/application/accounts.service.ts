import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { Account } from '../domain/account.entity';

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, dto: CreateAccountDto): Promise<Account> {
    const data = await this.prisma.rls.account.create({
      data: {
        name: dto.name,
        type: dto.type,
        initialBalance: dto.initialBalance,
        initialBalanceDate: new Date(dto.initialBalanceDate),
        organizationId,
      },
    });

    return new Account(
      data.id,
      data.name,
      data.type as any,
      Number(data.initialBalance),
      data.initialBalanceDate,
      Number(data.initialBalance),
    );
  }

  async findAll(organizationId: string): Promise<Account[]> {
    const accounts = await this.prisma.rls.account.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      accounts.map(async (acc) => {
        const balance = await this.calculateAccountBalance(acc.id, Number(acc.initialBalance), organizationId);
        const entity = new Account(
          acc.id,
          acc.name,
          acc.type as any,
          Number(acc.initialBalance),
          acc.initialBalanceDate,
        );
        entity.setRuntimeBalance(balance);
        return entity;
      }),
    );
  }

  async findOne(organizationId: string, id: string): Promise<Account> {
    const account = await this.prisma.rls.account.findFirst({
      where: { id, organizationId },
    });

    if (!account) throw new NotFoundException('Account not found');

    const balance = await this.calculateAccountBalance(account.id, Number(account.initialBalance), organizationId);

    const entity = new Account(
      account.id,
      account.name,
      account.type as any,
      Number(account.initialBalance),
      account.initialBalanceDate,
    );
    entity.setRuntimeBalance(balance);
    return entity;
  }

  async update(organizationId: string, id: string, dto: UpdateAccountDto): Promise<Account> {
    await this.findOne(organizationId, id);

    const updated = await this.prisma.rls.account.update({
      where: { id },
      data: {
        name: dto.name,
        type: dto.type,
      },
    });

    return this.findOne(organizationId, updated.id);
  }

  async remove(organizationId: string, id: string): Promise<void> {
    await this.findOne(organizationId, id);
    await this.prisma.rls.account.delete({ where: { id } });
  }

  private async calculateAccountBalance(
    accountId: string,
    initialBalance: number,
    organizationId: string,
  ): Promise<number> {
    const rlsClient = this.prisma.rls;

    const incomes = await rlsClient.transaction.aggregate({
      where: { accountId, organizationId, type: 'entrada' },
      _sum: { amount: true },
    });

    const expenses = await rlsClient.transaction.aggregate({
      where: { accountId, organizationId, type: { in: ['saida', 'transferencia'] } },
      _sum: { amount: true },
    });

    const transfersIn = await rlsClient.transaction.aggregate({
      where: { accountIdDest: accountId, organizationId, type: 'transferencia' },
      _sum: { amount: true },
    });

    const sumIncomes = Number(incomes._sum.amount || 0);
    const sumExpenses = Number(expenses._sum.amount || 0);
    const sumTransfersIn = Number(transfersIn._sum.amount || 0);

    return initialBalance + sumIncomes + sumTransfersIn - sumExpenses;
  }
}
