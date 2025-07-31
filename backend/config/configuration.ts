import { registerAs } from '@nestjs/config';
import typeOrmConfig from './typeorm.config';

export const configuration = registerAs('APP_CONFIG', () => ({
  db: typeOrmConfig,
  port: process.env.PORT || 3000,
  // jwtSecret: process.env.JWT_SECRET,
}));
