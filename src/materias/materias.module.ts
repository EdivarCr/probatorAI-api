import { Module } from '@nestjs/common';
import { MateriaService } from './materias.service';
import { MateriasController } from './materias.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [MateriaService],
  controllers: [MateriasController],
  imports: [PrismaModule],
})
export class MateriasModule {}
