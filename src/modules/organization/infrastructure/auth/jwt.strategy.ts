import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          let token = null;
          if (req && req.headers && req.headers.cookie) {
            const match = req.headers.cookie.match(/(?:^|;) *kharify_token=([^;]*)/);
            if (match) token = match[1];
          }
          return token;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-default',
    });
  }

  async validate(payload: JwtPayload) {
    return { 
      userId: payload.sub, 
      email: payload.email, 
      organizationId: payload.organizationId 
    };
  }
}
