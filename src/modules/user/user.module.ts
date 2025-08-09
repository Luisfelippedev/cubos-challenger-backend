import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BcryptService, PrismaService } from 'src/common/services';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, BcryptService],
})
export class UserModule {}
