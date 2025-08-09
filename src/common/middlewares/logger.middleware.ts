import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const { statusCode } = res;
      this.loggerService.log(`${method} ${originalUrl} ${statusCode}`);
    });

    next();
  }
}
