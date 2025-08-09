import { ApiProperty } from '@nestjs/swagger';
import { ResponseMovieDto } from './response-movie.dto';
import { PaginationMetaDto } from 'src/common/dto';

export class PaginatedMovieResponseDto {
  @ApiProperty({ type: () => PaginationMetaDto })
  meta: PaginationMetaDto;

  @ApiProperty({ isArray: true, type: () => ResponseMovieDto })
  data: ResponseMovieDto[];
}
