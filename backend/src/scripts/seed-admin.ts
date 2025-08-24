import 'reflect-metadata';

import { AppDataSource } from '../config/typeorm.config';
import { UserEntity } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/enums';

const data = {
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

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(UserEntity);

  const adminUser = userRepo.create(data);
  await userRepo.save(adminUser);

  console.log(
    `✅ "${adminUser.name}" (${adminUser.email}) - ${adminUser.role} пользователь создан`,
  );
  await AppDataSource.destroy();
}

seed().catch(console.error);
