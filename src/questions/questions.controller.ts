import { Controller, Get, Param, Query, Patch } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QueryQuestionsDto } from './dto/query-questions.dto';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query() query: QueryQuestionsDto) {
    return this.questionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.questionsService.archive(id);
  }
}
