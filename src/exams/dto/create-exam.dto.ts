import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExamDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  materiaId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
