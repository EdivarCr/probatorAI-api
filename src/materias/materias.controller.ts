import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { MateriaService } from './materias.service';

@Controller('materias')
export class MateriasController {
  constructor(private readonly materiaService: MateriaService) {}

  @Public()
  @Get('all')
  async getAllMaterias() {
    return await this.materiaService.findAllMaterias();
  }

  @Public()
  @Get(':id')
  async getMateriaId(@Param('id') id: string) {
    return await this.materiaService.findMateria(id);
  }
}
