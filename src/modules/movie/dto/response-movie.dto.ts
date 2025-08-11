import { ApiProperty } from '@nestjs/swagger';

export class ResponseMovieDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Meu Filme' })
  title: string;

  @ApiProperty({
    example: 'The Lord of the Rings: The Fellowship of the Ring',
    required: false,
  })
  originalTitle?: string;

  @ApiProperty({
    example: '2025-08-08T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  releaseDate: Date;

  @ApiProperty({ example: 'Filme de aventura e ação' })
  description?: string;

  @ApiProperty({ example: 120 })
  duration: number;

  @ApiProperty({ example: ['Action', 'Adventure'] })
  genres: string[];

  @ApiProperty({
    example: 'https://bucket.s3.amazonaws.com/imagens/sociedade-do-anel.jpg',
  })
  coverImageUrl?: string;

  @ApiProperty({
    example: '250000000.00',
    description: 'Orçamento de produção',
  })
  productionBudget: string;
}
