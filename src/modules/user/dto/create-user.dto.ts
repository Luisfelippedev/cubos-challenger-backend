import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'Maria da Silva',
    type: String,
  })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  name: string;

  @ApiProperty({
    description: 'Endereço de e-mail válido',
    example: 'maria.silva@email.com',
    type: String,
  })
  @IsString({ message: 'O email deve ser uma string.' })
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  email: string;

  @ApiProperty({
    description: 'Senha com no mínimo 6 caracteres',
    example: 'senha123',
    type: String,
    minLength: 6,
  })
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, {
    message: 'A senha deve conter no mínimo 6 caracteres.',
  })
  password: string;
}
