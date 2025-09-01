import { Test } from '@nestjs/testing';
import request from 'supertest';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';

describe('Integration Tests for Files Upload', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Successfully upload a valid image file', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/upload')
      .attach('file', `${__dirname}/../fixtures/test-image.png`)
      .expect(200);

    expect(response.body).toHaveProperty('originalName');
    expect(response.body).toHaveProperty('savedAs');
    expect(response.body).toHaveProperty('size');
  });

  it('Reject invalid file formats', async () => {
    const response = await request(app.getHttpServer())
      .post('/files/upload')
      .attach('file', `${__dirname}/../fixtures/test-text.txt`)
      .expect(422);

    expect(response.text).toContain('Validation failed');
  });

  it('Reject oversized images', async () => {
    const largeImagePath = `${__dirname}/../fixtures/large-test-image.jpg`;
    const response = await request(app.getHttpServer())
      .post('/files/upload')
      .attach('file', largeImagePath)
      .expect(422);

    expect(response.text).toContain('Maximum file size exceeded');
  });
});
