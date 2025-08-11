import { Module } from '@nestjs/common';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { PrismaService, EmailService, S3Service } from 'src/common';

@Module({
  controllers: [MovieController],
  providers: [MovieService, PrismaService, EmailService, S3Service],
})
export class MovieModule {}
