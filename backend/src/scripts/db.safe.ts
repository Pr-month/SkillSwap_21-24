import { DataSource } from 'typeorm';

import { AppDataSource } from '../config/typeorm.config';

export function createSafeDataSource() {
  return new DataSource({
    ...AppDataSource.options,
    synchronize: false,
    dropSchema: false,
  });
}
