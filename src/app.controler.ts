import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Public()
@Controller()
export class AppController {
  @Get('health')
  checkHealth() {
    return {
      status: 'ok',
      message: 'A API está no ar e pronta para receber requisições!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
