import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description:
      'Token de atualização JWT recebido no login, usado para obter um novo access token.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  @IsString({ message: 'O refresh_token deve ser uma string.' })
  @IsNotEmpty({ message: 'O campo refresh_token não pode estar vazio.' })
  refresh_token: string;
}
