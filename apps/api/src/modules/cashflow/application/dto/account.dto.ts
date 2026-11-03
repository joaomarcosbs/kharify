import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { AccountType } from '../../domain/account.entity';

export class CreateAccountDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(['conta', 'carteira', 'cartao', 'corretora'])
  type: AccountType;

  @IsNumber()
  initialBalance: number;

  @IsDateString()
  initialBalanceDate: string;
}

export class UpdateAccountDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(['conta', 'carteira', 'cartao', 'corretora'])
  type?: AccountType;
}
