import { PartialType } from '@nestjs/swagger';
import { CreateMovieDto } from './create-movie.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDecimal, IsOptional } from 'class-validator';

export class UpdateMovieDto extends PartialType(CreateMovieDto) {
  @ApiPropertyOptional({
    example: '125000000.00',
    description: 'Orçamento de produção do filme (decimal com 2 casas)',
  })
  @IsOptional()
  @IsDecimal({ decimal_digits: '2', force_decimal: true })
  productionBudget?: string;
}
