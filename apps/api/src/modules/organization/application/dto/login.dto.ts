import { IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

export enum ProviderDto {
  google = 'google',
  facebook = 'facebook',
  apple = 'apple',
}

export class SocialLoginDto {
  @IsEnum(ProviderDto)
  provider: ProviderDto;

  @IsNotEmpty()
  providerId: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;
}
