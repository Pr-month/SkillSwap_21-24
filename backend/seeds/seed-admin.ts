import 'reflect-metadata';
import { DataSource } from 'typeorm';

import typeOrmConfig from '../src/config/typeorm.config';
import { UserEntity } from '../src/users/entities/user.entity';
import { Gender, UserRole } from '../src/users/enums';

async function seed() {
  const dataSource = new DataSource(typeOrmConfig);
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(UserEntity);

  const testUsers = userRepo.create([
    {
      name: 'admin',
      email: 'admin@mail.ru',
      password: '$2b$10$ff6zl.RwHX9hWkE5nnEzI.WvuXxrZ8jgiA790yOwnUcvJ57sJCp.6',
      about: 'administrator',
      birthdate: new Date('2000-01-01'),
      city: 'Moscow',
      gender: Gender.MALE,
      avatar: 'admin.png',
      role: UserRole.ADMIN,
      refreshToken: '',
    },
  ]);

  await userRepo.save(testUsers);
  console.log('✅ "admin" user created');
  await dataSource.destroy();
}

seed().catch(console.error);
