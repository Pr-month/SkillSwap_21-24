import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';

import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'SkillSwapDB',
  entities: [join(__dirname, '../**/*.entity.{ts,js}')],
  migrations: ['src/migrations/*.ts'],
  dropSchema: process.env.TYPEORM_SYNCHRONIZE === 'true',
  synchronize: process.env.NODE_ENV !== 'production'
};

export default typeOrmConfig;
export const AppDataSource = new DataSource(typeOrmConfig);
