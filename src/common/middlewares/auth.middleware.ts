import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { IJwtPayload } from '../types';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly jwtSecret: string;

  constructor(private readonly jwtService: JwtService) {
    if (!process.env.SECURITY_JWT) {
      throw new Error('JWT secret not configured in environment variables');
    }
    this.jwtSecret = process.env.SECURITY_JWT;
  }

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpException('Token não fornecido', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify<IJwtPayload>(token, {
        secret: this.jwtSecret,
      });

      req.userId = payload.id;

      next();
    } catch (error) {
      throw new HttpException('Token inválido', HttpStatus.FORBIDDEN);
    }
  }
}
