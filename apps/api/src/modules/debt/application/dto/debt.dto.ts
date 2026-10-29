import { IsNotEmpty, IsEnum, IsNumber, IsDateString, IsOptional, IsUUID, Min, ValidateIf } from 'class-validator';

export enum DebtStatusDto {
  ativa = 'ativa',
  quitada = 'quitada',
}

export class CreateDebtDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsNumber()
  @Min(0.01)
  originalAmount: number;

  @IsOptional()
  @IsNumber()
  interestRateMonth?: number; // Represented as 0.05 for 5%

  @IsOptional()
  @IsNumber()
  totalInstallments?: number;

  @IsOptional()
  @IsNumber()
  installmentAmount?: number;

  @IsDateString()
  startDate: string;

  @IsEnum(DebtStatusDto)
  status: DebtStatusDto;
}

export class UpdateDebtDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  originalAmount?: number;

  @IsOptional()
  @IsNumber()
  interestRateMonth?: number;

  @IsOptional()
  @IsNumber()
  totalInstallments?: number;

  @IsOptional()
  @IsNumber()
  installmentAmount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsEnum(DebtStatusDto)
  status?: DebtStatusDto;
}

export class SimulateDebtDto {
  @IsEnum(['extraPayment', 'targetMonths'])
  simulationType: 'extraPayment' | 'targetMonths';

  @ValidateIf(o => o.simulationType === 'extraPayment')
  @IsNumber()
  @Min(0.01)
  extraPaymentAmount?: number;

  @ValidateIf(o => o.simulationType === 'targetMonths')
  @IsNumber()
  @Min(1)
  targetMonths?: number;
}

