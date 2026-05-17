import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlternativeLabel } from '@prisma/client';
import { ImportNotebooklmDto } from './dto/import-notebooklm.dto';

const VALID_LABELS: AlternativeLabel[] = ['A', 'B', 'C', 'D', 'E'];

@Injectable()
export class ImportService {
  constructor(private prisma: PrismaService) {}

  async importFromNotebooklm(dto: ImportNotebooklmDto) {
    const materia = await this.prisma.materia.findUnique({
      where: { name: dto.subject },
    });
    if (!materia) {
      throw new NotFoundException(
        `Matéria "${dto.subject}" não encontrada. Crie a matéria antes de importar.`,
      );
    }

    const capturedAt = dto.capturedAt ? new Date(dto.capturedAt) : null;
    const imported: string[] = [];
    const skipped: string[] = [];

    for (const q of dto.questions) {
      const existing = await this.prisma.question.findFirst({
        where: { materiaId: materia.id, statement: q.question },
      });

      if (existing) {
        skipped.push(q.question.slice(0, 60));
        continue;
      }

      try {
        await this.prisma.question.create({
          data: {
            materiaId: materia.id,
            statement: q.question,
            level: dto.level,
            importedFrom: dto.source ?? null,
            sourceUrl: dto.url ?? null,
            sourceIndex: q.index,
            sourceCapturedAt: capturedAt,
            alternatives: {
              create: q.alternatives.map((alt) => ({
                originalLabel: this.parseLabel(alt.label),
                text: alt.text,
                explanation: alt.explanation ?? null,
                isCorrect: alt.isCorrect,
              })),
            },
          },
        });
        imported.push(q.question.slice(0, 60));
      } catch {
        throw new InternalServerErrorException(
          `Erro ao importar questão ${q.index}`,
        );
      }
    }

    return {
      materiaId: materia.id,
      materia: materia.name,
      imported: imported.length,
      skipped: skipped.length,
      details: { imported, skipped },
    };
  }

  private parseLabel(label: string): AlternativeLabel {
    const upper = label.toUpperCase() as AlternativeLabel;
    if (!VALID_LABELS.includes(upper)) {
      throw new ConflictException(`Label inválido: ${label}. Use A-E.`);
    }
    return upper;
  }
}
