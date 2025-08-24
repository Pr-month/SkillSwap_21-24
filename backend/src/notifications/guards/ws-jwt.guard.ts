import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigType } from 'src/config/config.type';
import { configuration } from 'src/config/configuration';
import { AuthenticatedSocket, JwtPayload } from '../notification.types';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    @Inject(configuration.KEY)
    private readonly config: AppConfigType,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedSocket>();
    const token = client.handshake.query?.token as string;

    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.config.jwt.jwtSecret,
    });
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }

    client.user = payload;

    return true;
  }
}
