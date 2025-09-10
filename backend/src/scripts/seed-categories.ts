import 'reflect-metadata';

import { CategoryEntity } from '../categories/entities/categories.entity';

import { createSafeDataSource } from './db.safe';

const data = [
  {
    parent: 'Творчество и искусство',
    children: [
      'Управление командой',
      'Маркетинг и реклама',
      'Продажи и переговоры',
      'Личный бренд',
      'Резюме и собеседование',
      'Тайм-менеджмент',
      'Проектное управление',
      'Предпринимательство',
    ],
  },
  {
    parent: 'IT и программирование',
    children: [
      'Frontend',
      'Backend',
      'DevOps',
      'Мобильная разработка',
      'GameDev',
    ],
  },
  {
    parent: 'Дизайн и UX/UI',
    children: ['Графический дизайн', 'UX/UI', 'Motion-дизайн', 'Web-дизайн'],
  },
  {
    parent: 'Финансы и бухгалтерия',
    children: [
      'Личная финансовая грамотность',
      'Бухгалтерия и налоги',
      'Инвестиции',
    ],
  },
  {
    parent: 'Маркетинг и продажи',
    children: ['Таргетинг', 'Контекстная реклама', 'SEO', 'Email-маркетинг'],
  },
  {
    parent: 'Образование и обучение',
    children: ['Методика преподавания', 'Онлайн-курсы', 'Педагогика'],
  },
  {
    parent: 'Языки',
    children: [
      'Английский язык',
      'Немецкий язык',
      'Французский язык',
      'Испанский язык',
      'Китайский язык',
      'Русский язык',
    ],
  },
  {
    parent: 'Музыкальные инструменты',
    children: [
      'Гитара',
      'Фортепиано',
      'Скрипка',
      'Ударные',
      'Вокал',
      'Бас-гитара',
      'Саксофон',
    ],
  },
];

async function seed() {
  const ds = createSafeDataSource();
  await ds.initialize();

  const qr = ds.createQueryRunner();
  try {
    const hasCategories = await qr.hasTable('categories');
    if (!hasCategories) {
      console.log('⚠️ Таблица categories отсутствует. Создаю схему…');
      await ds.synchronize();
    }
  } finally {
    await qr.release();
  }

  try {
    const categoryRepo = ds.getRepository(CategoryEntity);

    for (const categoryData of data) {
      const parentCategory = new CategoryEntity();
      parentCategory.name = categoryData.parent;
      parentCategory.parent = null;

      const savedParent = await categoryRepo.save(parentCategory);
      console.log(`Создана категория: ${savedParent.name}`);

      if (categoryData.children && Array.isArray(categoryData.children)) {
        for (const childName of categoryData.children) {
          const childCategory = new CategoryEntity();
          childCategory.name = childName;
          childCategory.parent = savedParent;

          await categoryRepo.save(childCategory);
          console.log(`  Создана подкатегория: ${childName}`);
        }
      }
    }
  } finally {
    await ds.destroy();
  }

  console.log('✅ Категории успешно добавлены!');
}

seed().catch(console.error);
