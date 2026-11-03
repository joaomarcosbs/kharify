import { Test, TestingModule } from '@nestjs/testing';
import { PluggyService } from '../../../../src/modules/cashflow/application/pluggy.service';
import { PrismaService } from '../../../../src/common/prisma/prisma.service';

describe('PluggyService', () => {
  let service: PluggyService;

  const mockItem = {
    id: 'item-uuid-1',
    organizationId: 'org-1',
    pluggyItemId: 'pluggy-item-123',
    connectorId: 2,
    connectorName: 'Nubank',
    status: 'UPDATED',
    lastSyncedAt: new Date(),
  };

  const mockPrisma = {
    pluggyItem: {
      findFirst: jest.fn().mockResolvedValue(mockItem),
      findUnique: jest.fn().mockResolvedValue(mockItem),
      upsert: jest.fn().mockResolvedValue(mockItem),
      update: jest.fn().mockResolvedValue(mockItem),
      delete: jest.fn().mockResolvedValue(mockItem),
      findMany: jest.fn().mockResolvedValue([mockItem]),
    },
    account: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockResolvedValue({ id: 'acc-1', name: 'Nubank Conta Corrente' }),
      update: jest.fn().mockResolvedValue({ id: 'acc-1' }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    transaction: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'tx-1' }),
    },
    get rls() {
      return this;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PluggyService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PluggyService>(PluggyService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createConnectToken', () => {
    it('deve gerar connect token (mock em sandbox quando variáveis não configuradas)', async () => {
      const res = await service.createConnectToken('org-1');
      expect(res.accessToken).toBeDefined();
      expect(res.sandbox).toBe(true);
    });
  });

  describe('registerItem', () => {
    it('deve registrar o PluggyItem e realizar a sincronização inicial com idempotência', async () => {
      mockPrisma.pluggyItem.findFirst.mockResolvedValueOnce(mockItem);
      mockPrisma.pluggyItem.upsert.mockResolvedValueOnce(mockItem);

      const item = await service.registerItem('org-1', {
        itemId: 'pluggy-item-123',
        connectorId: 2,
        connectorName: 'Nubank',
      });

      expect(item).toBeDefined();
      expect(mockPrisma.pluggyItem.upsert).toHaveBeenCalledTimes(1);
      expect(mockPrisma.account.create).toHaveBeenCalled();
      expect(mockPrisma.transaction.create).toHaveBeenCalled();
    });
  });

  describe('handleWebhook', () => {
    it('deve atualizar o status do item ao receber evento de webhook', async () => {
      mockPrisma.pluggyItem.findUnique.mockResolvedValueOnce(mockItem);
      mockPrisma.pluggyItem.update.mockResolvedValueOnce({
        ...mockItem,
        status: 'UPDATED',
      });

      const res = await service.handleWebhook({
        event: 'item/updated',
        itemId: 'pluggy-item-123',
        data: { status: 'UPDATED' },
      });

      expect(res.success).toBe(true);
      expect(mockPrisma.pluggyItem.update).toHaveBeenCalled();
    });
  });
});
