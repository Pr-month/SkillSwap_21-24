import { registerAs } from '@nestjs/config';
import typeOrmConfig from './typeorm.config';

export const configuration = registerAs('APP_CONFIG', () => ({
  db: typeOrmConfig,
  port: Number(process.env.PORT) || 3000,
  jwt: {
    jwtSecret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.EXPRIRES_IN || '15m',
  },
}));
