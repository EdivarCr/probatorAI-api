import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
