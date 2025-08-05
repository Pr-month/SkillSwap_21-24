import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../users/entities/user.entity';
import { Request } from 'express';

interface RefreshTokenPayload {
  sub: number;
  email: string;
  roles: UserRole[];
  refreshToken: string;
  iat?: number;
  exp?: number;
}

interface RefreshUser {
  userId: number;
  email: string;
  roles: UserRole[];
  refreshToken: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.REFRESH_TOKEN_SECRET || 'REFRESH_SECRET_KEY',
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
