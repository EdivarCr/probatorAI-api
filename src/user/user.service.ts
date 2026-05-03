import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatedUserDto, CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    try {
      const materia = await this.prisma.materia.findUnique({
        where: { id: createUserDto.materiaId },
        select: { id: true },
      });

      if (!materia) throw new NotFoundException('Matéria não encontrada');

      const hashPassword = await bcrypt.hash(createUserDto.password, 10);

      return await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: hashPassword,
          materias: {
            connect: [{ id: materia.id }],
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          materias: true,
        },
      });
    } catch (error) {
      console.log(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code == 'P2002') {
          throw new ConflictException('Email ja existe');
        }
      }
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findAllUsers() {
    return await this.prisma.user.findMany();
  }

  async updateUser(id: string, updatedUserDto: UpdatedUserDto) {
    try {
      if (updatedUserDto.password) {
        const hashPassword = await bcrypt.hash(updatedUserDto.password, 10);
        updatedUserDto.password = hashPassword;
      }

      const user = await this.prisma.user.update({
        where: { id },
        data: updatedUserDto,
        select: {
          id: true,
          name: true,
          email: true,
          updatedAt: true,
          materias: true,
        },
      });
      return user;
    } catch {
      throw new NotFoundException('Usuário nao encontrado');
    }
  }

  async findUser(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          materias: true,
        },
      });
      if (!user) {
        throw new NotFoundException('Usuário nao encontrado');
      }
      return user;
    } catch {
      throw new NotFoundException();
    }
  }

  async deleteUser(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });

      return { message: 'deletade com sucesso ' };
    } catch {
      throw new NotFoundException('usuario nao encontrado');
    }
  }
}
