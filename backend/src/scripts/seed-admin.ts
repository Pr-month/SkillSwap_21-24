import 'reflect-metadata';

import { AppDataSource } from '../config/typeorm.config';
import { UserEntity } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/enums';

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(UserEntity);

  const adminData = {
    name: 'admin',
    email: 'admin@mail.ru',
    password: 'admin',
    about: 'administrator',
    birthdate: new Date('2000-01-01'),
    city: 'Moscow',
    gender: Gender.MALE,
    avatar: 'admin.png',
    role: UserRole.ADMIN,
    refreshToken: '',
  };

  const adminUser = userRepo.create(adminData);
  await userRepo.save(adminUser);

  console.log(`✅ ${adminData.name} user created`);
  await AppDataSource.destroy();
}

seed().catch(console.error);
