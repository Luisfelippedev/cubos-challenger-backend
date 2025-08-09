import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    description: 'Identificador único do usuário.',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Nome completo do usuário.',
    example: 'João da Silva',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Endereço de e-mail do usuário.',
    example: 'joao.silva@email.com',
    type: String,
  })
  email: string;

  @Exclude()
  password: string;
}
