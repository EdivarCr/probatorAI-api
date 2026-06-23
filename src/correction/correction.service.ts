import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomologarCorrecaoDto } from '../integrations/gemini/dto/approve correction.dto';
import { AlternativeLabel, AnswerKey } from '@prisma/client';

@Injectable()
export class CorrectionService {
  constructor(private readonly prisma: PrismaService) { }

  async executarFluxoCorrecao(dto: HomologarCorrecaoDto) {
    const { examVersionId, questoes: questoesProfessor } = dto;

    const examVersion = await this.prisma.examVersion.findUnique({
      where: { id: examVersionId },
      include: {
        exam: true
      }
    });

    if (!examVersion) {
      throw new NotFoundException('Versão de prova não encontrada.');
    }

    const gabaritoOficial: AnswerKey[] = await this.prisma.answerKey.findMany({
      where: { examVersionId },
      orderBy: { questionPosition: 'asc' },
    });

    if (gabaritoOficial.length === 0) {
      throw new NotFoundException(
        'Gabarito oficial ainda não foi gerado para esta versão de prova.',
      );
    }

    let acertos = 0;
    let erros = 0;
    let emBranco = 0;

    const detalhes = gabaritoOficial.map((oficial) => {
      const revisada = questoesProfessor?.find(
        (q) => q.numero_questao === oficial.questionPosition,
      );

      const alternativaMarcada = revisada?.alternativa_marcada ?? null;
      let status: 'CORRETO' | 'ERRADO' | 'EM_BRANCO' = 'ERRADO';

      if (!alternativaMarcada) {
        status = 'EM_BRANCO';
        emBranco++;
      } else if (
        alternativaMarcada.toUpperCase() === oficial.shuffledLabel.toUpperCase()
      ) {
        status = 'CORRETO';
        acertos++;
      } else {
        erros++;
      }

      return {
        posicao_questao: oficial.questionPosition,
        gabarito_oficial: oficial.shuffledLabel,
        marcada_pelo_aluno: alternativaMarcada,
        status,
      };
    });

    const correction = await this.prisma.$transaction(async (tx) => {
      return tx.examCorrection.create({
        data: {
          examVersionId: examVersion.id,
          totalQuestions: gabaritoOficial.length,
          correctAnswers: acertos,
          wrongAnswers: erros,
          blankAnswers: emBranco,
          finalGrade: acertos,
          answers: {
            create: detalhes.map((detalhe) => ({
              questionPosition: detalhe.posicao_questao,
              officialLabel: detalhe.gabarito_oficial,
              markedLabel: detalhe.marcada_pelo_aluno as AlternativeLabel | null,
              status: detalhe.status,
            })),
          },
        },
        include: {
          answers: {
            orderBy: { questionPosition: 'asc' },
          },
        },
      });
    });

    return correction;
  }

  async getAllCorrections(userId: string) {
    const query = this.prisma.examCorrection.findMany({
      where: {
        examVersion: {
          exam: {
            userId: userId
          }
        }
      }
    });

    if (!query) {
      throw new NotFoundException('Nenhuma correção encontrada para o usuário.');
    }

    return query;
  }

  async getOneCorrection(id: string, userId: string) {
    const query = this.prisma.examCorrection.findUnique({
      where: { id },
      include: {
        examVersion: {
          include: {
            exam: true
          }
        },
        answers: true
      }
    });

    if (!query) {
      throw new NotFoundException('Nenhuma correção encontrada para o usuário.');
    }

    return query;
  }
}
