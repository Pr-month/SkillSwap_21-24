import 'reflect-metadata';

import { UserEntity } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skills.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';

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
    const hasCategories = await qr.hasTable('categories');
    if (!hasCategories) {
      throw new Error(
        'Таблица categories не найдены. Сначала запусти seed:categories',
      );
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
    const categoriesRepo = ds.getRepository(CategoryEntity);
    const skillsRepo = ds.getRepository(SkillEntity);

    const ivan = await userRepo.findOne({ where: { email: 'ivan@mail.ru' } });
    const vasya = await userRepo.findOne({ where: { email: 'vasya@mail.ru' } });
    if (!ivan || !vasya) {
      throw new Error(
        'Тестовые пользователи не найдены. Сначала запусти seed:users',
      );
    }

    const frontend = await categoriesRepo.findOne({
      where: { name: 'Frontend' },
    });
    const backend = await categoriesRepo.findOne({
      where: { name: 'Backend' },
    });
    const devops = await categoriesRepo.findOne({
      where: { name: 'DevOps' },
    });

    if (!frontend || !backend || !devops) {
      throw new Error(
        'Нужные категории не найдены. Сначала запусти seed:categories',
      );
    }

    const skillsData = [
      {
        title: 'React Basics',
        description: 'JSX, компоненты, состояние, эффекты, хуки',
        category: frontend,
        images: ['react1.png', 'react2.png'],
        owner: ivan,
      },
      {
        title: 'TypeScript for FE',
        description: 'TS в React-проектах: типизация пропсов, hooks, generics',
        category: frontend,
        images: ['ts-fe1.png'],
        owner: ivan,
      },
      {
        title: 'Node.js & NestJS',
        description: 'REST API, аутентификация, валидация, TypeORM',
        category: backend,
        images: ['nest1.png', 'nest2.png'],
        owner: vasya,
      },
      {
        title: 'DevOps Basics',
        description: 'CI/CD, Docker, мониторинг, базовый Kubernetes',
        category: devops,
        images: ['devops1.png'],
        owner: vasya,
      },
    ];
    const skillsDataEntities = skillsRepo.create(skillsData);
    const savedSkills = await skillsRepo.save(skillsDataEntities);

    console.log('✅ Скиллы успешно созданы');
    savedSkills.forEach((skill) => {
      console.log(` - ${skill.title} (владелец: ${skill.owner.name})`);
    });
  } finally {
    await ds.destroy();
  }
}

seed().catch((error) => {
  console.error('❌ Критическая ошибка сидинга:', error);
  process.exit(1);
});
