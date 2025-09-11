import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/common/all-exception.filter';

describe('Integration Tests for Files Upload', () => {
  let app: NestExpressApplication;
  let server: Server;
  const pathToFixtures = `${__dirname}/../test/fixtures/`;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Successfully upload a valid image file', async () => {
    const response = await request(server)
      .post('/files/upload')
      .attach('file', `${pathToFixtures}/test-image.png`)
      .expect(201);

    expect(response.body).toHaveProperty('originalName');
    expect(response.body).toHaveProperty('savedAs');
    expect(response.body).toHaveProperty('size');
  });

  it('Reject invalid file formats', async () => {
    await request(server)
      .post('/files/upload')
      .attach('file', `${pathToFixtures}/test-text.txt`)
      .expect(422);
  });

  it('Reject oversized images', async () => {
    const largeImagePath = `${pathToFixtures}/large-test-image.jpg`;
    await request(server)
      .post('/files/upload')
      .attach('file', largeImagePath)
      .expect(413);
  });
});
