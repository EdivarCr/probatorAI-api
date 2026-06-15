import { IsNotEmpty, IsUUID } from 'class-validator';

export class CorrigirGabaritoDto {
  @IsNotEmpty({ message: 'O ID da versão da prova é obrigatório.' })
  @IsUUID('4', { message: 'O ID da versão da prova deve ser um UUID válido.' })
  examVersionId?: string;
}
