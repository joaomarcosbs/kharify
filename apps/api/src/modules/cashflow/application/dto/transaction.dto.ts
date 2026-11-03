import {
  IsEnum,
  IsNumber,
  IsDateString,
  IsOptional,
  IsUUID,
  IsPositive,
} from 'class-validator';

export enum TransactionTypeDto {
  entrada = 'entrada',
  saida = 'saida',
  transferencia = 'transferencia',
}

export enum TransactionOriginDto {
  manual = 'manual',
  open_finance = 'open_finance',
  recorrente = 'recorrente',
}

export class CreateTransactionDto {
  @IsEnum(TransactionTypeDto)
  type: TransactionTypeDto;

  @IsUUID()
  accountId: string;

  @IsOptional()
  @IsUUID()
  accountIdDest?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  costCenterId?: string;

  @IsOptional()
  @IsUUID()
  billId?: string;

  @IsOptional()
  @IsUUID()
  debtId?: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsDateString()
  date: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(TransactionOriginDto)
  origin?: TransactionOriginDto;
}

export class UpdateTransactionDto {
  @IsOptional()
  @IsEnum(TransactionTypeDto)
  type?: TransactionTypeDto;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  accountIdDest?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  costCenterId?: string;

  @IsOptional()
  @IsUUID()
  billId?: string;

  @IsOptional()
  @IsUUID()
  debtId?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(TransactionOriginDto)
  origin?: TransactionOriginDto;
}
