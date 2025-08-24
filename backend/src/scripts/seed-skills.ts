import 'reflect-metadata';

import { AppDataSource } from '../config/typeorm.config';
import { UserEntity } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skills.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';

async function seed() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(UserEntity);
  const categoriesRepo = AppDataSource.getRepository(CategoryEntity);
  const skillsRepo = AppDataSource.getRepository(SkillEntity);

  const ivan = await userRepo.findOne({ where: { email: 'ivan@mail.ru' } });
  const vasya = await userRepo.findOne({ where: { email: 'vasya@mail.ru' } });

  if (!ivan || !vasya) {
    throw new Error(
      'Тестовые пользователи не найдены. Сначала запусти seed-users.ts',
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
      'Нужные категории не найдены. Сначала запусти seed-categories.ts',
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

  await skillsRepo.save(skillsData);

  console.log('✅ Скиллы успешно созданы');
  skillsData.forEach((skill) => {
    console.log(` - ${skill.title} (владелец: ${skill.owner.name})`);
  });
  await AppDataSource.destroy();
}

seed().catch(console.error);
