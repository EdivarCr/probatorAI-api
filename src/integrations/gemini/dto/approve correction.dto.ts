// homologar-correcao.dto.ts
import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class QuestaoRevisadaDto {
  @IsNotEmpty()
  @IsInt()
  numero_questao?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1)
  alternativa_marcada?: string | null;
}

export class HomologarCorrecaoDto {
  @IsNotEmpty()
  @IsUUID('4')
  examVersionId?: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestaoRevisadaDto)
  questoes?: QuestaoRevisadaDto[];
}
