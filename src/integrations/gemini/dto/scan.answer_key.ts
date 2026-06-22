import { IsNotEmpty, IsUUID } from 'class-validator';

export class ScanGabaritoDto {
  @IsNotEmpty()
  @IsUUID('4')
  examVersionId?: string;
}
