import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './pagination-meta.dto';

export class PaginatedResponseDto<T> {
  @ApiProperty({
    type: () => PaginationMetaDto,
    description: 'Metadados da paginação',
  })
  meta: PaginationMetaDto;

  @ApiProperty({ isArray: true, description: 'Lista de itens da página' })
  data: T[];
}
