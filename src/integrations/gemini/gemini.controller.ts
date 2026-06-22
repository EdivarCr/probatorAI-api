import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GabaritoResponse, GabaritoResponseSchema } from './gabarito.schema';
import { GeminiService } from './gemini.service';
import { ScanGabaritoDto } from './dto/scan.answer_key';
import { PrismaService } from '../../prisma/prisma.service';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function labelsCorrespondem(extraido: string, salvo: string): boolean {
  const a = extraido.trim().toUpperCase();
  const b = salvo.trim().toUpperCase();
  return a.includes(b) || b.includes(a);
}

@Controller('gabaritos')
export class GeminiController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('process')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Formato de imagem não suportado. Envie um arquivo JPEG, PNG ou WEBP.',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async processarGabarito(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ScanGabaritoDto,
  ) {
    if (!file) {
      throw new BadRequestException('Por favor, envie a imagem do gabarito.');
    }

    const examVersion = await this.prisma.examVersion.findUnique({
      where: { id: dto.examVersionId },
    });

    if (!examVersion) {
      throw new NotFoundException('Versão de prova não encontrada.');
    }

    const prompt = `
  Analise a imagem deste gabarito de respostas e faça duas tarefas:
  1. Identifique o tipo, cor ou versão da prova (geralmente escrito no topo ou em destaque) e salve no campo 'versao_prova'.
  2. Identifique o número de cada questão e qual alternativa (A, B, C, D ou E) foi preenchida, salvando na lista de 'questoes'.

  Seja extremamente preciso. Se uma questão não tiver marcação, deixe a alternativa como nula.
`;

    const resultRaw = await this.geminiService.generateContent(
      prompt,
      GabaritoResponseSchema,
      file,
    );

    let respostaIa: GabaritoResponse;
    try {
      respostaIa = JSON.parse(resultRaw);
    } catch {
      throw new BadRequestException(
        'Não foi possível interpretar a resposta da IA para este gabarito.',
      );
    }

    if (
      respostaIa.versao_prova &&
      !labelsCorrespondem(respostaIa.versao_prova, examVersion.versionLabel)
    ) {
      throw new BadRequestException(
        `A versão identificada no gabarito ("${respostaIa.versao_prova}") não corresponde à versão da prova selecionada ("${examVersion.versionLabel}").`,
      );
    }

    return {
      examVersionId: dto.examVersionId,
      versao_prova: respostaIa.versao_prova,
      questoes: respostaIa.questoes,
    };
  }
}
