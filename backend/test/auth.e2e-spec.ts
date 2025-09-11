import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { App } from 'supertest/types';
import { Gender } from '../src/users/enums';
import { LoginResponseDTO } from '../src/auth/dto/user.dto';
import { adminSeedData as mockAdminData } from '../src/scripts/seed-admin-data';
import { Server } from 'http';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should login seeded admin user', async () => {
      const res = await request(server)
        .post('/auth/register')
        .send({
          name: 'ivan',
          email: 'ivan_new@mail.ru',
          password: 'ivan',
          about: 'ivan',
          birthdate: new Date('2000-01-01'),
          city: 'Moscow',
          gender: Gender.MALE,
          avatar: 'ivan.png',
          category: 1,
          refreshToken: '',
        })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
    it('should reject no category', async () => {
      return request(server)
        .post('/auth/register')
        .send({
          name: 'vasya',
          email: 'vasya_new@mail.ru',
          password: 'vasya',
          about: 'vasya',
          birthdate: new Date('2000-01-01'),
          city: 'Moscow',
          category: -1,
          gender: Gender.MALE,
          avatar: 'vasya.png',
          refreshToken: '',
        })
        .expect(404);
    });
    it('should reject same email', async () => {
      return request(server)
        .post('/auth/register')
        .send({
          name: 'ivan',
          email: 'ivan_new@mail.ru',
          password: 'ivan',
          about: 'ivan',
          birthdate: new Date('2000-01-01'),
          city: 'Moscow',
          gender: Gender.MALE,
          avatar: 'ivan.png',
          category: 1,
          refreshToken: '',
        })
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login seeded admin user', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: mockAdminData.email, password: mockAdminData.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid credentials', async () => {
      return request(server)
        .post('/auth/login')
        .send({ email: 'vasya@mail.ru', password: 'wrongpass' })
        .expect(401);
    });
  });
  describe('POST /auth/refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      const loginRes = await request(server)
        .post('/auth/login')
        .send({ email: mockAdminData.email, password: mockAdminData.password })
        .expect(200);
      const body = loginRes.body as LoginResponseDTO;
      const refreshToken = body.refreshToken;
      const res = await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 404 for expired refresh token', async () => {
      const loginRes = await request(server)
        .post('/auth/login')
        .send({ email: mockAdminData.email, password: mockAdminData.password })
        .expect(200);
      const body = loginRes.body as LoginResponseDTO;
      const refreshToken = body.refreshToken;
      await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ success: true });
        });
      await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(404);
    });

    it('should return 401 for invalid refresh token', async () => {
      await request(server)
        .post('/auth/refresh')
        .set('Authorization', `Bearer invalidtoken`)
        .expect(401);
    });
  });
  describe('/auth/logout (POST)', () => {
    it('should logout user with valid refresh token', async () => {
      const loginRes = await request(server)
        .post('/auth/login')
        .send({ email: mockAdminData.email, password: mockAdminData.password })
        .expect(200);
      const body = loginRes.body as LoginResponseDTO;
      const refreshToken = body.refreshToken;
      await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ success: true });
        });
    });

    it('should return 401 for invalid refresh token', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Authorization', `Bearer invalidtoken`)
        .expect(401);
    });
  });
});
