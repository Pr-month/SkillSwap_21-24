import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppConfigType } from './config/config.type';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const config = configService.get<AppConfigType>('APP_CONFIG')!;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));
  const logger: LoggerService = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  await app.listen(config.port);
}
void bootstrap();
