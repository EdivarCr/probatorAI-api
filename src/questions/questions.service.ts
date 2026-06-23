import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DifficultyLevel } from '@prisma/client';
import { QueryQuestionsDto } from './dto/query-questions.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryQuestionsDto) {
    const { materiaId, level } = query;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    return await this.prisma.question.findMany({
      where: {
        ...(materiaId && { materiaId }),
        ...(level && { level }),
        archivedAt: null,
      },
      include: { alternatives: { orderBy: { originalLabel: 'asc' } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    try {
      const question = await this.prisma.question.findUnique({
        where: { id },
        include: { alternatives: { orderBy: { originalLabel: 'asc' } } },
      });

      if (!question) throw new NotFoundException('Questão não encontrada');

      return question;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao buscar questão');
    }
  }

  async archive(id: string) {
    await this.findOne(id);
    return this.prisma.question.update({
      where: { id },
      data: { archivedAt: new Date() },
    });
  }

  async pickRandom(
    materiaId: string,
    count: number,
    level?: DifficultyLevel,
  ) {
    const questions = await this.prisma.question.findMany({
      where: { materiaId, archivedAt: null, ...(level && { level }) },
      include: { alternatives: true },
    });

    if (questions.length < count) {
      throw new NotFoundException(
        `Não há questões suficientes. Disponíveis: ${questions.length}, solicitadas: ${count}`,
      );
    }

    return questions
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  }
}
