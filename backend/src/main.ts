import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { AppConfigType } from './config/config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const config = configService.get<AppConfigType>('APP_CONFIG')!;
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(config.port);
}
void bootstrap();
