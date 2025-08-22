import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import typeOrmConfig from '../config/typeorm.config';
import { UserEntity } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/enums';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function seed() {
  const dataSource = new DataSource(typeOrmConfig);
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(UserEntity);

  const adminUser = userRepo.create([
    {
      name: 'admin',
      email: 'admin@mail.ru',
      password: await hashPassword('admin'),
      about: 'administrator',
      birthdate: new Date('2000-01-01'),
      city: 'Moscow',
      gender: Gender.MALE,
      avatar: 'admin.png',
      role: UserRole.ADMIN,
      refreshToken: '',
    },
  ]);

  await userRepo.save(adminUser);
  console.log('✅ "admin" user created');
  await dataSource.destroy();
}

seed().catch(console.error);
