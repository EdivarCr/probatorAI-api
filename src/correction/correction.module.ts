import { Module } from '@nestjs/common';
import { CorrectionController } from './correction.controller';
import { CorrectionService } from './correction.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CorrectionController],
  providers: [CorrectionService],
  exports: [CorrectionService],
})
export class CorrectionModule {}
