import 'reflect-metadata';

import { AppDataSource } from '../config/typeorm.config';
import { UserEntity } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/enums';

const data = [
  {
    name: 'Ivan Ivanov',
    email: 'ivan@mail.ru',
    password: 'password123',
    about: 'Frontend developer with 3 years of experience',
    birthdate: new Date('2000-01-01'),
    city: 'Moscow',
    gender: Gender.MALE,
    avatar: 'ivan.png',
    role: UserRole.USER,
    refreshToken: '',
  },
  {
    name: 'Vasya Pupkin',
    email: 'vasya@mail.ru',
    password: 'password123',
    about: 'Backend developer and system administrator',
    birthdate: new Date('1995-05-15'),
    city: 'Saint Petersburg',
    gender: Gender.MALE,
    avatar: 'vasya.png',
    role: UserRole.USER,
    refreshToken: '',
  },
];

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(UserEntity);

  const testUsers = userRepo.create(data);
  await userRepo.save(testUsers);

  console.log('✅ Тестовые пользователи успешно созданы!');
  console.log('👥 Созданы пользователи:');
  testUsers.forEach((user) => {
    console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
  });

  await AppDataSource.destroy();
}

seed().catch(console.error);
