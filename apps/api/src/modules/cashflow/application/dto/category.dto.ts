import { IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum CategoryKindDto {
  receita = 'receita',
  despesa = 'despesa',
}

export enum CategoryGroupTypeDto {
  essencial = 'essencial',
  necessario = 'necessario',
  superfluo = 'superfluo',
}

export class CreateCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsEnum(CategoryKindDto)
  kind: CategoryKindDto;

  @IsEnum(CategoryGroupTypeDto)
  groupType: CategoryGroupTypeDto;
}

export class UpdateCategoryDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(CategoryKindDto)
  kind?: CategoryKindDto;

  @IsOptional()
  @IsEnum(CategoryGroupTypeDto)
  groupType?: CategoryGroupTypeDto;
}
