import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenResponseDto } from './dto/refresh-token-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não cadastrado',
  })
  async signIn(@Body() data: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.signIn(data);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Atualizar token de autenticação' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Token atualizado com sucesso',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido ou expirado',
  })
  async refresh(
    @Body() body: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refresh(body.refresh_token);
  }
}
