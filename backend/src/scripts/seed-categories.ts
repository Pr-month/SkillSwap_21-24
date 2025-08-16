import { AppDataSource } from '../config/typeorm.config';
import { CategoryEntity } from '../categories/entities/categories.entity';

// Данные для сидинга
const CategoriesData = [
  {
    name: 'Творчество и искусство',
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
    name: 'IT и программирование',
    children: [
      'Frontend',
      'Backend',
      'DevOps',
      'Мобильная разработка',
      'GameDev',
    ],
  },
  {
    name: 'Дизайн и UX/UI',
    children: ['Графический дизайн', 'UX/UI', 'Motion-дизайн', 'Web-дизайн'],
  },
  {
    name: 'Финансы и бухгалтерия',
    children: [
      'Личная финансовая грамотность',
      'Бухгалтерия и налоги',
      'Инвестиции',
    ],
  },
  {
    name: 'Маркетинг и продажи',
    children: ['Таргетинг', 'Контекстная реклама', 'SEO', 'Email-маркетинг'],
  },
  {
    name: 'Образование и обучение',
    children: ['Методика преподавания', 'Онлайн-курсы', 'Педагогика'],
  },
  {
    name: 'Языки',
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
    name: 'Музыкальные инструменты',
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
  await AppDataSource.initialize(); // Используем подключение из config/ormconfig.ts
  const categoryRepo = AppDataSource.getRepository(CategoryEntity);

  const existing = await categoryRepo.count();
  if (existing > 0) {
    // Устанавливаем данные только в том случае, если таблица пустая
    console.log('Категории уже существуют в базе данных. Сидинг пропущен.');
    await AppDataSource.destroy();
    return;
  }

  try {
    console.log('Начинаем сидинг категорий...');

    // Создаем категории и подкатегории
    for (const categoryData of CategoriesData) {
      // Создаем основную категорию
      const parentCategory = new CategoryEntity();
      parentCategory.name = categoryData.name;
      parentCategory.parent = null;

      const savedParent = await categoryRepo.save(parentCategory);
      console.log(`Создана категория: ${savedParent.name}`);

      // Создаем подкатегории
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

    console.log('✅ Сидинг категорий успешно завершен!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении сидинга:', error);
    throw error;
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((e) => {
  console.error('❌ Критическая ошибка сидинга:', e);
  process.exit(1);
});
