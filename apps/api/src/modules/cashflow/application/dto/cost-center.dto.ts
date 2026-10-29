import { IsNotEmpty, IsEnum, IsOptional, IsString } from 'class-validator';
import { CostCenterType } from '@prisma/client';

export class CreateCostCenterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(CostCenterType)
  type: CostCenterType;
}

export class UpdateCostCenterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(CostCenterType)
  type?: CostCenterType;
}
