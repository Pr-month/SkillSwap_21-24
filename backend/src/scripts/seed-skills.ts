import 'reflect-metadata';
import { AppDataSource } from '../config/typeorm.config';
import { SkillEntity } from 'src/skills/entities/skills.entity';

async function seed() {
  console.log('🚀 Запуск сидинга навыков...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Подключение к базе данных установлено');

    const skillRepo = AppDataSource.getRepository(SkillEntity);

    const existingSkills = await skillRepo.count();
    if (existingSkills > 0) {
      console.log('⚠️  Навыки уже существуют в базе данных. Сидинг пропущен.');
      await AppDataSource.destroy();
      return;
    }

    /**
     * TODO: Creating test skills
     **/

    await AppDataSource.destroy();
    console.log('✅ Сидинг навыков завершен успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении сидинга навыков:', error);
    process.exit(1);
  }
}

seed().catch((error) => {
  console.error('❌ Критическая ошибка сидинга:', error);
  process.exit(1);
});
