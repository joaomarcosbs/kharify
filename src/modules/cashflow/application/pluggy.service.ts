import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PluggyService {
  private baseUrl = 'https://api.pluggy.ai';
  private logger = console;
  constructor(private readonly prisma: any) {}

  private async getPluggyApiKey(): Promise<string> {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      // Sandbox fallback token for development if env variables are not provided
      if (process.env.NODE_ENV === 'production') {
        // Do not allow mock keys in production
        throw new Error('Pluggy credentials are not configured in production');
      }
      this.logger.warn('Using mock sandbox Pluggy API key because credentials are not set');
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
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException('Failed to obtain Pluggy API Key');
      }
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
}
