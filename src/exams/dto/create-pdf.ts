import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExamPdfDto {
  @IsNotEmpty()
  @IsString()
  schoolName: string;
}
