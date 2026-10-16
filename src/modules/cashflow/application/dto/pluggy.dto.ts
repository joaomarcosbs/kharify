import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class RegisterPluggyItemDto {
  @IsNotEmpty()
  @IsString()
  itemId: string;

  @IsOptional()
  @IsNumber()
  connectorId?: number;

  @IsOptional()
  @IsString()
  connectorName?: string;
}
