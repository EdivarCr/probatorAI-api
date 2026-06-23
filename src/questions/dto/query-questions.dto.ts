import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '@prisma/client';

export class QueryQuestionsDto {
  @IsOptional()
  @IsString()
  materiaId?: string;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  level?: DifficultyLevel;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
