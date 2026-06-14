import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GabaritoResponseSchema } from './gabarito.schema';
import { GeminiService } from './gemini.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScanGabaritoDto } from './dto/scan.answer_key';

@Controller('gabaritos')
export class GeminiController {
  constructor(
    private readonly geminiService: GeminiService,
  ) {}

  @Post('process')
  @UseInterceptors(FileInterceptor('file'))
  async processarGabarito(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ScanGabaritoDto,
  ) {
    const prompt = `
  Analise a imagem deste gabarito de respostas e faça duas tarefas:
  1. Identifique o tipo, cor ou versão da prova (geralmente escrito no topo ou em destaque) e salve no campo 'versao_prova'.
  2. Identifique o número de cada questão e qual alternativa (A, B, C, D ou E) foi preenchida, salvando na lista de 'questoes'.

  Seja extremamente preciso. Se uma questão não tiver marcação, deixe a alternativa como nula.
`;

    if (!file) {
      throw new BadRequestException('Por favor, envie a imagem do gabarito.');
    }

    const resultRaw = await this.geminiService.generateContent(
      prompt,
      GabaritoResponseSchema,
      file,
    );

    const respostaIaRaw = JSON.parse(resultRaw);

    return {
      examVersionId: dto.examVersionId,
      questoes: respostaIaRaw.questoes,
    };
  }
}
