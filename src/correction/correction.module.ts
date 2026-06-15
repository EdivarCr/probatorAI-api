import { Module } from '@nestjs/common';
import { CorrectionController } from './correction.controller';
import { CorrectionService } from './correction.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CorrectionController],
  providers: [CorrectionService, PrismaService],
  exports: [CorrectionService],
})
export class CorrectionModule {}
