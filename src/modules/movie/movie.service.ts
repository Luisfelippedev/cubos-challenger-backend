import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Prisma } from '@prisma/client';
import { PrismaService, EmailService, S3Service } from 'src/common/services';
import { CreateMovieDto } from './dto/create-movie.dto';
import { plainToInstance } from 'class-transformer';
import { mapPrismaError } from 'src/common';
import { ResponseMovieDto } from './dto/response-movie.dto';
import { MovieFilterDto } from './dto/filter-movie.dto';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly emailService: EmailService,
    private readonly s3Service: S3Service,
  ) {}

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

  async uploadCover(params: {
    userId: string;
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  }) {
    const { userId, buffer, mimeType, originalName } = params;
    return this.s3Service.uploadCoverImage({
      userId,
      fileBuffer: buffer,
      contentType: mimeType,
      fileName: originalName,
    });
  }

  // Job diário (1AM): envia e-mails para filmes com estreia hoje
  @Cron('0 1 * * *')
  async notifyMovieReleasesToday() {
    const today = new Date();
    const startOfDay = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        0,
        0,
        0,
      ),
    );
    const endOfDay = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    try {
      const movies = await this.prismaService.movie.findMany({
        where: {
          releaseDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: { User: true },
      });

      for (const movie of movies) {
        if (!movie.User?.email) continue;
        await this.emailService.sendEmail({
          to: movie.User.email,
          subject: `Estreia hoje: ${movie.title}`,
          html: `<p>Hoje é o dia! O filme <strong>${movie.title}</strong> estreia.</p>`,
        });
      }

      this.logger.log(`Notificações de estreia enviadas: ${movies.length}`);
    } catch (error) {
      this.logger.error(
        'Erro ao enviar notificações de estreia',
        error as Error,
      );
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
    const sortBy = filters.sortBy ?? 'title';
    const sortOrder = (filters.sortOrder ?? 'asc') as 'asc' | 'desc';

    const orderBy = {
      [sortBy]: sortOrder,
    } as Prisma.MovieOrderByWithRelationInput;

    const [movies, total] = await this.prismaService.$transaction([
      this.prismaService.movie.findMany({
        where,
        orderBy,
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

  private buildWhereClause(
    userId: string,
    filters: MovieFilterDto,
  ): Prisma.MovieWhereInput {
    const where: Prisma.MovieWhereInput = { userId };

    if (
      filters.durationMin !== undefined &&
      filters.durationMax !== undefined &&
      filters.durationMin > filters.durationMax
    ) {
      throw new BadRequestException(
        'durationMin não pode ser maior que durationMax',
      );
    }

    if (
      filters.releaseDateStart instanceof Date &&
      filters.releaseDateEnd instanceof Date &&
      filters.releaseDateStart > filters.releaseDateEnd
    ) {
      throw new BadRequestException(
        'releaseDateStart não pode ser maior que releaseDateEnd',
      );
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
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
        where.releaseDate.gte = filters.releaseDateStart;
      if (filters.releaseDateEnd)
        where.releaseDate.lte = filters.releaseDateEnd;
    }

    if (filters.genre) {
      where.genres = { has: filters.genre };
    }

    return where;
  }
}
