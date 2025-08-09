import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function mapPrismaError(
  error: unknown,
  fallbackMessage = 'Erro interno',
): never {
  if (error instanceof HttpException) {
    throw error;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target =
          (error.meta?.target as string[] | string | undefined) ?? [];
        const fields = Array.isArray(target)
          ? target
          : [target].filter(Boolean);
        const message = fields.length
          ? `Já existe registro com ${fields.join(', ')} informado(s).`
          : 'Registro duplicado.';
        throw new ConflictException(message);
      }
      case 'P2025': {
        throw new NotFoundException('Registro não encontrado.');
      }
      case 'P2003': {
        throw new BadRequestException('Violação de integridade referencial.');
      }
    }
  }

  throw new InternalServerErrorException(fallbackMessage);
}
