import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMateriaDto } from './dto/create-materia.dto';

function normalize(name: string): string {
  return name
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

@Injectable()
export class MateriaService {
  constructor(private prisma: PrismaService) {}

  async findAllMaterias() {
    return await this.prisma.materia.findMany();
  }

  async findMateria(id: string) {
    try {
      const materia = await this.prisma.materia.findUnique({
        where: { id },
      });

      if (!materia) {
        throw new NotFoundException('Matéria não encontrada');
      }

      return materia;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro ao buscar a matéria no banco de dados',
      );
    }
  }

  async createMateria(dto: CreateMateriaDto) {
    const name = dto.name.trim();

    // Busca todas as matérias e compara normalizando: sem acento, minúsculas, espaços extras
    const all = await this.prisma.materia.findMany({ select: { name: true } });
    const conflict = all.find((m) => normalize(m.name) === normalize(name));

    if (conflict) {
      throw new ConflictException(
        `Já existe uma matéria com nome similar: "${conflict.name}"`,
      );
    }

    return this.prisma.materia.create({
      data: { ...dto, name },
    });
  }

  async updateMateria(id: string, dto: CreateMateriaDto) {
    const name = dto.name.trim();

    // Verifica duplicata excluindo a própria matéria
    const all = await this.prisma.materia.findMany({
      where: { id: { not: id } },
      select: { name: true },
    });
    const conflict = all.find((m) => normalize(m.name) === normalize(name));
    if (conflict) {
      throw new ConflictException(
        `Já existe uma matéria com nome similar: "${conflict.name}"`,
      );
    }

    try {
      return await this.prisma.materia.update({
        where: { id },
        data: { name, description: dto.description ?? null },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Matéria não encontrada');
      }
      throw new InternalServerErrorException('Erro ao atualizar matéria');
    }
  }

  async deleteMateria(id: string) {
    try {
      await this.prisma.materia.delete({ where: { id } });
      return { message: 'Matéria excluída com sucesso' };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Matéria não encontrada');
      }
      throw new InternalServerErrorException('Erro ao excluir matéria');
    }
  }
}
