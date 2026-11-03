import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../../src/modules/organization/application/auth.service';
import { PrismaService } from '../../../../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      create: jest.fn(),
    },
    userOrganizationRole: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('token-123') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockPrisma.user.findUnique.mockClear();
  });

  describe('register', () => {
    it('deve jogar BadRequestException se email já estiver em uso', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'exists' });

      await expect(
        service.register({
          name: 'João',
          email: 'j@j.com',
          password: 'password1',
          document: '12345678900',
          organizationName: 'Familia',
          organizationType: 'pessoal' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve avançar e iniciar transação de banco se tudo estiver limpo', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue({
        user: { id: 'u1', email: 'j@j.com' },
        org: { id: 'o1' },
      });

      const res = await service.register({
        name: 'João',
        email: 'j@j.com',
        password: 'password1',
        document: '12345678900',
        organizationName: 'Familia',
        organizationType: 'pessoal' as any,
      });

      expect(res.access_token).toBe('token-123');
      expect(res.user.id).toBe('u1');
    });
  });

  // socialLogin foi removido — a autenticação social agora usa loginWithGoogle
  // que verifica tokens diretamente com o google-auth-library.
  // Testes de integração para loginWithGoogle devem ser feitos com mocks do OAuth2Client.
  describe.skip('socialLogin (deprecated)', () => {
    it('foi substituído por loginWithGoogle', () => {
      // Endpoint /auth/social-login removido por questões de segurança.
      // Usar POST /auth/google com idToken verificado via google-auth-library.
    });
  });
});
