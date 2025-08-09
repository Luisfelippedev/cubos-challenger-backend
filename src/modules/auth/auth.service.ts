import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BcryptService } from 'src/common';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { plainToInstance } from 'class-transformer';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async refresh(refresh_token: string): Promise<RefreshTokenResponseDto> {
    try {
      if (!refresh_token) {
        throw new UnauthorizedException('Token de atualização não fornecido.');
      }

      const decoded = this.jwtService.verify(refresh_token, {
        secret: process.env.SECURITY_JWT_REFRESH,
      });

      const user = await this.userService.findByEmail(decoded.email);

      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      const tokens = await this.generateToken(user);
      return {
        ...tokens,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new UnauthorizedException(
        'Token de atualização inválido ou expirado.',
      );
    }
  }

  async generateToken(user: User) {
    return {
      access_token: this.jwtService.sign(
        { id: user.id, email: user.email, name: user.name },
        {
          secret: process.env.SECURITY_JWT,
          expiresIn: '1 days',
        },
      ),
      refresh_token: this.jwtService.sign(
        { id: user.id, email: user.email },
        {
          secret: process.env.SECURITY_JWT_REFRESH,
          expiresIn: '2 days',
        },
      ),
    };
  }

  async signIn(data: LoginDto): Promise<LoginResponseDto> {
    try {
      const user = await this.userService.findByEmail(data.email);

      if (!user) {
        throw new NotFoundException('Usuário não cadastrado.');
      }

      const isPasswordValid = await this.bcryptService.comparePasswords(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas.');
      }

      const token = await this.generateToken(user);

      const response = {
        message: 'Login realizado com sucesso.',
        ...token,
      };

      return plainToInstance(LoginResponseDto, response);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('Login falhou.');
    }
  }
}
