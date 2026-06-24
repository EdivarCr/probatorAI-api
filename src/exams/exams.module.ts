import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionsModule } from '../questions/questions.module';
import { PdfService } from './pdf.service';

@Module({
  imports: [PrismaModule, QuestionsModule],
  providers: [ExamsService, PdfService],
  controllers: [ExamsController],
})
export class ExamsModule {}
