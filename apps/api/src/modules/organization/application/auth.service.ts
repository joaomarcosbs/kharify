import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OrganizationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(googleClientId);
  }

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.password, salt);

    // Usa transaction sem RLS (pois o usuário ainda não logou)
    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          type: dto.organizationType,
          document: dto.document ?? null,
        },
      });

      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash: hash,
        },
      });

      await tx.userOrganizationRole.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: 'owner',
        },
      });

      return { user, org };
    });

    return this.generateToken(result.user.id, result.user.email, result.org.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'This account was created via social login. Please use your social provider to log in.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Assumimos login na primeira organização listada por enquanto para o MVP
    const orgRole = user.roles[0];
    if (!orgRole) {
      throw new UnauthorizedException(
        'User does not belong to any organization',
      );
    }

    return this.generateToken(user.id, user.email, orgRole.organizationId);
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        avatarUrl: true,
        provider: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (dto.newPassword) {
      if (!dto.currentPassword || !user.passwordHash) {
        throw new BadRequestException('A senha atual é obrigatória.');
      }
      const validPassword = await bcrypt.compare(
        dto.currentPassword,
        user.passwordHash,
      );
      if (!validPassword)
        throw new BadRequestException('A senha atual está incorreta.');
    }

    if (dto.email && dto.email !== user.email) {
      const emailInUse = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (emailInUse)
        throw new BadRequestException('Este e-mail já está em uso.');
    }

    const passwordHash = dto.newPassword
      ? await bcrypt.hash(dto.newPassword, await bcrypt.genSalt())
      : undefined;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        document: dto.document,
        avatarUrl: dto.avatarUrl,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
        avatarUrl: true,
        provider: true,
        createdAt: true,
      },
    });
  }

  async loginWithGoogle(idToken: string) {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!googleClientId) {
      throw new BadRequestException(
        'Login com Google não configurado nesta instância do Kharify (GOOGLE_CLIENT_ID ausente no .env).',
      );
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (err: any) {
      this.logger.error(`Falha ao verificar idToken do Google: ${err.message}`);
      throw new UnauthorizedException(
        'Token de autenticação do Google inválido ou expirado.',
      );
    }

    if (!payload || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException('Conta Google sem e-mail verificado.');
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || 'Usuário Google';
    const googleId = payload.sub;

    // 1. Busca usuário existente pelo Google ID ou e-mail
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
      include: { roles: true },
    });

    // 2. Se for novo usuário, cria dinamicamente usuário + organização pessoal
    if (!user) {
      const result = await this.prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: `${name.split(' ')[0]} Família`,
            type: OrganizationType.pessoal,
          },
        });

        const newUser = await tx.user.create({
          data: {
            name,
            email,
            provider: 'google',
            googleId,
          },
        });

        await tx.userOrganizationRole.create({
          data: {
            userId: newUser.id,
            organizationId: org.id,
            role: 'owner',
          },
        });

        return { newUser, org };
      });

      return this.generateToken(
        result.newUser.id,
        result.newUser.email,
        result.org.id,
      );
    }

    // 3. Usuário já existia: vincula googleId se ainda não estava vinculado
    if (!user.googleId) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const orgRole = user.roles[0];
    if (!orgRole) {
      throw new UnauthorizedException(
        'Usuário não pertence a nenhuma organização',
      );
    }

    return this.generateToken(user.id, user.email, orgRole.organizationId);
  }

  socialLogin(_dto: any) {
    void _dto;
    throw new BadRequestException(
      'Endpoint desativado por segurança. Utilize /v1/auth/google enviando um idToken válido emitido pelo Google.',
    );
  }

  private generateToken(userId: string, email: string, organizationId: string) {
    const payload = { sub: userId, email, organizationId };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, email },
      organizationId,
    };
  }
}
