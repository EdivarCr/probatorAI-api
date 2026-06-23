import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { GenerateVersionsDto } from './dto/generate-versions.dto';
import { ReplaceQuestionDto } from './dto/replace-question.dto';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Req() request, @Body() dto: CreateExamDto) {

    const loggedUserId = request.user.sub;

    console.log('2. USER NO CONTROLLER:', request.user); // <-- ADICIONE ISTO
    console.log('3. ID EXTRAIDO:', loggedUserId);
    return this.examsService.create(dto, loggedUserId);
  }

  @Get()
  findAll(@Req() request, @Query('materiaId') materiaId?: string) {
    const loggedUserId = request.user.sub;
    return this.examsService.findAll(materiaId, loggedUserId);
  }

  @Get(':id')
  findOne(@Req() request, @Param('id') id: string) {
    const loggedUserId = request.user.sub;
    return this.examsService.findOne(id, loggedUserId);
  }

  @Post(':id/generate')
  generateVersions(
    @Req() request,
    @Param('id') id: string,
    @Body() dto: GenerateVersionsDto,
  ) {
    const loggedUserId = request.user.sub;
    return this.examsService.generateVersions(id, dto, loggedUserId);
  }

  @Post(':id/regenerate')
  regenerate(
    @Req() request,
    @Param('id') id: string,
    @Body() dto: GenerateVersionsDto,
  ) {
    const loggedUserId = request.user.sub;
    return this.examsService.regenerate(id, dto, loggedUserId);
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
  remove(@Req() request, @Param('id') id: string) {
    const loggedUserId = request.user.sub;
    return this.examsService.remove(id, loggedUserId);
  }
}
