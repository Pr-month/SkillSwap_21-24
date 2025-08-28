// test/categories3.e2e-spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { UserEntity } from '../src/users/entities/user.entity';
import { CategoryEntity } from '../src/categories/entities/categories.entity';
import { Gender, UserRole } from '../src/users/enums';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Application } from 'express';

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
  let categoryRepository: Repository<CategoryEntity>;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    categoryRepository = moduleFixture.get<Repository<CategoryEntity>>(
      getRepositoryToken(CategoryEntity),
    );

    // Очищаем базу данных перед тестами
    try {
      await categoryRepository.query(
        'TRUNCATE TABLE categories RESTART IDENTITY CASCADE',
      );
      await userRepository.query(
        'TRUNCATE TABLE users RESTART IDENTITY CASCADE',
      );
    } catch (e) {
      console.error('Error truncating tables:', e);
    }

    // Создаем тестовых пользователей
    await createTestUsers();

    // Создаем тестовые категории
    await createTestCategories();
  }, 30000); // Увеличиваем таймаут для beforeAll

  // Создание тестовых пользователей
  async function createTestUsers() {
    // Создаем администратора
    const admin = userRepository.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: await bcrypt.hash('admin123', 10),
      about: 'Admin user',
      birthdate: new Date('1990-01-01'),
      city: 'Test City',
      gender: Gender.MALE,
      avatar: 'admin-avatar.jpg',
      role: UserRole.ADMIN,
      refreshToken: '',
    });
    await userRepository.save(admin);

    // Создаем обычного пользователя
    const user = userRepository.create({
      name: 'Regular User',
      email: 'user@test.com',
      password: await bcrypt.hash('user123', 10),
      about: 'Regular user',
      birthdate: new Date('1995-01-01'),
      city: 'User City',
      gender: Gender.FEMALE,
      avatar: 'user-avatar.jpg',
      role: UserRole.USER,
      refreshToken: '',
    });
    await userRepository.save(user);

    // Генерируем токены
    adminToken = jwtService.sign({
      sub: admin.id,
      email: admin.email,
      roles: [admin.role],
    });

    userToken = jwtService.sign({
      sub: user.id,
      email: user.email,
      roles: [user.role],
    });
  }

  // Создание тестовых категорий
  async function createTestCategories() {
    // Создаем основную категорию
    const parentCategory = categoryRepository.create({
      name: 'Test Parent Category',
      parent: null,
    });
    const savedParent = await categoryRepository.save(parentCategory);

    // Создаем подкатегорию
    const childCategory = categoryRepository.create({
      name: 'Test Child Category',
      parent: savedParent,
    });
    await categoryRepository.save(childCategory);
  }

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
        (cat: ITestCategory) => cat.name === 'Test Parent Category',
      );

      expect(parentCategory).toBeDefined();

      if (parentCategory) {
        // Проверяем, что у родительской категории есть одна дочерняя
        expect(parentCategory.children).toHaveLength(1);

        const childCategory = parentCategory.children[0];
        expect(childCategory.name).toBe('Test Child Category');
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
