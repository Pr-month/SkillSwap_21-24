import 'reflect-metadata';

import { UserEntity } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/enums';
import { createSafeDataSource } from './db.safe';

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
    const exists = await repo.findOne({ where: { name: data.name } });
    if (exists) {
      console.log('ℹ️ Админ уже существует — пропуск.');
      return;
    }

    await repo.save(repo.create(data));
    console.log(`✅ "${data.name}" (${data.email}) создан`);
  } finally {
    await ds.destroy();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
