import 'reflect-metadata';

import { RequestEntity } from '../requests/entities/request.entity';
import { RequestStatus } from '../common/constants';
import { SkillEntity } from '../skills/entities/skills.entity';
import { UserEntity } from '../users/entities/user.entity';

import { createSafeDataSource } from './db.safe';

async function seed() {
  const ds = createSafeDataSource();
  await ds.initialize();

  const qr = ds.createQueryRunner();
  try {
    const hasUsers = await qr.hasTable('users');
    if (!hasUsers) {
      throw new Error('Таблица users отсутствует. Сначала запусти seed:users');
    }
    const hasSkills = await qr.hasTable('skills');
    if (!hasSkills) {
      throw new Error('Таблица skills не найдены. Проверьте миграции');
    }
  } finally {
    await qr.release();
  }

  try {
    const userRepo = ds.getRepository(UserEntity);
    const skillRepo = ds.getRepository(SkillEntity);
    const requestRepo = ds.getRepository(RequestEntity);

    const allUsers = await userRepo.find();
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
  } finally {
    await ds.destroy();
  }
}

seed().catch((error) => {
  console.error('❌ Критическая ошибка сидинга:', error);
  process.exit(1);
});
