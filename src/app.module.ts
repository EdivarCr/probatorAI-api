import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controler';
import { PrismaModule } from './prisma/prisma.module';
import { MateriasModule } from './materias/materias.module';
import { QuestionsModule } from './questions/questions.module';
import { ExamsModule } from './exams/exams.module';
import { ImportModule } from './import/import.module';
import { GeminiModule } from './integrations/gemini/gemini.module';
import { CorrectionModule } from './correction/correction.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    MateriasModule,
    QuestionsModule,
    ExamsModule,
    ImportModule,
    GeminiModule,
    CorrectionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
