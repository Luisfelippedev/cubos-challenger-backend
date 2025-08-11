import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { PrismaService, EmailService } from 'src/common';

@Module({
  controllers: [MovieController],
  providers: [MovieService, PrismaService, EmailService],
})
export class MovieModule {}
