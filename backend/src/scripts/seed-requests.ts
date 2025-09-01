import 'reflect-metadata';
import { AppDataSource } from '../config/typeorm.config';
import { RequestEntity } from '../requests/entities/request.entity';
import { RequestStatus } from '../common/constants';
import { SkillEntity } from '../skills/entities/skills.entity';
import { UserEntity } from '../users/entities/user.entity';
import { execSync } from 'child_process';

async function seed() {
  console.log('🚀 Запуск сидирования заявок...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Подключение к базе данных установлено.');

    const requestRepo = AppDataSource.getRepository(RequestEntity);
    const skillRepo = AppDataSource.getRepository(SkillEntity);
    const userRepo = AppDataSource.getRepository(UserEntity);

    const existingRequestsCount = await requestRepo.count();
    if (existingRequestsCount > 0) {
      console.log(
        '⚠️ Заявки уже существуют в базе данных. Сидинг пропускается.',
      );
      await AppDataSource.destroy();
      return;
    }

    const existingUsersCount = await userRepo.count();
    if (existingUsersCount === 0) {
      console.log('Пользователей нет, создаем их...');
      execSync('npm run seed:users');
    }

    const allUsers = await userRepo.find();

    const existingSkillsCount = await skillRepo.count();
    if (existingSkillsCount === 0) {
      console.log('Навыков нет, создаем их...');
      execSync('npm run seed:skills');
    }

    const allSkills = await skillRepo.find();

    const requestsData = [
      {
        sender: allUsers[0],
        receiver: allUsers[1],
        status: RequestStatus.ACCEPTED,
        offeredSkill: allSkills[0],
        requestedSkill: allSkills[1],
        isRead: true,
      },
      {
        sender: allUsers[1],
        receiver: allUsers[0],
        status: RequestStatus.REJECTED,
        offeredSkill: allSkills[1],
        requestedSkill: allSkills[0],
        isRead: false,
      },
      {
        sender: allUsers[0],
        receiver: allUsers[1],
        status: RequestStatus.PENDING,
        offeredSkill: allSkills[0],
        requestedSkill: allSkills[1],
        isRead: false,
      },
    ];

    const testRequests = requestRepo.create(requestsData);
    await requestRepo.save(testRequests);

    console.log('✅ Тестовые заявки успешно созданы!');
    console.log('📋 Список созданных заявок:');
    testRequests.forEach((req) => {
      console.log(
        `Заявка #${req.id}: ${req.sender.name} -> ${req.receiver.name}, статус: ${req.status}`,
      );
    });

    await AppDataSource.destroy();
    console.log('✅ Сидирование заявок завершено успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении сидинга заявок:', error);
    process.exit(1);
  }
}

seed().catch((error) => {
  console.error('❌ Критическая ошибка сидинга:', error);
  process.exit(1);
});
