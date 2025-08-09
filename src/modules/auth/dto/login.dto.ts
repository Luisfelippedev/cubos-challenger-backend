import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'E-mail cadastrado no sistema.',
    type: String,
  })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha do usuário (mínimo 6 caracteres).',
    type: String,
  })
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, {
    message: 'A senha deve ter no mínimo 6 caracteres.',
  })
  password: string;
}
