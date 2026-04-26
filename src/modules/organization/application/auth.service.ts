import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OrganizationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email }
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
          type: dto.organizationType as OrganizationType,
          document: dto.document ?? null,
        }
      });

      const user = await tx.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash: hash,
        }
      });

      await tx.userOrganizationRole.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: 'owner'
        }
      });

      return { user, org };
    });

    return this.generateToken(result.user.id, result.user.email, result.org.id);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: true }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('This account was created via social login. Please use your social provider to log in.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Assumimos login na primeira organização listada por enquanto para o MVP
    const orgRole = user.roles[0];
    if (!orgRole) {
      throw new UnauthorizedException('User does not belong to any organization');
    }

    return this.generateToken(user.id, user.email, orgRole.organizationId);
  }

  async socialLogin(dto: import('./dto/login.dto').SocialLoginDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: true }
    });

    // 1. User doesn't exist, register dynamically!
    if (!user) {
       const result = await this.prisma.$transaction(async (tx) => {
         const org = await tx.organization.create({
           data: {
             name: 'Minha Organização',
             type: OrganizationType.pessoal,
           }
         });
         
         const payload: any = {
           name: dto.name,
           email: dto.email,
           provider: dto.provider,
         };
         
         if (dto.provider === 'google') payload.googleId = dto.providerId;
         if (dto.provider === 'facebook') payload.facebookId = dto.providerId;
         if (dto.provider === 'apple') payload.appleId = dto.providerId;

         const newUser = await tx.user.create({ data: payload });

         await tx.userOrganizationRole.create({
           data: {
             userId: newUser.id,
             organizationId: org.id,
             role: 'owner'
           }
         });
         return { newUser, org };
       });

       return this.generateToken(result.newUser.id, result.newUser.email, result.org.id);
    }

    // 2. User exists, let's link the provider ID if perfectly matched
    const updatePayload: any = {};
    if (dto.provider === 'google' && !user.googleId) updatePayload.googleId = dto.providerId;
    if (dto.provider === 'facebook' && !user.facebookId) updatePayload.facebookId = dto.providerId;
    if (dto.provider === 'apple' && !user.appleId) updatePayload.appleId = dto.providerId;

    if (Object.keys(updatePayload).length > 0) {
      await this.prisma.user.update({ where: { id: user.id }, data: updatePayload });
    }

    const orgRole = user.roles[0];
    if (!orgRole) throw new UnauthorizedException('User does not belong to any organization');

    return this.generateToken(user.id, user.email, orgRole.organizationId);
  }

  private generateToken(userId: string, email: string, organizationId: string) {
    const payload = { sub: userId, email, organizationId };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, email },
      organizationId
    };
  }
}
