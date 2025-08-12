import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { AppConfigType } from './config/config.type';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { CategoriesModule } from './categories/categories.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RefreshTokenStrategy } from './auth/strategies/refresh-token.strategy';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/all-exception.filter';
import { FilesModule } from './files/files.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/logger-winstone.config';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [configuration.KEY],
      useFactory: (config: AppConfigType) => ({
        ...config.db,
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [configuration.KEY],
      useFactory: (config: AppConfigType) => ({
        secret: config.jwt.jwtSecret,
        signOptions: {
          expiresIn: config.jwt.accessExpiresIn, //Время жизни токена
        },
      }),
    }),
    UsersModule,
    SkillsModule,
    CategoriesModule,
    FilesModule,
    AuthModule,
    
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    RefreshTokenStrategy,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [JwtStrategy, RefreshTokenStrategy],
})
export class AppModule {}
