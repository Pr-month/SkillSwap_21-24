import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  RegisterUser,
  LoginUser,
  AuthResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from '../src/auth/auth.types';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CategoryEntity } from '../src/categories/entities/categories.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let categoryRepository: Repository<CategoryEntity>;

  // Тестовые данные
  const testCategory: { name: string } = {
    name: 'Test Category',
  };

  const testUser: RegisterUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123',
    about: 'Test user for e2e tests',
    birthdate: '1990-01-01',
    city: 'Test City',
    gender: 'male',
    avatar: 'https://example.com/avatar.jpg',
    category: 1, // Будет обновлен после создания категории
  };

  const loginUser: LoginUser = {
    email: 'test@example.com',
    password: 'testpassword123',
  };

  let refreshToken: string;

  // Вспомогательная функция для обновления токенов
  const updateTokens = (body: AuthResponse | RefreshTokenResponse) => {
    refreshToken = body.refreshToken;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Получаем репозитории
    userRepository = moduleFixture.get(getRepositoryToken(UserEntity));
    categoryRepository = moduleFixture.get(getRepositoryToken(CategoryEntity));

    // Очищаем данные перед тестами
    if (userRepository) {
      await userRepository.query('DELETE FROM user_want_to_learn');
      await userRepository.query('DELETE FROM users');
    }
    if (categoryRepository) {
      await categoryRepository.query('DELETE FROM categories');

      // Создаем тестовую категорию
      const category = await categoryRepository.save(testCategory);
      testUser.category = category.id;
    }
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          const body: AuthResponse = res.body as AuthResponse;
          expect(body.success).toBe(true);
          expect(body.refreshToken).toBeDefined();

          // Сохраняем токены для последующих тестов
          updateTokens(body);
        });
    }, 10000);

    it('should not register a user with existing email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);
    }, 10000);
  });

  describe('/auth/login (POST)', () => {
    it('should login an existing user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginUser)
        .expect(201)
        .expect((res) => {
          const body: AuthResponse = res.body as AuthResponse;
          expect(body.success).toBe(true);
          expect(body.refreshToken).toBeDefined();

          // Обновляем токены
          updateTokens(body);
        });
    }, 10000);

    it('should not login with incorrect email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          ...loginUser,
          email: 'wrong@example.com',
        })
        .expect(401);
    }, 10000);

    it('should not login with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          ...loginUser,
          password: 'wrongpassword',
        })
        .expect(401);
    }, 10000);
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(201)
        .expect((res) => {
          const body: RefreshTokenResponse = res.body as RefreshTokenResponse;
          expect(body.success).toBe(true);
          expect(body.refreshToken).toBeDefined();
          expect(body.refreshToken).not.toBe(refreshToken);

          updateTokens(body);
        });
    }, 10000);

    it('should not refresh tokens with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    }, 10000);

    it('should not refresh tokens without authorization header', () => {
      return request(app.getHttpServer()).post('/auth/refresh').expect(401);
    }, 10000);
  });

  describe('/auth/logout (POST)', () => {
    it('should logout user with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(201)
        .expect((res) => {
          const body: LogoutResponse = res.body as LogoutResponse;
          expect(body.success).toBe(true);
        });
    }, 10000);

    it('should not logout user with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    }, 10000);

    it('should not logout user without authorization header', () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(401);
    }, 10000);
  });
});
