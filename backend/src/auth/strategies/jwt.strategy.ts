import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../auth.types';
import { UserRole } from 'src/users/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY',
    });
  }

  validate(payload: Omit<JwtPayload, 'iat' | 'exp'>): {
    sub: number;
    email: string;
    roles: UserRole[];
  } {
    return {
      ...payload,
    };
  }
}
