import { IsInt, IsOptional, IsEnum, Min, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '@prisma/client';

export class GenerateVersionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(2)
  versionCount: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  questionCount: number;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  level?: DifficultyLevel;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  versionLabels?: string[];
}
