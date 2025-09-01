import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { UserEntity } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from 'express';
import { seedCategories } from '../src/scripts/seed-categories';
import { seedUsers } from '../src/scripts/seed-users';
import { DataSource } from 'typeorm';

// Определяем интерфейсы для типизации ответов
interface ITestCategory {
  id: number;
  name: string;
  parent: ITestCategory | null;
  children: ITestCategory[];
}

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<UserEntity>;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let testAdminUser: UserEntity | null;
  let testRegularUser: UserEntity | null;

  beforeAll(async () => {
    // 1. Создаем и инициализируем приложение NestJS
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 2. Получаем необходимые зависимости
    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // 3. Запускаем скрипты сидинга, передавая существующий dataSource
    console.log('Запуск скриптов сидинга...');
    await seedCategories(dataSource); // Используем тот же dataSource
    await seedUsers(dataSource); // Используем тот же dataSource
    console.log('Скрипты сидинга выполнены.');

    // 4. Получаем созданных пользователей
    testAdminUser = await userRepository.findOne({
      where: { email: 'vasya@mail.ru' },
    });
    testRegularUser = await userRepository.findOne({
      where: { email: 'ivan@mail.ru' },
    });

    console.log('Найденные пользователи:', {
      admin: testAdminUser?.email,
      user: testRegularUser?.email,
    });

    if (!testAdminUser || !testRegularUser) {
      throw new Error('Не удалось найти тестовых пользователей после сидинга');
    }

    // 5. Генерируем токены для тестов
    adminToken = jwtService.sign({
      sub: testAdminUser.id,
      email: testAdminUser.email,
      roles: [testAdminUser.role],
    });

    userToken = jwtService.sign({
      sub: testRegularUser.id,
      email: testRegularUser.email,
      roles: [testRegularUser.role],
    });
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /categories', () => {
    it('should return array of categories with children', async () => {
      const response = await request(app.getHttpServer() as Application)
        .get('/categories')
        .expect(200);

      // Проверяем, что ответ - массив
      expect(Array.isArray(response.body)).toBe(true);

      // Проверяем, что массив не пустой
      expect((response.body as unknown[]).length).toBeGreaterThanOrEqual(1);

      // Проверяем структуру первой категории
      const responseBodyArray = response.body as unknown[];
      if (responseBodyArray.length > 0) {
        const firstCategoryRaw = responseBodyArray[0];

        // Явно проверяем наличие полей перед доступом
        expect(firstCategoryRaw).toHaveProperty('id');
        expect(firstCategoryRaw).toHaveProperty('name');
        expect(firstCategoryRaw).toHaveProperty('children');

        // Проверяем типы полей
        const firstCategory = firstCategoryRaw as ITestCategory;
        expect(typeof firstCategory.id).toBe('number');
        expect(typeof firstCategory.name).toBe('string');
        expect(Array.isArray(firstCategory.children)).toBe(true);
      }
    });

    it('should return categories with proper parent-child relationships', async () => {
      const response = await request(app.getHttpServer() as Application)
        .get('/categories')
        .expect(200);

      // Явно типизируем ответ
      const categories: ITestCategory[] = response.body as ITestCategory[];

      // Ищем родительскую категорию
      const parentCategory = categories.find(
        (cat: ITestCategory) => cat.name === 'Творчество и искусство',
      );

      expect(parentCategory).toBeDefined();

      if (parentCategory) {
        // Проверяем, что у родительской категории есть дочерние категории (8 штук из сидинга)
        expect(parentCategory.children.length).toBeGreaterThan(0);

        // Проверяем, что первая дочерняя категория имеет правильное имя
        const firstChild = parentCategory.children[0];
        expect(firstChild.name).toBe('Управление командой'); // Первая категория из сидинга
      }
    });
  });

  describe('POST /categories', () => {
    const createCategoryDto = {
      name: 'New Test Category',
      parentId: null,
    };

    it('should create child category with valid parentId', async () => {
      // Сначала получаем ID существующей категории
      const categoriesResponse = await request(
        app.getHttpServer() as Application,
      )
        .get('/categories')
        .expect(200);

      const categories: ITestCategory[] =
        categoriesResponse.body as ITestCategory[];
      const parentId = categories.length > 0 ? categories[0].id : null;

      if (parentId) {
        await request(app.getHttpServer() as Application)
          .post('/categories')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'New Child Category',
            parentId: parentId,
          })
          .expect(201);
      }
    });

    it('should fail to create category without authentication', async () => {
      await request(app.getHttpServer() as Application)
        .post('/categories')
        .send(createCategoryDto)
        .expect(401);
    });

    it('should fail to create category with user token (insufficient permissions)', async () => {
      await request(app.getHttpServer() as Application)
        .post('/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(createCategoryDto)
        .expect(403);
    });

    // Тесты с специальными символами в названии
    it('should handle special characters in category name', async () => {
      const specialName =
        'Category with spéciål chàräctërs & symbols!@#$%^&*()';

      const response = await request(app.getHttpServer() as Application)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: specialName })
        .expect(201);

      const createdCategory: ITestCategory = response.body as ITestCategory;
      expect(createdCategory.name).toBe(specialName);
    });
  });

  describe('PATCH /categories/:id', () => {
    let categoryId: number | null = null;

    beforeEach(async () => {
      // Получаем ID категории для обновления
      const response = await request(app.getHttpServer() as Application)
        .get('/categories')
        .expect(200);

      const categories: ITestCategory[] = response.body as ITestCategory[];
      categoryId = categories.length > 0 ? categories[0].id : null;
    });

    it('should update category successfully with admin token', async () => {
      if (categoryId) {
        const updateDto = {
          name: 'Updated Category Name',
        };

        const response = await request(app.getHttpServer() as Application)
          .patch(`/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateDto)
          .expect(200);

        const updatedCategory: ITestCategory = response.body as ITestCategory;
        expect(updatedCategory.name).toBe(updateDto.name);
        expect(updatedCategory.id).toBe(categoryId);
      }
    });

    it('should partially update category', async () => {
      if (categoryId) {
        const updateDto = {
          name: 'Partially Updated Name',
        };

        const response = await request(app.getHttpServer() as Application)
          .patch(`/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updateDto)
          .expect(200);

        const updatedCategory: ITestCategory = response.body as ITestCategory;
        expect(updatedCategory.name).toBe(updateDto.name);
      }
    });

    it('should fail to update category without authentication', async () => {
      if (categoryId) {
        await request(app.getHttpServer() as Application)
          .patch(`/categories/${categoryId}`)
          .send({ name: 'Updated Name' })
          .expect(401);
      }
    });

    it('should fail to update category with user token (insufficient permissions)', async () => {
      if (categoryId) {
        await request(app.getHttpServer() as Application)
          .patch(`/categories/${categoryId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ name: 'Updated Name' })
          .expect(403);
      }
    });

    it('should fail to update non-existent category', async () => {
      await request(app.getHttpServer() as Application)
        .patch('/categories/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    let categoryId: number | null = null;

    beforeEach(async () => {
      // Создаем категорию для удаления
      const response = await request(app.getHttpServer() as Application)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Category to delete',
        })
        .expect(201);

      const createdCategory: ITestCategory = response.body as ITestCategory;
      categoryId = createdCategory.id;
    });

    it('should delete category successfully with admin token', async () => {
      if (categoryId) {
        await request(app.getHttpServer() as Application)
          .delete(`/categories/${categoryId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Проверяем, что категория действительно удалена
        await request(app.getHttpServer() as Application)
          .get(`/categories/${categoryId}`)
          .expect(404);
      }
    });

    it('should fail to delete category without authentication', async () => {
      if (categoryId) {
        await request(app.getHttpServer() as Application)
          .delete(`/categories/${categoryId}`)
          .expect(401);
      }
    });

    it('should fail to delete category with user token (insufficient permissions)', async () => {
      if (categoryId) {
        await request(app.getHttpServer() as Application)
          .delete(`/categories/${categoryId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      }
    });

    it('should fail to delete non-existent category', async () => {
      await request(app.getHttpServer() as Application)
        .delete('/categories/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('Error cases', () => {
    it('should return 404 for non-existent category GET request', async () => {
      await request(app.getHttpServer() as Application)
        .get('/categories/99999')
        .expect(404);
    });
  });

  describe('Security tests', () => {
    it('should reject requests with invalid JWT token', async () => {
      await request(app.getHttpServer() as Application)
        .post('/categories')
        .set('Authorization', 'Bearer invalid-token')
        .send({ name: 'Test Category' })
        .expect(401);
    });

    it('should reject requests with expired JWT token', async () => {
      const expiredToken = jwtService.sign(
        { sub: 1, email: 'test@test.com' },
        { expiresIn: '0s' },
      );

      // Ждем немного, чтобы токен точно истек
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await request(app.getHttpServer() as Application)
        .post('/categories')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({ name: 'Test Category' })
        .expect(401);
    });

    it('should reject requests with malformed Authorization header', async () => {
      await request(app.getHttpServer() as Application)
        .post('/categories')
        .set('Authorization', 'InvalidFormat')
        .send({ name: 'Test Category' })
        .expect(401);
    });
  });
});
