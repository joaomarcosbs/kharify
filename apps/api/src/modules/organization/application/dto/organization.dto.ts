import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  MinLength,
} from 'class-validator';
import { OrganizationType, UserRole } from '@prisma/client';
import { IsDocument } from '../../../../common/validators/document.validator';

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
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @IsDocument({ message: 'O CPF informado não é válido.' })
  document: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}
