import { IsNotEmpty, IsEnum, IsOptional, IsString, IsEmail } from 'class-validator';
import { OrganizationType, UserRole } from '@prisma/client';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(OrganizationType)
  type: OrganizationType;

  @IsOptional()
  @IsString()
  document?: string;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @IsOptional()
  @IsString()
  document?: string;
}

export class AddMemberDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(UserRole)
  role: UserRole;
}
