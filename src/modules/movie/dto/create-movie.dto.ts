import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genre } from 'src/common/enums';

export class CreateMovieDto {
  @ApiProperty({
    example: 'O Senhor dos Anéis: A Sociedade do Anel',
    description: 'Titulo do filme',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example:
      'Um hobbit é incumbido de destruir um anel poderoso antes que ele caia em mãos erradas.',
    description: 'Descrição do filme',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 178, description: 'Duração do filme em minutos' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({
    example: '2001-12-29T00:00:00.000Z',
    description: 'Data de lançamento do filme',
  })
  @IsDateString()
  releaseDate: string;

  @ApiProperty({
    isArray: true,
    enum: Genre,
    description: 'Lista de gêneros do filme',
    example: [Genre.ACTION, Genre.DRAMA],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Genre, { each: true })
  genres: Genre[];

  @ApiPropertyOptional({
    description: 'Url da imagem',
    example:
      'https://bucket.s3.amazonaws.com/imagens/sociedade-do-anel.jpg',
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;
}
