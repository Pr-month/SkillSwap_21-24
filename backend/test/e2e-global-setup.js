const { PostgreSqlContainer } = require('@testcontainers/postgresql');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const DB_NAME = process.env.POSTGRES_DB || 'SkillSwapDB_test';
  const DB_USER = process.env.POSTGRES_USER || 'admin';
  const DB_PASS = process.env.POSTGRES_PASSWORD || 'admin';
  const container = await new PostgreSqlContainer('postgres:17')
    .withDatabase(DB_NAME)
    .withUsername(DB_USER)
    .withPassword(DB_PASS)
    .start();

  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = container.getHost();
  process.env.DB_PORT = String(container.getMappedPort(5432));
  console.log('DB_PORT', process.env.DB_PORT);
  // Сидирование (схема создастся благодаря TYPEORM_SYNCHRONIZE=true)
  try {
    execSync('npm run seed:all',  { env: process.env, stdio: 'inherit' });
  } catch (e) {
    throw new Error('Seeding failed');
  }

  const metaPath = path.join(process.cwd(), 'test','.pg-testcontainer.json');
  fs.writeFileSync(metaPath, JSON.stringify({ id: container.getId() }), 'utf8');
};
