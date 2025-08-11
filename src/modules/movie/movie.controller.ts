import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  HttpStatus,
  HttpCode,
  Query,
  ValidationPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from 'src/common/types';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ResponseMovieDto } from './dto/response-movie.dto';
import { PaginatedMovieResponseDto } from './dto/paginated-movie-response.dto';
import { MovieFilterDto } from './dto/filter-movie.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageUploadOptions } from 'src/common/utils/upload.util';
import { UploadCoverResponseDto } from './dto/upload-cover-response.dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria um novo filme.' })
  @ApiBody({ type: CreateMovieDto })
  @ApiCreatedResponse({
    type: ResponseMovieDto,
    description: 'Filme criado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos para criação.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro inesperado ao criar filme.',
  })
  async create(@Req() req: AuthenticatedRequest, @Body() data: CreateMovieDto) {
    return await this.movieService.create(data, req.userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Busca um filme por ID.' })
  @ApiOkResponse({ type: ResponseMovieDto, description: 'Dados do filme.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Filme não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro inesperado ao buscar filme.',
  })
  async findOne(@Param('id') id: string) {
    return await this.movieService.findOne(id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lista todos os filmes do usuário autenticado com paginação.',
  })
  @ApiOkResponse({
    description: 'Lista de filmes paginada.',
    type: PaginatedMovieResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número da página (padrão: 1)',
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    example: 10,
    description: 'Quantidade de itens por página (padrão: 10)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    example: 'title',
    description:
      'Campo para ordenação (title, originalTitle, releaseDate, createdAt). Padrão: title',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    example: 'asc',
    description: 'Ordem da ordenação (asc, desc). Padrão: asc',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    example: 'Matrix',
    description: 'Texto para busca no título, descrição e título original',
  })
  @ApiQuery({
    name: 'durationMin',
    required: false,
    type: Number,
    example: 60,
    description: 'Duração mínima do filme em minutos',
  })
  @ApiQuery({
    name: 'durationMax',
    required: false,
    type: Number,
    example: 180,
    description: 'Duração máxima do filme em minutos',
  })
  @ApiQuery({
    name: 'releaseDateStart',
    required: false,
    type: String,
    example: '2000-01-01',
    description: 'Data mínima de lançamento (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'releaseDateEnd',
    required: false,
    type: String,
    example: '2023-12-31',
    description: 'Data máxima de lançamento (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    type: String,
    example: 'Drama',
    description: 'Filtra por um único gênero.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro inesperado ao buscar filmes.',
  })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query(new ValidationPipe({ transform: true })) filters: MovieFilterDto,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    return this.movieService.findAll(
      req.userId,
      filters,
      Number(page),
      Number(perPage),
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza um filme por ID.' })
  @ApiParam({ name: 'id', description: 'ID do filme' })
  @ApiBody({ type: UpdateMovieDto })
  @ApiOkResponse({
    type: ResponseMovieDto,
    description: 'Filme atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Filme não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos para atualização.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro inesperado ao atualizar filme.',
  })
  async update(@Param('id') id: string, @Body() data: UpdateMovieDto) {
    return await this.movieService.update(id, data);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove um filme por ID.' })
  @ApiParam({ name: 'id', description: 'ID do filme' })
  @ApiNoContentResponse({ description: 'Filme removido com sucesso.' })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Filme não encontrado.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro inesperado ao remover filme.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.movieService.remove(id);
  }

  // Endpoint para testar cron e envio de e-mail rapidamente
  @Post('test-cron')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Dispara manualmente o job de estreia de hoje (apenas DEV).',
  })
  @ApiOkResponse({ description: 'Job executado.' })
  async testCron() {
    await this.movieService.notifyMovieReleasesToday();
    return { message: 'Job executado' };
  }

  @Post('cover')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Faz upload da capa do filme para o S3.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({
    description: 'Upload realizado com sucesso. Retorna URL pública.',
    type: UploadCoverResponseDto,
  })
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
  async uploadCover(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadCoverResponseDto> {
    if (!file) {
      const msg =
        (req as any).fileValidationError || 'Arquivo inválido ou ausente.';
      throw new BadRequestException(msg);
    }
    const result = await this.movieService.uploadCover({
      userId: req.userId,
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
    return { key: result.key, url: result.url };
  }
}
