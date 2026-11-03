import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from '../../../../src/modules/cashflow/application/accounts.service';
import { PrismaService } from '../../../../src/common/prisma/prisma.service';

describe('AccountsService', () => {
  let service: AccountsService;

  // Fake aggregate response
  const mockAggregate = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: PrismaService,
          useValue: {
            rls: {
              account: {
                findFirst: jest.fn().mockResolvedValue({
                  id: 'acc-1',
                  name: 'Teste',
                  type: 'conta',
                  initialBalance: 1000,
                  initialBalanceDate: new Date(),
                }),
                findUnique: jest.fn().mockResolvedValue({
                  id: 'acc-1',
                  name: 'Teste',
                  type: 'conta',
                  initialBalance: 1000,
                  initialBalanceDate: new Date(),
                }),
              },
              transaction: {
                aggregate: mockAggregate,
              },
            },
          },
        },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
    mockAggregate.mockClear();
  });

  describe('findOne - Saldo Dinamico', () => {
    it('deve somar initialBalance com entradas e abater saídas via aggregator', async () => {
      // Mock para as três queries: incomes, expenses, transfersIn
      mockAggregate
        .mockResolvedValueOnce({ _sum: { amount: 500 } }) // incomes
        .mockResolvedValueOnce({ _sum: { amount: 200 } }) // expenses
        .mockResolvedValueOnce({ _sum: { amount: 0 } }); // transfersIn

      const account = await service.findOne('org-1', 'acc-1');

      // Calculation: initial(1000) + in(500) + transfers(0) - out(200) = 1300
      expect(account.runtimeBalance).toBe(1300);
      expect(mockAggregate).toHaveBeenCalledTimes(3);
    });
  });
});
