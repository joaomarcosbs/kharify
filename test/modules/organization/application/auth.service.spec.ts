import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../../src/modules/organization/application/auth.service';
import { PrismaService } from '../../../../src/common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      create: jest.fn()
    },
    userOrganizationRole: {
      create: jest.fn()
    },
    $transaction: jest.fn()
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
          useValue: { sign: jest.fn().mockReturnValue('token-123') }
        }
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
          organizationType: 'pessoal' as any
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('deve avançar e iniciar transação de banco se tudo estiver limpo', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue({ 
          user: { id: 'u1', email: 'j@j.com' }, 
          org: { id: 'o1' } 
      });

      const res = await service.register({
        name: 'João',
        email: 'j@j.com',
        password: 'password1',
        document: '12345678900',
        organizationName: 'Familia',
        organizationType: 'pessoal' as any
      });

      expect(res.access_token).toBe('token-123');
      expect(res.user.id).toBe('u1');
    });
  });

  describe('socialLogin', () => {
    it('deve realizar auto-cadastro quando usuário do Provider não for encontrado na base', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue({ 
          newUser: { id: 'social1', email: 'google@g.com' }, 
          org: { id: 'org-google' } 
      });

      const res = await service.socialLogin({
        provider: 'google' as any,
        providerId: 'google-id-123',
        email: 'google@g.com',
        name: 'Google User',
      });

      expect(res.access_token).toBe('token-123');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('deve vincular conta se usuário já existe mas ainda não tinha o ID do provedor', async () => {
      const existingUser = {
          id: 'u-exists', 
          email: 'j@apple.com', 
          googleId: null, 
          roles: [{ organizationId: 'o1' }] 
      };
      // user.update is not mocked yet, mock it inline 
      mockPrisma.user['update'] = jest.fn().mockResolvedValue({});
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const res = await service.socialLogin({
        provider: 'google' as any,
        providerId: 'g_456',
        email: 'j@apple.com',
        name: 'Apple/Google Merge',
      });

      expect(res.access_token).toBeDefined();
      expect(mockPrisma.user['update']).toHaveBeenCalledWith({
        where: { id: 'u-exists' },
        data: { googleId: 'g_456' }
      });
    });
  });
});

