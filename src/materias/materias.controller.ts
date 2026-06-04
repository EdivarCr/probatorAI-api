import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { MateriaService } from './materias.service';
import { CreateMateriaDto } from './dto/create-materia.dto';

@Controller('materias')
export class MateriasController {
  constructor(private readonly materiaService: MateriaService) {}

  @Post()
  async create(@Body() dto: CreateMateriaDto) {
    return await this.materiaService.createMateria(dto);
  }

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
