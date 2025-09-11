import 'reflect-metadata';

import { UserEntity } from '../users/entities/user.entity';

import { createSafeDataSource } from './db.safe';
import { usersSeedData as data } from './seed-users-data';

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

seed().catch((error) => {
  console.error('❌ Критическая ошибка сидинга:', error);
  process.exit(1);
});
