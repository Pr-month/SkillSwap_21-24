import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenPayload, RefreshUser } from '../auth.types';
import { AppConfigType } from 'src/config/config.type';
import { configuration } from 'src/config/configuration';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(configuration.KEY)
    private readonly configService: AppConfigType,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.jwtRefreshSecret || 'REFRESH_SECRET_KEY',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: RefreshTokenPayload): RefreshUser {
    const authHeader: string | undefined = req.get('Authorization');
    let refreshToken: string = '';

    if (authHeader) {
      refreshToken = authHeader.replace('Bearer', '').trim();
    }

    if (!refreshToken) {
      throw new Error('Refresh token not provided');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      refreshToken: refreshToken,
    };
  }
}
