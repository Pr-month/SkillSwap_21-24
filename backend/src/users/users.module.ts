import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserEntity } from './entities/user.entity';
import { SkillEntity } from 'src/skills/entities/skills.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SkillEntity])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
