import { registerAs } from '@nestjs/config';
import typeOrmConfig from './typeorm.config';

export const configuration = registerAs('APP_CONFIG', () => ({
  db: typeOrmConfig,
  port: Number(process.env.PORT) || 3000,
  jwt: {
    jwtSecret: process.env.JWT_SECRET || 'SECRET_KEY',
    jwtRefreshSecret: process.env.REFRESH_TOKEN_SECRET || 'REFRESH_SECRET_KEY',
    accessExpiresIn: process.env.AUTH_ACCESS_TOKEN_EXPIRY || '15m',
    refreshExpiresIn: process.env.AUTH_REFRESH_TOKEN_EXPIRY || '7d',
  },
}));
