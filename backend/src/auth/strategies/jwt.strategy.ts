import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../users/entities/user.entity';

interface JwtPayload {
  sub: number;
  email: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY',
    });
  }

  validate(payload: JwtPayload): {
    userId: number;
    email: string;
    roles: UserRole[];
  } {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [UserRole.USER],
    };
  }
}
