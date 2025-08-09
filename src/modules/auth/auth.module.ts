import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { BcryptService, PrismaService } from 'src/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    PrismaService,
    BcryptService,
    UserService,
    JwtService,
  ],
})
export class AuthModule {}
