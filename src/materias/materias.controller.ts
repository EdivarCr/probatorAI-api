import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorators';
import { Role } from '../auth/role.enum';
import { MateriaService } from './materias.service';
import { CreateMateriaDto } from './dto/create-materia.dto';

@Controller('materias')
export class MateriasController {
  constructor(private readonly materiaService: MateriaService) {}

  @Roles(Role.Admin)
  @Post()
  async create(@Body() dto: CreateMateriaDto) {
    return await this.materiaService.createMateria(dto);
  }

  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateMateriaDto) {
    return await this.materiaService.updateMateria(id, dto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.materiaService.deleteMateria(id);
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
