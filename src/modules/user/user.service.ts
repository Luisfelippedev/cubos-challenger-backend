import { Injectable, ConflictException } from '@nestjs/common';
import { BcryptService, PrismaService } from 'src/common/services';
import { CreateUserDto } from './dto/create-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { mapPrismaError } from 'src/common';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
  ) {}

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    try {
      const hashPassword = await this.bcryptService.hashPassword(data.password);

      const user = await this.prismaService.user.create({
        data: { ...data, password: hashPassword },
        select: { id: true, name: true, email: true },
      });

      return plainToInstance(UserResponseDto, user);
    } catch (error) {
      mapPrismaError(error, 'Falha ao criar usuário.');
    }
  }
}
