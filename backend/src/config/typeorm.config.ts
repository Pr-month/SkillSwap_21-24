import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

import * as dotenv from 'dotenv';
dotenv.config();

const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'SkillSwapDB',
  entities: [join(__dirname, '../**/*.entity.{ts,js}')],
  migrations: ['src/migrations/*.ts'],
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
};

export default typeOrmConfig;
export const AppDataSource = new DataSource(typeOrmConfig);
