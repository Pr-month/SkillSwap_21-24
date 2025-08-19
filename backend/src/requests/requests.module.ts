import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RequestEntity } from './entities/request.entity';
import { UserEntity } from '../users/entities/user.entity';
import { SkillEntity } from '../skills/entities/skills.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity, UserEntity, SkillEntity])],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
