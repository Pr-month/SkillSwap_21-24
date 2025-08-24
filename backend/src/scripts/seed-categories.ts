import 'reflect-metadata';

import { AppDataSource } from '../config/typeorm.config';
import { CategoryEntity } from '../categories/entities/categories.entity';

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
  await AppDataSource.initialize();
  const categoryRepo = AppDataSource.getRepository(CategoryEntity);

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

  console.log('✅ Категории успешно добавлены!');
}

seed().catch(console.error);
