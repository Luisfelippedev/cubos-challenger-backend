import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ example: 47, description: 'Total de itens disponíveis' })
  total: number;

  @ApiProperty({ example: 2, description: 'Página atual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Quantidade de itens por página' })
  perPage: number;

  @ApiProperty({ example: 5, description: 'Total de páginas' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Existe próxima página?' })
  hasNext: boolean;

  @ApiProperty({ example: true, description: 'Existe página anterior?' })
  hasPrev: boolean;
}
