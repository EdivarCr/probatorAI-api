import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppController } from './app.controler';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AppController],
})
export class AppModule {}
