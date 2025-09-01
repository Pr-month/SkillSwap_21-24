import 'reflect-metadata';
import { AppDataSource } from '../config/typeorm.config';
import { UserEntity } from '../users/entities/user.entity';
import { Gender, UserRole } from '../users/enums';

async function seed() {
  console.log('🚀 Запуск сидинга пользователей...');
  try {
    await AppDataSource.initialize();
    console.log('✅ Подключение к базе данных установлено');

    const userRepo = AppDataSource.getRepository(UserEntity);

    // Проверяем, есть ли уже пользователи
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
      console.log(
        '⚠️  Пользователи уже существуют в базе данных. Сидинг пропущен.',
      );
      await AppDataSource.destroy();
      return;
    }

    // Создаем тестовых пользователей
    const usersData = [
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
        password: 'admin123',
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

    await AppDataSource.destroy();
    console.log('✅ Сидинг пользователей завершен успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении сидинга пользователей:', error);
    process.exit(1);
  }
}

seed().catch((error) => {
  console.error('❌ Критическая ошибка сидинга:', error);
  process.exit(1);
});
