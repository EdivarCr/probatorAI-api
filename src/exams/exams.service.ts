import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionsService } from '../questions/questions.service';
import { AlternativeLabel, ExamStatus } from '@prisma/client';
import { CreateExamDto } from './dto/create-exam.dto';
import { GenerateVersionsDto } from './dto/generate-versions.dto';
import { ReplaceQuestionDto } from './dto/replace-question.dto';

const LABEL_MAP: AlternativeLabel[] = ['A', 'B', 'C', 'D', 'E'];

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Injectable()
export class ExamsService {
  constructor(
    private prisma: PrismaService,
    private questionsService: QuestionsService,
  ) {}

  async create(dto: CreateExamDto) {
    const materia = await this.prisma.materia.findUnique({ where: { id: dto.materiaId } });
    if (!materia) throw new NotFoundException('Matéria não encontrada');

    return this.prisma.exam.create({
      data: { title: dto.title, description: dto.description, materiaId: dto.materiaId },
    });
  }

  async findOne(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { versions: { orderBy: { versionLabel: 'asc' } }, materia: true },
    });
    if (!exam) throw new NotFoundException('Prova não encontrada');
    return exam;
  }

  async findAll(materiaId?: string) {
    return this.prisma.exam.findMany({
      where: { ...(materiaId && { materiaId }) },
      include: { materia: true, versions: { select: { id: true, versionLabel: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateVersions(examId: string, dto: GenerateVersionsDto) {
    const exam = await this.findOne(examId);

    const questions = await this.questionsService.pickRandom(
      exam.materiaId,
      dto.questionCount,
      dto.level,
    );

    for (const q of questions) {
      const correct = q.alternatives.find((a) => a.isCorrect);
      if (!correct) {
        throw new BadRequestException(
          `A questão "${q.statement.slice(0, 50)}..." não possui nenhuma alternativa correta configurada.`,
        );
      }
    }

    const labels = dto.versionLabels?.length === dto.versionCount
      ? dto.versionLabels
      : Array.from({ length: dto.versionCount }, (_, i) =>
          String.fromCharCode(65 + i),
        );

    const versions = await this.prisma.$transaction(
      labels.map((versionLabel) => {
        const shuffledQuestions = fisherYates(questions);

        const examVersionQuestionsData = shuffledQuestions.map((q, qIdx) => {
          const shuffledAlternatives = fisherYates(q.alternatives);
          const correctAlt = q.alternatives.find((a) => a.isCorrect)!;
          const shuffledIdx = shuffledAlternatives.findIndex((a) => a.id === correctAlt.id);

          return {
            questionId: q.id,
            questionPosition: qIdx + 1,
            originalLabel: correctAlt.originalLabel,
            shuffledLabel: LABEL_MAP[shuffledIdx],
            alternatives: shuffledAlternatives,
          };
        });

        return this.prisma.examVersion.create({
          data: {
            examId,
            versionLabel,
            questions: {
              create: examVersionQuestionsData.map(({ questionId, questionPosition, alternatives }) => ({
                questionId,
                questionPosition,
                alternatives: {
                  create: alternatives.map((alt, altIdx) => ({
                    alternativeId: alt.id,
                    alternativePosition: altIdx,
                  })),
                },
              })),
            },
            answerKeys: {
              create: examVersionQuestionsData.map(({ questionId, questionPosition, originalLabel, shuffledLabel }) => ({
                questionId,
                questionPosition,
                originalLabel,
                shuffledLabel,
              })),
            },
          },
          include: { answerKeys: { orderBy: { questionPosition: 'asc' } } },
        });
      }),
    );

    await this.prisma.exam.update({
      where: { id: examId },
      data: { status: ExamStatus.generated },
    });

    return versions;
  }

  async regenerate(examId: string, dto: GenerateVersionsDto) {
    await this.findOne(examId);
    await this.prisma.examVersion.deleteMany({ where: { examId } });
    await this.prisma.exam.update({ where: { id: examId }, data: { status: ExamStatus.draft } });
    return this.generateVersions(examId, dto);
  }

  async getVersion(versionId: string) {
    const version = await this.prisma.examVersion.findUnique({
      where: { id: versionId },
      include: {
        questions: {
          orderBy: { questionPosition: 'asc' },
          include: {
            question: true,
            alternatives: {
              orderBy: { alternativePosition: 'asc' },
              include: { alternative: { select: { id: true, text: true } } },
            },
          },
        },
      },
    });
    if (!version) throw new NotFoundException('Versão não encontrada');
    return version;
  }

  async getAnswerKey(versionId: string) {
    const version = await this.prisma.examVersion.findUnique({
      where: { id: versionId },
      include: {
        answerKeys: {
          orderBy: { questionPosition: 'asc' },
          include: { question: { select: { id: true, statement: true } } },
        },
      },
    });
    if (!version) throw new NotFoundException('Versão não encontrada');
    return version.answerKeys;
  }

  async replaceQuestion(versionId: string, position: number, dto: ReplaceQuestionDto) {
    const version = await this.prisma.examVersion.findUnique({
      where: { id: versionId },
      include: { questions: true },
    });
    if (!version) throw new NotFoundException('Versão não encontrada');

    const target = version.questions.find((q) => q.questionPosition === position);
    if (!target) throw new NotFoundException(`Questão na posição ${position} não encontrada`);

    const alreadyUsed = version.questions.map((q) => q.questionId);
    if (alreadyUsed.includes(dto.replacementQuestionId)) {
      throw new BadRequestException('A questão substituta já está sendo usada nesta versão');
    }

    const replacement = await this.questionsService.findOne(dto.replacementQuestionId);
    const correctAlt = replacement.alternatives.find((a) => a.isCorrect);
    if (!correctAlt) {
      throw new BadRequestException(
        `A questão substituta "${replacement.statement.slice(0, 50)}..." não possui nenhuma alternativa correta configurada.`,
      );
    }
    const shuffledAlternatives = fisherYates(replacement.alternatives);
    const shuffledIdx = shuffledAlternatives.findIndex((a) => a.id === correctAlt.id);

    try {
      return await this.prisma.$transaction([
        this.prisma.examVersionQuestion.delete({ where: { id: target.id } }),
        this.prisma.examVersionQuestion.create({
          data: {
            examVersionId: versionId,
            questionId: replacement.id,
            questionPosition: position,
            alternatives: {
              create: shuffledAlternatives.map((alt, altIdx) => ({
                alternativeId: alt.id,
                alternativePosition: altIdx,
              })),
            },
          },
        }),
        this.prisma.answerKey.updateMany({
          where: { examVersionId: versionId, questionPosition: position },
          data: {
            questionId: replacement.id,
            originalLabel: correctAlt.originalLabel,
            shuffledLabel: LABEL_MAP[shuffledIdx],
          },
        }),
      ]);
    } catch {
      throw new InternalServerErrorException('Erro ao substituir questão');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.exam.delete({ where: { id } });
  }
}
