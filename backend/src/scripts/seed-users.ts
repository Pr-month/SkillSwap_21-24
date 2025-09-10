import 'reflect-metadata';

import { UserEntity } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/enums';

import { createSafeDataSource } from './db.safe';

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
  const ds = createSafeDataSource();
  await ds.initialize();

  const qr = ds.createQueryRunner();
  try {
    const hasUsers = await qr.hasTable('users');
    if (!hasUsers) {
      console.log('⚠️ Таблица users отсутствует. Создаю схему…');
      await ds.synchronize();
    }
  } finally {
    await qr.release();
  }

  try {
    const repo = ds.getRepository(UserEntity);
    const testUsers = repo.create(data);
    await repo.save(testUsers);

    console.log('✅ Тестовые пользователи успешно созданы!');
    console.log('👥 Созданы пользователи:');
    testUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
  } finally {
    await ds.destroy();
  }
}

seed().catch(console.error);
