import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Express } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  if (process.env.NODE_ENV !== 'production') {
    await app.listen(process.env.PORT ?? 3000);
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
}

export default bootstrap();
