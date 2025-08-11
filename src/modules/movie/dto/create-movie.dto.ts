import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsEnum,
  IsOptional,
  IsUrl,
  IsDecimal,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genre } from 'src/common/enums';
import { IsISODateOnly } from 'src/common/decorators';

export class CreateMovieDto {
  @ApiProperty({
    example: 'O Senhor dos Anéis: A Sociedade do Anel',
    description: 'Titulo do filme',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'The Lord of the Rings: The Fellowship of the Ring',
    description: 'Título original do filme',
  })
  @IsOptional()
  @IsString()
  originalTitle?: string;

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
    example: '2001-12-29',
    description: 'Data de lançamento do filme',
  })
  @IsISODateOnly({
    message: 'O campo releaseDate deve estar no formato YYYY-MM-DD',
  })
  releaseDate: Date;

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
    example: 'https://bucket.s3.amazonaws.com/imagens/sociedade-do-anel.jpg',
  })
  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @ApiProperty({
    example: '250000000.00',
    description: 'Orçamento de produção do filme (decimal com 2 casas)',
  })
  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '2', force_decimal: true })
  productionBudget: string;
}
