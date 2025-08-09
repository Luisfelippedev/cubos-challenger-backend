import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services';
import { CreateMovieDto } from './dto/create-movie.dto';
import { plainToInstance } from 'class-transformer';
import { mapPrismaError } from 'src/common';
import { ResponseMovieDto } from './dto/response-movie.dto';
import { MovieFilterDto } from './dto/filter-movie.dto';

@Injectable()
export class MovieService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    data: CreateMovieDto,
    userId: string,
  ): Promise<ResponseMovieDto> {
    try {
      const movie = await this.prismaService.movie.create({
        data: {
          ...data,
          userId: userId,
        },
      });

      return plainToInstance(ResponseMovieDto, movie);
    } catch (error) {
      mapPrismaError(error, 'Falha ao criar filme.');
    }
  }

  async findOne(id: string) {
    try {
      const movie = await this.prismaService.movie.findUnique({
        where: { id },
      });
      if (!movie) {
        throw new NotFoundException('Filme não encontrado.');
      }
      return movie;
    } catch (error) {
      mapPrismaError(error, 'Falha ao criar filme.');
    }
  }

  async update(
    id: string,
    data: Partial<CreateMovieDto>,
  ): Promise<ResponseMovieDto> {
    try {
      const movie = await this.prismaService.movie.findUnique({
        where: { id },
      });
      if (!movie) {
        throw new NotFoundException('Filme não encontrado.');
      }

      const updatedMovie = await this.prismaService.movie.update({
        where: { id },
        data,
      });

      return plainToInstance(ResponseMovieDto, updatedMovie);
    } catch (error) {
      mapPrismaError(error, 'Falha ao atualizar filme.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const movie = await this.prismaService.movie.findUnique({
        where: { id },
      });
      if (!movie) {
        throw new NotFoundException('Filme não encontrado.');
      }
      await this.prismaService.movie.delete({
        where: { id },
      });
    } catch (error) {
      mapPrismaError(error, 'Falha ao remover filme.');
    }
  }

  async findAll(
    userId: string,
    filters: MovieFilterDto,
    page = 1,
    perPage = 10,
  ) {
    const skip = (page - 1) * perPage;
    const where = this.buildWhereClause(userId, filters);

    const [movies, total] = await this.prismaService.$transaction([
      this.prismaService.movie.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
      }),
      this.prismaService.movie.count({ where }),
    ]);

    const totalPages = Math.ceil(total / perPage);

    return {
      meta: {
        total,
        page,
        perPage,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      data: plainToInstance(ResponseMovieDto, movies),
    };
  }

  private buildWhereClause(userId: string, filters: MovieFilterDto) {
    const where: any = { userId };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { originalTitle: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.durationMin || filters.durationMax) {
      where.duration = {};
      if (filters.durationMin) where.duration.gte = filters.durationMin;
      if (filters.durationMax) where.duration.lte = filters.durationMax;
    }

    if (filters.releaseDateStart || filters.releaseDateEnd) {
      where.releaseDate = {};
      if (filters.releaseDateStart)
        where.releaseDate.gte = new Date(filters.releaseDateStart);
      if (filters.releaseDateEnd)
        where.releaseDate.lte = new Date(filters.releaseDateEnd);
    }

    if (filters.genre) {
      where.genres = {
        some: {
          name: { contains: filters.genre, mode: 'insensitive' },
        },
      };
    }

    return where;
  }
}
