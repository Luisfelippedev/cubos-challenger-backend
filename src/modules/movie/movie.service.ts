import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/services';
import { CreateMovieDto } from './dto/create-movie.dto';
import { plainToInstance } from 'class-transformer';
import { mapPrismaError } from 'src/common';
import { ResponseMovieDto } from './dto/response-movie.dto';

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
    page = 1,
    perPage = 10,
  ): Promise<{ meta: any; data: ResponseMovieDto[] }> {
    try {
      const skip = (page - 1) * perPage;

      const [movies, total] = await this.prismaService.$transaction([
        this.prismaService.movie.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: perPage,
        }),
        this.prismaService.movie.count({ where: { userId } }),
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
    } catch (error) {
      mapPrismaError(error, 'Falha ao buscar filmes.');
    }
  }
}
