import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '@prisma/client';

export class AlternativeImportDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class QuestionImportDto {
  @IsInt()
  index: number;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeImportDto)
  alternatives: AlternativeImportDto[];
}

export class ImportNotebooklmDto {
  @IsOptional()
  @IsString()
  capturedAt?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsEnum(DifficultyLevel)
  level: DifficultyLevel;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionImportDto)
  questions: QuestionImportDto[];
}
