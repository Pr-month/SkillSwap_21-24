import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../auth.types';
import { UserRole } from 'src/users/enums';
import { AppConfigType } from 'src/config/config.type';
import { configuration } from 'src/config/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(configuration.KEY)
    private readonly configService: AppConfigType,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwt.jwtSecret || 'SECRET_KEY',
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
