import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { LoggerService } from './common/services';
import { AuthMiddleware, LogMiddleware } from './common/middlewares';
import { JwtService } from '@nestjs/jwt';
import { MovieModule } from './modules/movie/movie.module';

@Module({
  imports: [UserModule, AuthModule, MovieModule],
  controllers: [AppController],
  providers: [AppService, LoggerService, JwtService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LogMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ method: RequestMethod.ALL, path: 'movie' });
  }
}
