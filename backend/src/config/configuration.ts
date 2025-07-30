import { registerAs } from '@nestjs/config';
import typeOrmConfig from './typeorm.config';

export const configuration = registerAs('APP_CONFIG', () => ({
  db: typeOrmConfig,
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET,
}));
