import { IsNotEmpty, IsString } from 'class-validator';

export class ReplaceQuestionDto {
  @IsNotEmpty()
  @IsString()
  replacementQuestionId: string;
}
