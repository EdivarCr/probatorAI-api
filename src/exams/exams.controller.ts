import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { GenerateVersionsDto } from './dto/generate-versions.dto';
import { ReplaceQuestionDto } from './dto/replace-question.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Body() dto: CreateExamDto) {
    return this.examsService.create(dto);
  }

  @Get()
  findAll(@Query('materiaId') materiaId?: string) {
    return this.examsService.findAll(materiaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Post(':id/generate')
  generateVersions(@Param('id') id: string, @Body() dto: GenerateVersionsDto) {
    return this.examsService.generateVersions(id, dto);
  }

  @Post(':id/regenerate')
  regenerate(@Param('id') id: string, @Body() dto: GenerateVersionsDto) {
    return this.examsService.regenerate(id, dto);
  }

  @Get('versions/:versionId')
  getVersion(@Param('versionId') versionId: string) {
    return this.examsService.getVersion(versionId);
  }

  @Get('versions/:versionId/answer-key')
  getAnswerKey(@Param('versionId') versionId: string) {
    return this.examsService.getAnswerKey(versionId);
  }

  @Post('versions/:versionId/questions/:position/replace')
  replaceQuestion(
    @Param('versionId') versionId: string,
    @Param('position', ParseIntPipe) position: number,
    @Body() dto: ReplaceQuestionDto,
  ) {
    return this.examsService.replaceQuestion(versionId, position, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }
}
