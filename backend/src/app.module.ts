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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [configuration.KEY],
      useFactory: (config: AppConfigType) => ({
        ...config.db,
      }),
    }),
    JwtModule.registerAsync({
      inject: [configuration.KEY],
      useFactory: (config: AppConfigType) => ({
        secret: config.jwtSecret,
      }),
    }),
    UsersModule,
    SkillsModule,
    CategoriesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
