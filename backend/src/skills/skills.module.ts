import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { CategoryEntity } from '../categories/entities/categories.entity';

import { SkillsService } from './skills.service';
import { SkillsController } from './skills.controller';
import { SkillEntity } from './entities/skills.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkillEntity, UserEntity, CategoryEntity]),
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SkillsModule {}
