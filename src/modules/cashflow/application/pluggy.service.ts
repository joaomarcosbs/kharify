import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RegisterPluggyItemDto } from './dto/pluggy.dto';
import { AccountType, TransactionType, TransactionOrigin } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class PluggyService {
  private readonly logger = new Logger(PluggyService.name);
  private readonly baseUrl = 'https://api.pluggy.ai';

  constructor(private readonly prisma: PrismaService) {}

  private async getPluggyApiKey(): Promise<string> {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      // Sandbox fallback token for development if env variables are not provided
      return 'mock-sandbox-pluggy-key';
    }

    try {
      const response = await axios.post(`${this.baseUrl}/auth`, {
        clientId,
        clientSecret,
      });
      return response.data.apiKey;
    } catch (err: any) {
      this.logger.error(`Failed to obtain Pluggy API Key: ${err.message}`);
      return 'mock-sandbox-pluggy-key';
    }
  }

  async createConnectToken(organizationId: string) {
    const apiKey = await this.getPluggyApiKey();

    if (apiKey === 'mock-sandbox-pluggy-key') {
      return {
        accessToken: `mock-connect-token-${organizationId}-${Date.now()}`,
        sandbox: true,
      };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/connect_token`,
        { clientUserId: organizationId },
        { headers: { 'X-API-KEY': apiKey } }
      );
      return response.data;
    } catch (err: any) {
      throw new BadRequestException(`Pluggy connect token generation failed: ${err.message}`);
    }
  }

  async registerItem(organizationId: string, dto: RegisterPluggyItemDto) {
    let connectorId = dto.connectorId;
    let connectorName = dto.connectorName;

    const apiKey = await this.getPluggyApiKey();

    if ((!connectorId || !connectorName) && apiKey !== 'mock-sandbox-pluggy-key') {
      try {
        const resp = await axios.get(`${this.baseUrl}/items/${dto.itemId}`, {
          headers: { 'X-API-KEY': apiKey },
        });
        connectorId = resp.data?.connector?.id ?? connectorId;
        connectorName = resp.data?.connector?.name ?? connectorName;
      } catch (err: any) {
        this.logger.warn(`Could not fetch connector metadata from Pluggy: ${err.message}`);
      }
    }

    if (!connectorName) {
      connectorName = 'Banco Conectado (Open Finance)';
      connectorId = connectorId || 1;
    }

    const item = await this.prisma.pluggyItem.upsert({
      where: { pluggyItemId: dto.itemId },
      create: {
        organizationId,
        pluggyItemId: dto.itemId,
        connectorId: connectorId || 0,
        connectorName: connectorName,
        status: 'UPDATED',
        lastSyncedAt: new Date(),
      },
      update: {
        organizationId,
        connectorId: connectorId || 0,
        connectorName: connectorName,
        status: 'UPDATED',
        lastSyncedAt: new Date(),
      },
    });

    // Run initial sync
    try {
      await this.syncItem(organizationId, dto.itemId);
    } catch (err: any) {
      this.logger.warn(`Initial sync failed for item ${dto.itemId}: ${err.message}`);
    }

    return item;
  }

  async syncItem(organizationId: string, pluggyItemId: string) {
    const item = await this.prisma.pluggyItem.findFirst({
      where: { pluggyItemId, organizationId },
    });

    if (!item) {
      throw new NotFoundException('Pluggy bank connection item not found');
    }

    const apiKey = await this.getPluggyApiKey();

    if (apiKey === 'mock-sandbox-pluggy-key') {
      return this.syncMockSandboxItem(organizationId, item);
    }

    try {
      // 1. Fetch normalized accounts from Pluggy
      const accountsResp = await axios.get(`${this.baseUrl}/accounts?itemId=${pluggyItemId}`, {
        headers: { 'X-API-KEY': apiKey },
      });

      const rawAccounts = accountsResp.data?.results ?? accountsResp.data;
      const pluggyAccounts = Array.isArray(rawAccounts) ? rawAccounts : [];
      let totalTransactionsSynced = 0;

      for (const pAcc of pluggyAccounts) {
        // Map account type
        let accountType: AccountType = AccountType.conta;
        if (pAcc.type === 'CREDIT' || pAcc.subtype === 'CREDIT_CARD') {
          accountType = AccountType.cartao;
        } else if (pAcc.subtype === 'INVESTMENT') {
          accountType = AccountType.corretora;
        }

        // Upsert account in Kharify
        let localAccount = await this.prisma.account.findFirst({
          where: { pluggyAccountId: pAcc.id },
        });

        const accountName = pAcc.name || `${item.connectorName} ${pAcc.number || ''}`.trim();

        if (!localAccount) {
          localAccount = await this.prisma.account.create({
            data: {
              organizationId,
              name: accountName,
              type: accountType,
              initialBalance: pAcc.balance != null ? Number(pAcc.balance) : 0,
              initialBalanceDate: new Date(),
              pluggyAccountId: pAcc.id,
              pluggyItemId: pluggyItemId,
            },
          });
        } else {
          localAccount = await this.prisma.account.update({
            where: { id: localAccount.id },
            data: {
              pluggyItemId: pluggyItemId,
              name: accountName,
            },
          });
        }

        // 2. Fetch normalized transactions for this account
        const txResp = await axios.get(
          `${this.baseUrl}/transactions?accountId=${pAcc.id}&pageSize=500`,
          { headers: { 'X-API-KEY': apiKey } }
        );

        const rawTx = txResp.data?.results ?? txResp.data;
        const pluggyTransactions = Array.isArray(rawTx) ? rawTx : [];

        for (const pTx of pluggyTransactions) {
          // Check for existing transaction using unique pluggyTransactionId
          const existingTx = await this.prisma.transaction.findFirst({
            where: { pluggyTransactionId: pTx.id },
          });

          const txType: TransactionType =
            pTx.type === 'DEBIT' ? TransactionType.saida : TransactionType.entrada;
          const txAmount = Math.abs(Number(pTx.amount || 0));
          const txDate = pTx.date ? new Date(pTx.date) : new Date();
          const txDesc = pTx.description || pTx.rawDescription || 'Transação Open Finance';

          if (!existingTx) {
            await this.prisma.transaction.create({
              data: {
                organizationId,
                accountId: localAccount.id,
                type: txType,
                amount: txAmount,
                date: txDate,
                description: txDesc,
                origin: TransactionOrigin.open_finance,
                pluggyTransactionId: pTx.id,
              },
            });
            totalTransactionsSynced++;
          }
        }
      }

      // Update item status and timestamp
      await this.prisma.pluggyItem.update({
        where: { id: item.id },
        data: {
          status: 'UPDATED',
          lastSyncedAt: new Date(),
        },
      });

      return {
        success: true,
        syncedAccounts: pluggyAccounts.length,
        syncedTransactions: totalTransactionsSynced,
      };
    } catch (err: any) {
      this.logger.error(`Pluggy sync failed: ${err.message}`);
      await this.prisma.pluggyItem.update({
        where: { id: item.id },
        data: { status: 'SYNC_ERROR' },
      });
      throw new BadRequestException(`Failed to sync Pluggy data: ${err.message}`);
    }
  }

  private async syncMockSandboxItem(organizationId: string, item: any) {
    const mockAccountId = `mock-acc-${item.pluggyItemId}`;

    let localAccount = await this.prisma.account.findFirst({
      where: { pluggyAccountId: mockAccountId },
    });

    if (!localAccount) {
      localAccount = await this.prisma.account.create({
        data: {
          organizationId,
          name: `${item.connectorName} Conta Corrente`,
          type: AccountType.conta,
          initialBalance: 2850.5,
          initialBalanceDate: new Date(),
          pluggyAccountId: mockAccountId,
          pluggyItemId: item.pluggyItemId,
        },
      });
    }

    const mockTransactions = [
      {
        id: `mock-tx-1-${item.pluggyItemId}`,
        type: TransactionType.entrada,
        amount: 3500.0,
        description: 'TED Recebida - Prestação de Serviços',
        date: new Date(),
      },
      {
        id: `mock-tx-2-${item.pluggyItemId}`,
        type: TransactionType.saida,
        amount: 189.9,
        description: 'Supermercado Pão de Açúcar',
        date: new Date(Date.now() - 86400000),
      },
      {
        id: `mock-tx-3-${item.pluggyItemId}`,
        type: TransactionType.saida,
        amount: 45.0,
        description: 'Posto Shell Combustível',
        date: new Date(Date.now() - 172800000),
      },
    ];

    let createdCount = 0;
    for (const mockTx of mockTransactions) {
      const exists = await this.prisma.transaction.findFirst({
        where: { pluggyTransactionId: mockTx.id },
      });

      if (!exists) {
        await this.prisma.transaction.create({
          data: {
            organizationId,
            accountId: localAccount.id,
            type: mockTx.type,
            amount: mockTx.amount,
            date: mockTx.date,
            description: mockTx.description,
            origin: TransactionOrigin.open_finance,
            pluggyTransactionId: mockTx.id,
          },
        });
        createdCount++;
      }
    }

    await this.prisma.pluggyItem.update({
      where: { id: item.id },
      data: {
        status: 'UPDATED',
        lastSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      syncedAccounts: 1,
      syncedTransactions: createdCount,
      sandbox: true,
    };
  }

  async syncItemById(organizationId: string, id: string) {
    const item = await this.prisma.pluggyItem.findFirst({
      where: { id, organizationId },
    });

    if (!item) {
      throw new NotFoundException('Pluggy bank connection item not found');
    }

    return this.syncItem(organizationId, item.pluggyItemId);
  }

  async handleWebhook(payload: any) {
    const { event, itemId, data } = payload;
    if (!itemId) return { success: true, message: 'Ignored payload without itemId' };

    const existingItem = await this.prisma.pluggyItem.findUnique({
      where: { pluggyItemId: itemId },
    });

    if (existingItem) {
      await this.prisma.pluggyItem.update({
        where: { id: existingItem.id },
        data: {
          status: data?.status || 'UPDATED',
          lastSyncedAt: new Date(),
        },
      });

      // Auto-sync when transactions or items are updated
      if (
        event === 'transactions/created' ||
        event === 'item/updated' ||
        event === 'item/created'
      ) {
        this.syncItem(existingItem.organizationId, itemId).catch((err) => {
          this.logger.error(`Webhook auto-sync failed for item ${itemId}: ${err.message}`);
        });
      }
    }

    return { success: true, event, itemId };
  }

  async getItems(organizationId: string) {
    return this.prisma.pluggyItem.findMany({
      where: { organizationId },
      include: {
        accounts: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteItem(organizationId: string, id: string) {
    const item = await this.prisma.pluggyItem.findFirst({
      where: { id, organizationId },
    });

    if (!item) {
      throw new NotFoundException('Pluggy bank connection item not found');
    }

    // Call Pluggy API DELETE /items/{id} to revoke bank credentials on Pluggy server
    const apiKey = await this.getPluggyApiKey();
    if (apiKey !== 'mock-sandbox-pluggy-key') {
      try {
        await axios.delete(`${this.baseUrl}/items/${item.pluggyItemId}`, {
          headers: { 'X-API-KEY': apiKey },
        });
      } catch (err: any) {
        this.logger.warn(`Pluggy API item deletion returned warning: ${err.message}`);
      }
    }

    // Unlink any accounts linked to this pluggyItemId
    await this.prisma.account.updateMany({
      where: { pluggyItemId: item.pluggyItemId },
      data: { pluggyItemId: null },
    });

    // Delete local database item
    await this.prisma.pluggyItem.delete({
      where: { id: item.id },
    });

    return { message: 'Bank item connection deleted successfully' };
  }
}
