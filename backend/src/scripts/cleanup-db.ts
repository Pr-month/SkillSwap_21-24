import { AppDataSource } from '../config/typeorm.config';

async function clearDatabase() {
  const ds = await AppDataSource.initialize();

  await ds.dropDatabase();
  await ds.synchronize();

  await ds.destroy();
}

clearDatabase()
  .then(() => {
    console.log('Database cleared successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error clearing database', err);
    process.exit(1);
  });
