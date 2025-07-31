import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfigType } from '../config/config.type';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = configService.get<AppConfigType>('APP_CONFIG')!;
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.port);
}
void bootstrap();
