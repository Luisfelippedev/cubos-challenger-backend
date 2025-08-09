import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsISODateOnly } from 'src/common/decorators';

export class MovieFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  durationMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  durationMax?: number;

  @IsOptional()
  @IsISODateOnly({
    message: 'O campo releaseDateStart deve estar no formato YYYY-MM-DD',
  })
  releaseDateStart?: Date;

  @IsOptional()
  @IsISODateOnly({
    message: 'O campo releaseDateStart deve estar no formato YYYY-MM-DD',
  })
  releaseDateEnd?: Date;

  @IsOptional()
  @IsString()
  genre?: string;
}
