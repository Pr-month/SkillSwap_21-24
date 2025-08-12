import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skills.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SkillEntity, CategoryEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [RefreshTokenStrategy, JwtStrategy, AuthService],
  exports: [RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
