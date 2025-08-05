import 'reflect-metadata';
import { DataSource } from 'typeorm';

import typeOrmConfig from '../src/config/typeorm.config';
import {
  Gender,
  UserEntity,
  UserRole,
} from '../src/users/entities/user.entity';

async function seed() {
  const dataSource = new DataSource(typeOrmConfig);
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(UserEntity);

  const testUsers = userRepo.create([
    {
      name: 'Ivan',
      email: 'ivan@mail.ru',
      password: 'hashedpassword1',
      about: 'Frontend developer',
      birthdate: new Date('2000-01-01'),
      city: 'Moscow',
      gender: Gender.MALE,
      avatar: 'ivan.png',
      role: UserRole.USER,
      refreshToken: '',
    },
    {
      name: 'Vasya',
      email: 'vasya@mail.ru',
      password: 'hashedpassword2',
      about: 'Backend developer',
      birthdate: new Date('2000-01-02'),
      city: 'Moscow',
      gender: Gender.MALE,
      avatar: 'vasya.png',
      role: UserRole.ADMIN,
      refreshToken: '',
    },
  ]);

  await userRepo.save(testUsers);
  console.log('✅ Test users created');
  await dataSource.destroy();
}

seed().catch(console.error);
