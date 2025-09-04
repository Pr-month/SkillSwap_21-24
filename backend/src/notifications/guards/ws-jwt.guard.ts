import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigType } from '../../config/config.type';
import { configuration } from '../../config/configuration';
import { AuthenticatedSocket, JwtPayload } from '../notification.types';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class WsJwtGuard {
  constructor(
    @Inject(configuration.KEY)
    private readonly config: AppConfigType,
    private readonly jwtService: JwtService,
  ) {}

  async verifyToken(client: AuthenticatedSocket) {
    const token = client.handshake.query?.token as string;

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.jwt.jwtSecret,
      });

      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }

      client.user = payload;

      return true;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      } else if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      } else {
        // Общая ошибка
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}
