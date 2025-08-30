import 'reflect-metadata';
import { AppDataSource } from '../config/typeorm.config';
import { RequestEntity } from '../requests/entities/request.entity';
import { RequestStatus } from '../common/constants';
import { SkillEntity } from '../skills/entities/skills.entity';
import { UserEntity } from '../users/entities/user.entity';

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
      console.log('⚠️ Заявки уже существуют в базе данных. Сидинг пропускается.');
      await AppDataSource.destroy();
      return;
    }

    const skillsData = [
      { title: 'JavaScript', description: 'Опыт программирования на JS' },
      { title: 'Python', description: 'Навыки Python-разработчика' },
    ];
    const testSkills = skillRepo.create(skillsData);
    await skillRepo.save(testSkills);

    const usersData = [
      { name: 'Иван Иванов', email: 'ivan@example.com', password: 'password123' },
      { name: 'Василий Петров', email: 'vasya@example.com', password: 'password456' },
    ];
    const testUsers = userRepo.create(usersData);
    await userRepo.save(testUsers);

    const requestsData = [
      {
        sender: testUsers[0],
        receiver: testUsers[1],
        status: RequestStatus.ACCEPTED,
        offeredSkill: testSkills[0],
        requestedSkill: testSkills[1],
        isRead: true,
      },
      {
        sender: testUsers[1],
        receiver: testUsers[0],
        status: RequestStatus.REJECTED,
        offeredSkill: testSkills[1],
        requestedSkill: testSkills[0],
        isRead: false,
      },
      {
        sender: testUsers[0],
        receiver: testUsers[1],
        status: RequestStatus.PENDING,
        offeredSkill: testSkills[0],
        requestedSkill: testSkills[1],
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
