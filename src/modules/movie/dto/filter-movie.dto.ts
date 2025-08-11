import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsArray,
  IsEnum,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsISODateOnly } from 'src/common/decorators';
import { Genre, SortOrder } from 'src/common/enums';

export class MovieFilterDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
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
  @IsArray()
  @IsEnum(Genre, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return undefined;
  })
  genres?: Genre[];

  @IsOptional()
  @IsEnum(Genre)
  genre?: Genre;

  @IsOptional()
  @IsIn(['title', 'releaseDate', 'createdAt'])
  sortBy?: 'title' | 'releaseDate' | 'createdAt';

  @IsOptional()
  @IsEnum(SortOrder)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  sortOrder?: SortOrder;
}
