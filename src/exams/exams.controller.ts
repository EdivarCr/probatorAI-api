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
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create-exam.dto';
import { GenerateVersionsDto } from './dto/generate-versions.dto';
import { ReplaceQuestionDto } from './dto/replace-question.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateExamPdfDto } from './dto/create-pdf';
import { PdfService } from './pdf.service';
import type { Response } from 'express';


@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly pdfService: PdfService
  ) { }

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

  @Post(':id/pdf')
  @UseInterceptors(FileInterceptor('logo'))
  async dowloadExamPdf(
    @Param('id') id: string,
    @Body() dto: CreateExamPdfDto,
    @UploadedFile() logo: Express.Multer.File,
    @Res() res,
  ) {
    const examData = await this.examsService.getVersion(id);
    const logoBase64 = logo
      ? `data:${logo.mimetype};base64,${logo.buffer.toString('base64')}`
      : null;

    const mappedQuestions = examData.questions.map((q) => {
      const alternatives = q.alternatives.map((alt) => {
        const label = ['A', 'B', 'C', 'D', 'E'][alt.alternativePosition] || '';
        return {
          label,
          text: alt.alternative.text,
        };
      });

      return {
        position: q.questionPosition,
        statement: q.question.statement,
        alternatives,
      };
    });

    const payloadForPdf = {
      logoData: logoBase64,
      schoolName: dto.schoolName,
      versionLabel: examData.versionLabel,
      questions: mappedQuestions,
    };

    const pdfBuffer = await this.pdfService.generateExamPdf(payloadForPdf);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prova_${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Post(':id/gabarito/pdf')
  @UseInterceptors(FileInterceptor('logo'))
  async downloadAnswerSheetPdf(
    @Param('id') id: string,
    @Body() dto: CreateExamPdfDto,
    @UploadedFile() logo: Express.Multer.File,
    @Res() res,
  ) {
    const examData = await this.examsService.getVersion(id);
    const logoBase64 = logo
      ? `data:${logo.mimetype};base64,${logo.buffer.toString('base64')}`
      : null;

    const mappedQuestions = examData.questions.map((q) => {
      return {
        position: q.questionPosition,
      };
    });

    const payloadForPdf = {
      logoData: logoBase64,
      schoolName: dto.schoolName,
      versionLabel: examData.versionLabel,
      questions: mappedQuestions,
    };

    const pdfBuffer = await this.pdfService.generateAnswerSheetPdf(payloadForPdf);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="gabarito_${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
