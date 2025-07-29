import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'skillswap',
  entities: ['src/entities/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.ts'],
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
};

export default typeOrmConfig;
