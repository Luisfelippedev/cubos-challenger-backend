import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Mensagem de confirmação do login.',
    example: 'Login realizado com sucesso.',
    type: String,
  })
  message: string;

  @ApiProperty({
    description:
      'Token JWT de acesso, utilizado para autenticar requisições às rotas protegidas.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  access_token: string;

  @ApiProperty({
    description:
      'Token JWT de atualização, utilizado para renovar o access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  refresh_token: string;
}
