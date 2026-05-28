import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMateriaDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
