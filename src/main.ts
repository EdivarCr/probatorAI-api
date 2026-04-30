import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Express } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  if (process.env.NODE_ENV !== 'production') {
    await app.listen(process.env.PORT ?? 3000);
  }

  await app.init();
  return app.getHttpAdapter().getInstance() as Express;
}

export default bootstrap();
