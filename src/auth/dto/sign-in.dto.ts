import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInDto {
  @IsEmail({}, { message: 'Por favor, forneça um email válido.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password!: string;
}

export class SignInResponseDto {
  access_token!: string;
}
