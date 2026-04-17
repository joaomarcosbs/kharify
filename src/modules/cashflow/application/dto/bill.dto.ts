import { IsNotEmpty, IsEnum, IsNumber, IsDateString, IsOptional, IsUUID, Min } from 'class-validator';

export enum BillTypeDto {
  pagar = 'pagar',
  receber = 'receber',
}

export enum BillStatusDto {
  aberta = 'aberta',
  parcial = 'parcial',
  paga = 'paga',
  atrasada = 'atrasada',
}

export enum BillRecurrenceDto {
  nenhuma = 'nenhuma',
  mensal = 'mensal',
  anual = 'anual',
}

export class CreateBillDto {
  @IsEnum(BillTypeDto)
  type: BillTypeDto;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  costCenterId?: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsEnum(BillStatusDto)
  status?: BillStatusDto;

  @IsOptional()
  @IsEnum(BillRecurrenceDto)
  recurrence?: BillRecurrenceDto;

  @IsOptional()
  description?: string;
}

export class UpdateBillDto {
  @IsOptional()
  @IsEnum(BillTypeDto)
  type?: BillTypeDto;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsUUID()
  costCenterId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsEnum(BillStatusDto)
  status?: BillStatusDto;

  @IsOptional()
  @IsEnum(BillRecurrenceDto)
  recurrence?: BillRecurrenceDto;

  @IsOptional()
  description?: string;
}
