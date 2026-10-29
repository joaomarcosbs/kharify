import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { OrganizationController } from './infrastructure/controllers/organization.controller';
import { AuthService } from './application/auth.service';
import { OrganizationService } from './application/organization.service';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required. Do not run with a default secret.');
        }
        return {
          secret,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController, OrganizationController],
  providers: [AuthService, OrganizationService, JwtStrategy],
  exports: [AuthService, OrganizationService, JwtModule],
})
export class OrganizationModule {}

