import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/enums';
import { DataSource } from 'typeorm';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Экспортируем функцию сидинга, принимающую dataSource
export async function seedUsers(dataSource?: DataSource) {
  let useDataSource = dataSource;
  let needToInitialize = false;

  // Если dataSource не передан, создаем новый
  if (!useDataSource) {
    const { AppDataSource } = await import('../config/typeorm.config');
    useDataSource = AppDataSource;
    needToInitialize = true;
  }

  if (needToInitialize) {
    await useDataSource.initialize();
  }

  console.log('🚀 Запуск сидинга пользователей...');

  try {
    const userRepo = useDataSource.getRepository(UserEntity);

    // Проверяем, есть ли уже пользователи
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
      console.log(
        '⚠️  Пользователи уже существуют в базе данных. Сидинг пропущен.',
      );
      if (needToInitialize) {
        await useDataSource.destroy();
      }
      return;
    }

    // Создаем тестовых пользователей
    const usersData = [
      {
        name: 'Ivan Ivanov',
        email: 'ivan@mail.ru',
        password: await hashPassword('password123'),
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
        password: await hashPassword('admin123'),
        about: 'Backend developer and system administrator',
        birthdate: new Date('1995-05-15'),
        city: 'Saint Petersburg',
        gender: Gender.MALE,
        avatar: 'vasya.png',
        role: UserRole.ADMIN,
        refreshToken: '',
      },
    ];

    const testUsers = userRepo.create(usersData);
    await userRepo.save(testUsers);

    console.log('✅ Тестовые пользователи успешно созданы!');
    console.log('👥 Созданы пользователи:');
    testUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('🔑 Тестовые учетные данные:');
    console.log('   Администратор: vasya@mail.ru / admin123');
    console.log('   Пользователь: ivan@mail.ru / password123');

    if (needToInitialize) {
      await useDataSource.destroy();
    }
    console.log('✅ Сидинг пользователей завершен успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении сидинга пользователей:', error);
    if (needToInitialize) {
      await useDataSource.destroy();
    }
    if (!dataSource) {
      process.exit(1);
    }
    throw error;
  }
}

// Если файл запущен напрямую (не как модуль)
if (require.main === module) {
  seedUsers().catch((error) => {
    console.error('❌ Критическая ошибка сидинга:', error);
    process.exit(1);
  });
}
