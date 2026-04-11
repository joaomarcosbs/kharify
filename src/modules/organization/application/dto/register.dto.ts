import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export enum OrganizationTypeDto {
  familia = 'familia',
  mei = 'mei',
  pme = 'pme',
}

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsNotEmpty()
  organizationName: string;

  @IsEnum(OrganizationTypeDto)
  organizationType: OrganizationTypeDto;
}
