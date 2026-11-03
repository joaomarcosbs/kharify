import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsString,
} from 'class-validator';
import { IsDocument } from '../../../../common/validators/document.validator';

export enum OrganizationTypeDto {
  pessoal = 'pessoal',
  empresarial = 'empresarial',
}

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsNotEmpty()
  organizationName: string;

  @IsEnum(OrganizationTypeDto)
  organizationType: OrganizationTypeDto;

  @IsString()
  @IsDocument({ message: 'O documento informado não é um CPF ou CNPJ válido.' })
  document: string;
}
